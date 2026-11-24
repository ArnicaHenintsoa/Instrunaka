<?php

namespace App\Console\Commands;

use App\Models\InstrumentalFile;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class MigratePrivateFiles extends Command
{
    protected $signature = 'instrunaka:migrate-private-files';
    protected $description = 'Déplace les anciens fichiers MP3/WAV du disque public vers le disque privé.';

    public function handle()
    {
        $files = InstrumentalFile::whereIn('type', ['mp3', 'wav'])->get();
        $bar = $this->output->createProgressBar($files->count());

        foreach ($files as $file) {
            $oldPath = $file->path;
            if (Storage::disk('public')->exists($oldPath) && !Storage::disk('local')->exists($oldPath)) {
                $newPath = 'audio/' . $file->instrumental_id . '/' . basename($oldPath);
                Storage::disk('local')->put($newPath, Storage::disk('public')->get($oldPath));
                Storage::disk('public')->delete($oldPath);
                $file->update(['path' => $newPath]);
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Migration terminée.');
    }
}