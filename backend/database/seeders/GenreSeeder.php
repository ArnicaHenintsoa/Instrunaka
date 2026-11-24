<?php

namespace Database\Seeders;

use App\Models\Genre;
use Illuminate\Database\Seeder;

class GenreSeeder extends Seeder
{
    public function run(): void
    {
        $genres = [
            ['name' => 'trap',     'label' => 'Trap'],
            ['name' => 'afrobeat', 'label' => 'Afrobeat'],
            ['name' => 'rnb',      'label' => 'R&B'],
            ['name' => 'hiphop',   'label' => 'Hip-Hop'],
            ['name' => 'pop',      'label' => 'Pop'],
            ['name' => 'rock',     'label' => 'Rock'],
            ['name' => 'jazz',     'label' => 'Jazz'],
            ['name' => 'reggae',   'label' => 'Reggae'],
        ];

        foreach ($genres as $genre) {
            Genre::updateOrCreate(['name' => $genre['name']], $genre);
        }
    }
}