<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Producer;
use Illuminate\Http\JsonResponse;

class ProducerController extends Controller
{
    /**
     * Liste tous les producteurs (avec le nombre d'instrumentales).
     */
    public function index(): JsonResponse
    {
        $producers = Producer::withCount('instrumentals')
            ->orderBy('display_name')
            ->get();

        return response()->json([
            'data' => $producers->map(fn ($p) => [
                'id'                   => $p->id,
                'display_name'         => $p->display_name,
                'bio'                  => $p->bio,
                'verified'             => $p->verified,
                'instrumentals_count'  => $p->instrumentals_count,
            ]),
        ]);
    }

    /**
     * Détail d'un producteur avec ses instrumentales.
     */
    public function show(int $id): JsonResponse
    {
        $producer = Producer::with([
            'user:id,name',
            'instrumentals' => function ($query) {
                $query->where('status', 'available')->latest('published_at');
            },
            'instrumentals.genre:id,label',
            'instrumentals.mood:id,label',
            'instrumentals.rhythm:id,label',
        ])->findOrFail($id);

        $followersCount = $producer->followers()->count();

        return response()->json([
            'data' => [
                'id'              => $producer->id,
                'display_name'    => $producer->display_name,
                'bio'             => $producer->bio,
                'verified'        => $producer->verified,
                'followers_count' => $followersCount,
                'instrumentals'   => $producer->instrumentals,
            ],
        ]);
    }
}