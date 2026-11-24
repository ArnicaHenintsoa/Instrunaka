<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    /**
     * Liste tous les utilisateurs (admin).
     */
    public function index(): JsonResponse
    {
        $users = User::with(['role:id,name,label', 'producer'])
            ->latest()
            ->paginate(20);

        return response()->json($users);
    }

    /**
     * Suspend ou réactive un utilisateur.
     */
    public function toggleStatus(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->isAdmin()) {
            return response()->json(['message' => 'Impossible de suspendre un administrateur.'], 403);
        }

        $newStatus = $user->status === 'active' ? 'suspended' : 'active';
        $user->update(['status' => $newStatus]);

        AuditLogger::log(
            $newStatus === 'active' ? 'user.reactivated' : 'user.suspended',
            $user,
            ['email' => $user->email]
        );

        return response()->json([
            'message' => $newStatus === 'active' ? 'Utilisateur réactivé.' : 'Utilisateur suspendu.',
            'status'  => $newStatus,
        ]);
    }
}