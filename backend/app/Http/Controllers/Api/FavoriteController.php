<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instrumental;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    /**
     * Liste des favoris de l'utilisateur connecté.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $favorites = Instrumental::query()
            ->whereHas('favoritedBy', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with([
                'producer:id,display_name',
                'mood:id,label',
                'rhythm:id,label',
                'files:id,instrumental_id,type,path', // On charge les fichiers
            ])
            ->latest()
            ->paginate(12);

        return response()->json([
            'data' => $favorites->map(fn ($i) => $this->formatInstrumental($i)),
            'meta' => [
                'current_page' => $favorites->currentPage(),
                'per_page'     => $favorites->perPage(),
                'total'        => $favorites->total(),
                'last_page'    => $favorites->lastPage(),
            ],
        ]);
    }

    /**
     * Ajoute une instrumentale aux favoris.
     */
    public function store(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $instrumental = Instrumental::findOrFail($id);

        $user->favorites()->syncWithoutDetaching([$instrumental->id]);

        return response()->json([
            'message'      => 'Ajouté aux favoris.',
            'is_favorited' => true,
        ]);
    }

    /**
     * Retire une instrumentale des favoris.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $user->favorites()->detach($id);

        return response()->json([
            'message'      => 'Retiré des favoris.',
            'is_favorited' => false,
        ]);
    }

    /**
     * Vérifie si une instrumentale est en favori pour l'utilisateur connecté.
     */
    public function check(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $isFavorited = $user->favorites()
            ->where('instrumental_id', $id)
            ->exists();

        return response()->json([
            'is_favorited' => $isFavorited,
        ]);
    }

    /**
     * Formatage standardisé d'une instrumentale.
     */
    private function formatInstrumental(Instrumental $i): array
    {
        // Récupérer le chemin de la pochette depuis la relation 'files'
        $cover = $i->files->where('type', 'cover')->first();
        $coverPath = $cover ? $cover->path : null;

        return [
            'id'                  => $i->id,
            'title'               => $i->title,
            'cover_path'          => $coverPath, // On renvoie le vrai chemin
            'bpm'                 => $i->bpm,
            'non_exclusive_price' => $i->non_exclusive_price,
            'exclusive_price'     => $i->exclusive_price,
            'producer'            => $i->producer ? ['display_name' => $i->producer->display_name] : null,
            'mood'                => $i->mood ? ['label' => $i->mood->label] : null,
            'rhythm'              => $i->rhythm ? ['label' => $i->rhythm->label] : null,
        ];
    }
}