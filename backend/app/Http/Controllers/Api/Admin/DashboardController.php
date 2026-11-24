<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Instrumental;
use App\Models\Order;
use App\Models\ProducerRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Statistiques globales de la plateforme.
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            // Utilisateurs
            'users' => [
                'total'       => User::count(),
                'active'      => User::where('status', 'active')->count(),
                'suspended'   => User::where('status', 'suspended')->count(),
                'producers'   => User::where('is_producer', true)->count(),
            ],

            // Catalogue
            'instrumentals' => [
                'total'       => Instrumental::count(),
                'published'   => Instrumental::where('status', 'available')->count(),
                'pending'     => Instrumental::where('status', 'pending')->count(),
                'unpublished' => Instrumental::where('status', 'unpublished')->count(),
            ],

            // Commandes
            'orders' => [
                'total'     => Order::count(),
                'pending'   => Order::where('status', 'pending')->count(),
                'validated' => Order::where('status', 'validated')->count(),
                'cancelled' => Order::where('status', 'cancelled')->count(),
            ],

            // Revenus (somme des commandes validées)
            'revenue' => [
                'total' => (int) Order::where('status', 'validated')->sum('amount'),
            ],

            // Demandes producteur en attente
            'producer_requests' => [
                'pending' => ProducerRequest::where('status', 'pending')->count(),
            ],

            // Activité récente
            'recent' => [
                'orders'        => Order::with(['user:id,name', 'instrumental:id,title'])
                    ->latest()
                    ->take(5)
                    ->get(),
                'instrumentals' => Instrumental::with(['producer.user:id,name'])
                    ->latest()
                    ->take(5)
                    ->get(['id', 'title', 'status', 'producer_id', 'created_at']),
            ],
        ]);
    }
}