<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Producer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    /**
     * Liste des producteurs suivis par l'utilisateur connecté.
     */
    public function index(Request $request): JsonResponse
    {
        $producers = $request->user()
            ->followedProducers()
            ->with('user:id,name,email')
            ->latest('producer_follows.created_at')
            ->paginate(20);

        return response()->json($producers);
    }

    /**
     * Suit un producteur.
     */
    public function store(Request $request, int $producerId): JsonResponse
    {
        $producer = Producer::findOrFail($producerId);
        
        $request->user()->followedProducers()->syncWithoutDetaching([$producer->id]);

        return response()->json([
            'message' => 'Vous suivez maintenant ce producteur.',
            'is_following' => true,
        ]);
    }

    /**
     * Ne suit plus un producteur.
     */
    public function destroy(Request $request, int $producerId): JsonResponse
    {
        $request->user()->followedProducers()->detach($producerId);

        return response()->json([
            'message' => 'Vous ne suivez plus ce producteur.',
            'is_following' => false,
        ]);
    }

    /**
     * Vérifie si l'utilisateur suit ce producteur.
     */
    public function check(Request $request, int $producerId): JsonResponse
    {
        $isFollowing = $request->user()
            ->followedProducers()
            ->where('producer_id', $producerId)
            ->exists();

        return response()->json(['is_following' => $isFollowing]);
    }
}