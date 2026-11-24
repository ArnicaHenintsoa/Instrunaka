<?php

namespace Database\Seeders;

use App\Models\Rhythm;
use Illuminate\Database\Seeder;

class RhythmSeeder extends Seeder
{
    public function run(): void
    {
        $rhythms = [
            ['name' => 'slow',   'label' => 'Lent'],
            ['name' => 'medium', 'label' => 'Moyen'],
            ['name' => 'fast',   'label' => 'Rapide'],
            ['name' => 'uptempo','label' => 'Uptempo'],
        ];

        foreach ($rhythms as $rhythm) {
            Rhythm::updateOrCreate(['name' => $rhythm['name']], $rhythm);
        }
    }
}