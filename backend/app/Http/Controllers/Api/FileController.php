<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    public function serve(string $path)
    {
        if (str_contains($path, '..')) {
            abort(403);
        }

        // Liste blanche stricte : seul le public est servi
        $allowedPrefixes = ['covers/', 'previews/'];
        $isAllowed = false;
        foreach ($allowedPrefixes as $prefix) {
            if (str_starts_with($path, $prefix)) {
                $isAllowed = true;
                break;
            }
        }

        if (!$isAllowed) {
            abort(403, 'Accès interdit à ce fichier.');
        }

        $disk = Storage::disk('public');
        abort_unless($disk->exists($path), 404, 'Fichier introuvable.');

        $mime = $disk->mimeType($path);
        $size = $disk->size($path);

        return response()->stream(function () use ($disk, $path) {
            $stream = $disk->readStream($path);
            fpassthru($stream);
            fclose($stream);
        }, 200, [
            'Content-Type'   => $mime,
            'Content-Length' => $size,
            'Cache-Control'  => 'public, max-age=3600',
        ]);
    }
}