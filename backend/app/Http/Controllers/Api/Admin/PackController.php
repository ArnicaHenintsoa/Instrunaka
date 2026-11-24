<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pack;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PackController extends Controller
{
    public function index(): JsonResponse
    {
        $packs = Pack::withCount('instrumentals')->latest()->get();
        return response()->json(['data' => $packs]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'               => 'required|string|max:255',
            'description'        => 'nullable|string|max:2000',
            'price'              => 'required|integer|min:0',
            'instrumental_ids'   => 'required|array|min:2',
            'instrumental_ids.*' => 'exists:instrumentals,id',
        ]);

        $pack = Pack::create([
            'name'        => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price'       => $validated['price'],
            'active'      => true,
        ]);

        $pack->instrumentals()->sync($validated['instrumental_ids']);

        AuditLogger::log('pack.created', $pack, [
            'name'  => $pack->name,
            'price' => $pack->price,
        ]);

        return response()->json([
            'message' => 'Pack créé.',
            'data'    => $pack->load('instrumentals'),
        ], 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $pack = Pack::findOrFail($id);
        AuditLogger::log('pack.deleted', $pack, ['name' => $pack->name]);
        $pack->delete();

        return response()->json(['message' => 'Pack supprimé.']);
    }
}