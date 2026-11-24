<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instrumental;
use App\Models\InstrumentalFile;
use App\Models\Producer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;

class ProducerInstrumentalController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title'          => 'required|string|max:255',
            'description'    => 'nullable|string',
            'bpm'            => 'nullable|integer|min:40|max:250',
            'musical_key'    => 'nullable|string|max:10',
            'genre_id'       => 'nullable|exists:genres,id',
            'mood_id'        => 'nullable|exists:moods,id',
            'rhythm_id'      => 'nullable|exists:rhythms,id',
            'duration_seconds' => 'nullable|integer|min:1|max:7200',
            'audio'          => 'required|file|mimes:mp3,wav|max:51200',
            'preview'        => 'required|file|mimes:mp3|max:10240', // extrait public (distinct du fichier vendu)
            'cover'          => 'nullable|image|max:5120', // 5 Mo
        ]);

        $user = $request->user();
        if (!$user->is_producer && !$user->isAdmin()) {
            return response()->json(['message' => 'Tu dois être producteur pour uploader.'], 403);
        }

        $producer = $user->producer;
        if (!$producer) {
            $producer = Producer::create([
                'user_id'      => $user->id,
                'display_name' => $user->name,
                'bio'          => 'Producteur sur Instrunaka',
                'verified'     => $user->isAdmin(),
            ]);
        }

        $nonExclusivePrice = Config::get('platform.prices.non_exclusive');
        $exclusivePrice    = Config::get('platform.prices.exclusive');

        $instrumental = Instrumental::create([
            'producer_id'         => $producer->id,
            'title'               => $request->title,
            'description'         => $request->description,
            'bpm'                 => $request->bpm,
            'musical_key'         => $request->musical_key,
            'duration_seconds'    => $request->duration_seconds,
            'genre_id'            => $request->genre_id,
            'mood_id'             => $request->mood_id,
            'rhythm_id'           => $request->rhythm_id,
            'non_exclusive_price' => $nonExclusivePrice,
            'exclusive_price'     => $exclusivePrice,
            'status'              => 'pending',
        ]);

        // 1. Cover (PUBLIC) - On stocke dans 'covers'
        if ($request->hasFile('cover')) {
            $coverPath = $request->file('cover')->store('covers', 'public');
            InstrumentalFile::create([
                'instrumental_id' => $instrumental->id,
                'type'            => 'cover',
                'path'            => $coverPath,
                'original_name'   => $request->file('cover')->getClientOriginalName(),
                'size_bytes'      => $request->file('cover')->getSize(),
                'mime_type'       => $request->file('cover')->getMimeType(),
            ]);
        }

        // 2. Fichier Audio vendu (PRIVÉ) - disque 'local', jamais accessible publiquement
        $file = $request->file('audio');
        $extension = $file->getClientOriginalExtension();
        $fileName = Str::random(40) . '.' . $extension;
        $filePath = $file->storeAs("audio/{$instrumental->id}", $fileName, 'local');

        InstrumentalFile::create([
            'instrumental_id' => $instrumental->id,
            'type'            => $extension === 'wav' ? 'wav' : 'mp3',
            'path'            => $filePath,
            'original_name'   => $file->getClientOriginalName(),
            'size_bytes'      => $file->getSize(),
            'mime_type'       => $file->getMimeType(),
        ]);

        // 3. Preview (PUBLIC) - extrait distinct, seul fichier écoutable gratuitement
        $previewFile = $request->file('preview');
        $previewPath = $previewFile->storeAs("previews/{$instrumental->id}", Str::random(40) . '.mp3', 'public');

        InstrumentalFile::create([
            'instrumental_id' => $instrumental->id,
            'type'            => 'preview',
            'path'            => $previewPath,
            'original_name'   => $previewFile->getClientOriginalName(),
            'size_bytes'      => $previewFile->getSize(),
            'mime_type'       => $previewFile->getMimeType(),
        ]);

        return response()->json([
            'message' => 'Instrumentale soumise avec succès.',
            'data'    => $instrumental,
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $producer = $request->user()->producer;
        if (!$producer) return response()->json(['data' => []]);

        $instrumentals = Instrumental::where('producer_id', $producer->id)
            ->with(['genre', 'mood', 'rhythm', 'files'])
            ->latest()
            ->paginate(15);

        return response()->json($instrumentals);
    }
}