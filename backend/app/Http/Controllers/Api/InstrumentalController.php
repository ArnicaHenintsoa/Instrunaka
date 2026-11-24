<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instrumental;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class InstrumentalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Instrumental::query()
            ->where('status', 'available')
            ->with([
                'producer:id,display_name', 
                'genre:id,label', 
                'mood:id,label', 
                'rhythm:id,label', 
                'tags:id,label',
                'files:id,instrumental_id,type,path', // On ajoute 'path' ici
            ]);

        if ($request->filled('producer_id')) $query->where('producer_id', $request->integer('producer_id'));
        if ($request->filled('mood_id'))     $query->where('mood_id', $request->integer('mood_id'));
        if ($request->filled('rhythm_id'))   $query->where('rhythm_id', $request->integer('rhythm_id'));
        if ($request->filled('genre_id'))    $query->where('genre_id', $request->integer('genre_id'));

        if ($request->filled('search')) {
            $search = '%' . $request->string('search') . '%';
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ILIKE', $search)
                  ->orWhereHas('producer', fn($q2) => $q2->where('display_name', 'ILIKE', $search))
                  ->orWhereHas('mood',     fn($q2) => $q2->where('label', 'ILIKE', $search))
                  ->orWhereHas('rhythm',   fn($q2) => $q2->where('label', 'ILIKE', $search))
                  ->orWhereHas('genre',    fn($q2) => $q2->where('label', 'ILIKE', $search));
            });
        }

        $sort = $request->string('sort', 'recent')->toString();
        match ($sort) {
            'oldest'    => $query->oldest('published_at'),
            'price_asc' => $query->orderBy('non_exclusive_price'),
            'price_desc'=> $query->orderByDesc('non_exclusive_price'),
            default     => $query->latest('published_at'),
        };

        $instrumentals = $query->paginate(12);

        // On ajoute le cover_path à chaque instrumentale
        $data = $instrumentals->items();
        foreach ($data as $instrumental) {
            $cover = $instrumental->files->where('type', 'cover')->first();
            $instrumental->cover_path = $cover ? $cover->path : null;
        }

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $instrumentals->currentPage(),
                'per_page'     => $instrumentals->perPage(),
                'total'        => $instrumentals->total(),
                'last_page'    => $instrumentals->lastPage(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $instrumental = Instrumental::query()
            ->where('status', 'available')
            ->with([
                'producer:id,user_id,display_name,bio,avatar_path,verified',
                'genre:id,label',
                'mood:id,label',
                'rhythm:id,label',
                'tags:id,label',
                'files:id,instrumental_id,type,path', // On ajoute 'path' ici
            ])
            ->findOrFail($id);

        // On ajoute cover_path pour que le frontend puisse l'utiliser
        $cover = $instrumental->files->where('type', 'cover')->first();
        $instrumental->cover_path = $cover ? $cover->path : null;

        return response()->json([
            'data' => $instrumental,
        ]);
    }

    public function preview(int $id)
    {
        $instrumental = Instrumental::where('status', 'available')->findOrFail($id);
        $preview = $instrumental->files()->where('type', 'preview')->firstOrFail();

        if (str_starts_with($preview->path, 'http')) {
            return redirect($preview->path);
        }

        $disk = Storage::disk('public');
        $path = $preview->path;

        abort_unless($disk->exists($path), 404, 'Preview introuvable.');

        return $disk->response($path, $preview->original_name ?? 'preview.mp3', [
            'Content-Type'  => $preview->mime_type ?? 'audio/mpeg',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}