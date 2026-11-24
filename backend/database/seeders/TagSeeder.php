<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        $tags = [
            ['name' => 'piano',   'label' => 'Piano'],
            ['name' => '808',     'label' => '808'],
            ['name' => 'guitar',  'label' => 'Guitare'],
            ['name' => 'synth',   'label' => 'Synthé'],
            ['name' => 'drums',   'label' => 'Batterie'],
            ['name' => 'strings', 'label' => 'Cordes'],
            ['name' => 'flute',   'label' => 'Flûte'],
            ['name' => 'bass',    'label' => 'Basse'],
        ];

        foreach ($tags as $tag) {
            Tag::updateOrCreate(['name' => $tag['name']], $tag);
        }
    }
}