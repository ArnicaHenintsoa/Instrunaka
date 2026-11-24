<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            PermissionSeeder::class,
            GenreSeeder::class,
            MoodSeeder::class,
            RhythmSeeder::class,
            TagSeeder::class,
        ]);
    }
}