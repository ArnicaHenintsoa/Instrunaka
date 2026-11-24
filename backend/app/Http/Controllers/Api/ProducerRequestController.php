<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProducerRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProducerRequestController extends Controller
{
    /**
     * L'utilisateur connecté soumet une demande pour devenir producteur.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isProducer()) {
            return response()->json(['message' => 'Vous êtes déjà producteur.'], 400);
        }

        $existing = $user->producerRequests()->where('status', 'pending')->first();
        if ($existing) {
            return response()->json([
                'message' => 'Vous avez déjà une demande en attente.',
                'request' => $existing,
            ], 400);
        }

        $validated = $request->validate([
            'bio'        => 'required|string|max:2000',
            'motivation' => 'required|string|max:2000',
        ]);

        $producerRequest = $user->producerRequests()->create([
            'bio'        => $validated['bio'],
            'motivation' => $validated['motivation'],
            'status'     => 'pending',
        ]);

        return response()->json([
            'message' => 'Demande envoyée avec succès. Un administrateur va l\'examiner.',
            'data'    => $producerRequest,
        ], 201);
    }

    /**
     * L'utilisateur connecté consulte l'état de sa demande.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $producerRequest = $user->latestProducerRequest;

        return response()->json([
            'is_producer' => $user->isProducer(),
            'request'     => $producerRequest,
        ]);
    }
}