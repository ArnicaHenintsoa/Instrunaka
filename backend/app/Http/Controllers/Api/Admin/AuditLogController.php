<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\UserSession;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::with('user:id,name,email')
            ->latest();

        if ($request->filled('action')) {
            $query->where('action', 'like', '%' . $request->string('action') . '%');
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }

        $logs = $query->paginate(50);

        return response()->json($logs);
    }

    public function sessions(): JsonResponse
    {
        $sessions = UserSession::with('user:id,name,email')
            ->latest('logged_in_at')
            ->paginate(50);

        return response()->json($sessions);
    }

    public function actions(): JsonResponse
    {
        $actions = AuditLog::select('action')
            ->distinct()
            ->pluck('action');

        return response()->json(['data' => $actions]);
    }

    /**
     * Purge tous les audit logs.
     */
    public function clearLogs(): JsonResponse
    {
        $count = AuditLog::count();
        AuditLog::truncate();

        // On log l'action de purge (après truncate pour ne pas être effacé)
        AuditLogger::log('audit.cleared', null, ['deleted_count' => $count]);

        return response()->json([
            'message' => "Historique purgé : $count action(s) supprimée(s).",
        ]);
    }

    /**
     * Purge toutes les sessions.
     */
    public function clearSessions(): JsonResponse
    {
        $count = UserSession::count();
        UserSession::truncate();

        return response()->json([
            'message' => "Sessions purgées : $count session(s) supprimée(s).",
        ]);
    }
        /**
     * Supprime un seul audit log.
     */
    public function destroyLog(int $id): JsonResponse
    {
        $log = AuditLog::findOrFail($id);
        $log->delete();

        return response()->json(['message' => 'Action supprimée.']);
    }

    /**
     * Supprime une seule session.
     */
    public function destroySession(int $id): JsonResponse
    {
        $session = UserSession::findOrFail($id);
        $session->delete();

        return response()->json(['message' => 'Session supprimée.']);
    }
}