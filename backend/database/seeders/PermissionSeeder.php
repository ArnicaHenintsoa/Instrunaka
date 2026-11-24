<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'manage_users'         => 'Gérer les utilisateurs',
            'manage_producers'     => 'Gérer les producteurs',
            'manage_instrumentals' => 'Gérer le catalogue',
            'manage_orders'        => 'Gérer les commandes',
            'manage_payments'      => 'Valider les paiements',
            'manage_promotions'    => 'Gérer les promotions',
            'manage_reviews'       => 'Modérer les avis',
            'submit_instrumentals' => 'Soumettre des instrumentales',
        ];

        foreach ($permissions as $name => $label) {
            Permission::updateOrCreate(['name' => $name], ['label' => $label]);
        }

        // Attribution : l'admin a toutes les permissions
        $admin = Role::where('name', 'admin')->first();
        $admin?->permissions()->sync(Permission::pluck('id'));

        // Le producteur peut soumettre des instrumentales
        $producer = Role::where('name', 'producer')->first();
        $submitPermission = Permission::where('name', 'submit_instrumentals')->first();
        if ($producer && $submitPermission) {
            $producer->permissions()->sync([$submitPermission->id]);
        }
    }
}