<?php

namespace Database\Seeders;

use App\Models\Mood;
use Illuminate\Database\Seeder;

class MoodSeeder extends Seeder
{
    public function run(): void
    {
        $moods = [
            ['name' => 'dark',        'label' => 'Sombre'],
            ['name' => 'happy',       'label' => 'Joyeux'],
            ['name' => 'melancholic', 'label' => 'Mélancolique'],
            ['name' => 'chill',       'label' => 'Détendu'],
            ['name' => 'energetic',   'label' => 'Énergique'],
            ['name' => 'romantic',    'label' => 'Romantique'],
            ['name' => 'epic',        'label' => 'Épique'],
        ];

        foreach ($moods as $mood) {
            Mood::updateOrCreate(['name' => $mood['name']], $mood);
        }
    }
}