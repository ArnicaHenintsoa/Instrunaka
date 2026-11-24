<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Mail\InstrumentalValidatedMail;
use App\Models\Instrumental;
use App\Models\InstrumentalFile;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class InstrumentalController extends Controller
{
    public function index(): JsonResponse
    {
        $instrumentals = Instrumental::with([
            'producer.user:id,name,email',
            'genre:id,label', 'mood:id,label', 'rhythm:id,label',
            'files',
        ])
        ->where('status', 'pending')
        ->latest()
        ->paginate(20);

        return response()->json($instrumentals);
    }

    public function all(): JsonResponse
    {
        $instrumentals = Instrumental::with([
            'producer.user:id,name,email',
            'genre:id,label', 'mood:id,label', 'rhythm:id,label',
        ])
        ->latest()
        ->paginate(20);

        return response()->json($instrumentals);
    }

    /**
     * Admin : ajouter une instrumentale directement.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'bpm'         => 'nullable|integer|min:40|max:250',
            'musical_key' => 'nullable|string|max:10',
            'genre_id'    => 'nullable|exists:genres,id',
            'mood_id'     => 'nullable|exists:moods,id',
            'rhythm_id'   => 'nullable|exists:rhythms,id',
            'producer_id' => 'nullable|exists:producers,id',
            'mp3'         => 'nullable|file|mimes:mp3|max:51200',
            'wav'         => 'nullable|file|mimes:wav|max:204800',
            'preview'     => 'nullable|file|mimes:mp3|max:10240',
            'cover'       => 'nullable|image|max:5120',
        ]);

        $instrumental = Instrumental::create([
            'producer_id'         => $validated['producer_id'] ?? null,
            'title'               => $validated['title'],
            'description'         => $validated['description'] ?? null,
            'bpm'                 => $validated['bpm'] ?? null,
            'musical_key'         => $validated['musical_key'] ?? null,
            'genre_id'            => $validated['genre_id'] ?? null,
            'mood_id'             => $validated['mood_id'] ?? null,
            'rhythm_id'           => $validated['rhythm_id'] ?? null,
            'non_exclusive_price' => Config::get('platform.prices.non_exclusive'),
            'exclusive_price'     => Config::get('platform.prices.exclusive'),
            'status'              => 'available',
            'published_at'        => now(),
        ]);

        // --- Cover (public) ---
        if ($request->hasFile('cover')) {
            $path = $request->file('cover')->store('covers', 'public');
            InstrumentalFile::create([
                'instrumental_id' => $instrumental->id,
                'type'            => 'cover',
                'path'            => $path,
                'original_name'   => $request->file('cover')->getClientOriginalName(),
                'size_bytes'      => $request->file('cover')->getSize(),
                'mime_type'       => $request->file('cover')->getMimeType(),
            ]);
        }

        // --- Preview (public) ---
        if ($request->hasFile('preview')) {
            $path = $request->file('preview')->store('previews', 'public');
            InstrumentalFile::create([
                'instrumental_id' => $instrumental->id,
                'type'            => 'preview',
                'path'            => $path,
                'original_name'   => $request->file('preview')->getClientOriginalName(),
                'size_bytes'      => $request->file('preview')->getSize(),
                'mime_type'       => $request->file('preview')->getMimeType(),
            ]);
        }

        // --- MP3 (privé) ---
        if ($request->hasFile('mp3')) {
            $name = Str::random(40) . '.mp3';
            $path = $request->file('mp3')->storeAs("audio/{$instrumental->id}", $name, 'local');
            InstrumentalFile::create([
                'instrumental_id' => $instrumental->id,
                'type'            => 'mp3',
                'path'            => $path,
                'original_name'   => $request->file('mp3')->getClientOriginalName(),
                'size_bytes'      => $request->file('mp3')->getSize(),
                'mime_type'       => $request->file('mp3')->getMimeType(),
            ]);
        }

        // --- WAV (privé) ---
        if ($request->hasFile('wav')) {
            $name = Str::random(40) . '.wav';
            $path = $request->file('wav')->storeAs("audio/{$instrumental->id}", $name, 'local');
            InstrumentalFile::create([
                'instrumental_id' => $instrumental->id,
                'type'            => 'wav',
                'path'            => $path,
                'original_name'   => $request->file('wav')->getClientOriginalName(),
                'size_bytes'      => $request->file('wav')->getSize(),
                'mime_type'       => $request->file('wav')->getMimeType(),
            ]);
        }

        AuditLogger::log('instrumental.created_by_admin', $instrumental);

        return response()->json([
            'message' => 'Instrumentale créée avec succès.',
            'data'    => $instrumental->load('files'),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $instrumental = Instrumental::findOrFail($id);

        $validated = $request->validate([
            'title'               => 'sometimes|string|max:255',
            'description'         => 'nullable|string|max:2000',
            'bpm'                 => 'sometimes|integer|min:40|max:250',
            'musical_key'         => 'nullable|string|max:10',
            'genre_id'            => 'nullable|exists:genres,id',
            'mood_id'             => 'nullable|exists:moods,id',
            'rhythm_id'           => 'nullable|exists:rhythms,id',
            'non_exclusive_price' => 'sometimes|integer|min:0',
            'exclusive_price'     => 'sometimes|integer|min:0',
            'status'              => 'sometimes|in:pending,available,unpublished,rejected',
        ]);

        // Interdire de changer le statut d'une instrumentale vendue en exclusif
        if (isset($validated['status']) && $instrumental->status === 'sold_exclusive') {
            return response()->json([
                'message' => 'Impossible de modifier le statut d\'une instrumentale vendue en exclusivité.',
            ], 422);
        }

        $oldStatus = $instrumental->status;

        $instrumental->update($validated);

        if (isset($validated['status']) && $oldStatus !== $validated['status']) {
            AuditLogger::log('instrumental.status_changed', $instrumental, [
                'old' => $oldStatus,
                'new' => $validated['status'],
            ]);
        }

        return response()->json([
            'message' => 'Instrumentale mise à jour.',
            'data'    => $instrumental,
        ]);
    }

    public function unpublish(int $id): JsonResponse
    {
        $instrumental = Instrumental::findOrFail($id);
        $instrumental->update(['status' => 'unpublished']);
        AuditLogger::log('instrumental.unpublished', $instrumental);

        return response()->json(['message' => 'Instrumentale dépubliée.']);
    }

    public function validateInstrumental(int $id): JsonResponse
    {
        $instrumental = Instrumental::findOrFail($id);

        $instrumental->update([
            'status'       => 'available',
            'published_at' => now(),
        ]);

        AuditLogger::log('instrumental.validated', $instrumental);
        if ($instrumental->producer && $instrumental->producer->user) {
            Mail::to($instrumental->producer->user->email)
                ->send(new InstrumentalValidatedMail($instrumental, true));
        }

        return response()->json(['message' => 'Instrumentale validée et publiée dans le catalogue.']);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'admin_note' => 'required|string|max:1000',
        ]);

        $instrumental = Instrumental::findOrFail($id);
        $instrumental->update(['status' => 'rejected']);

        AuditLogger::log('instrumental.rejected', $instrumental);
        if ($instrumental->producer && $instrumental->producer->user) {
            Mail::to($instrumental->producer->user->email)
                ->send(new InstrumentalValidatedMail($instrumental, false, $validated['admin_note']));
        }

        return response()->json([
            'message' => 'Instrumentale refusée.',
            'note'    => $validated['admin_note'],
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $instrumental = Instrumental::findOrFail($id);

        if ($instrumental->status === 'sold_exclusive') {
            return response()->json([
                'message' => 'Impossible de supprimer une instrumentale vendue en exclusivité. Elle peut être archivée.',
            ], 422);
        }

        AuditLogger::log('instrumental.deleted', $instrumental, ['title' => $instrumental->title]);
        $instrumental->delete();

        return response()->json(['message' => 'Instrumentale archivée (suppression logique).']);
    }

    public function previewAudio(int $id, string $fileType)
    {
        $file = InstrumentalFile::where('instrumental_id', $id)
            ->where('type', $fileType)
            ->firstOrFail();

        // Les mp3/wav sont privés (local), la preview est publique
        $disk = Storage::disk($fileType === 'preview' ? 'public' : 'local');
        abort_unless($disk->exists($file->path), 404, 'Fichier introuvable.');

        return $disk->download($file->path, $file->original_name, [
            'Content-Type' => $file->mime_type ?? 'audio/mpeg',
            'Content-Disposition' => 'inline; filename="' . $file->original_name . '"',
        ]);
    }
}