<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'visitor', 'label' => 'Visiteur'],
            ['name' => 'user',    'label' => 'Utilisateur'],
            ['name' => 'producer','label' => 'Producteur'],
            ['name' => 'admin',   'label' => 'Administrateur'],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(['name' => $role['name']], $role);
        }
    }
}