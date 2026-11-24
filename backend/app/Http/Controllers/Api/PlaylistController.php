<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Playlist;
use App\Models\Instrumental;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlaylistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $playlists = $request->user()->playlists()
            ->withCount('instrumentals')
            ->latest()
            ->get();

        return response()->json(['data' => $playlists]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_public' => 'boolean',
        ]);

        $playlist = $request->user()->playlists()->create($validated);

        return response()->json(['message' => 'Playlist créée.', 'data' => $playlist], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $playlist = Playlist::where('user_id', $request->user()->id)
            ->with(['instrumentals.producer:id,display_name', 'instrumentals.genre:id,label', 'instrumentals.mood:id,label'])
            ->findOrFail($id);

        return response()->json(['data' => $playlist]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $playlist = Playlist::where('user_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_public' => 'boolean',
        ]);

        $playlist->update($validated);

        return response()->json(['message' => 'Playlist mise à jour.', 'data' => $playlist]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $playlist = Playlist::where('user_id', $request->user()->id)->findOrFail($id);
        $playlist->delete();

        return response()->json(['message' => 'Playlist supprimée.']);
    }

    public function addInstrumental(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'instrumental_id' => 'required|exists:instrumentals,id',
        ]);

        $playlist = Playlist::where('user_id', $request->user()->id)->findOrFail($id);
        
        $playlist->instrumentals()->syncWithoutDetaching([$validated['instrumental_id']]);

        return response()->json(['message' => 'Instrumentale ajoutée à la playlist.']);
    }

    public function removeInstrumental(Request $request, int $id, int $instrumentalId): JsonResponse
    {
        $playlist = Playlist::where('user_id', $request->user()->id)->findOrFail($id);
        $playlist->instrumentals()->detach($instrumentalId);

        return response()->json(['message' => 'Instrumentale retirée de la playlist.']);
    }
}