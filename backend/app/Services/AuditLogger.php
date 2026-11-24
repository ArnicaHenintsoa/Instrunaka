<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use App\Models\UserSession;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class AuditLogger
{
    public static function log(
        string $action,
        ?Model $entity = null,
        array $payload = [],
        ?User $user = null
    ): void {
        $user = $user ?? Auth::user();
        if (!$user) return;

        AuditLog::create([
            'user_id'     => $user->id,
            'action'      => $action,
            'entity_type' => $entity ? get_class($entity) : null,
            'entity_id'   => $entity?->id,
            'payload'     => $payload,
            'ip_address'  => request()->ip(),
            'user_agent'  => request()->userAgent(),
        ]);

        self::incrementCurrentSessionActions($user->id);
    }

    public static function openSession(int $userId): void
    {
        UserSession::create([
            'user_id'      => $userId,
            'ip_address'   => request()->ip(),
            'user_agent'   => request()->userAgent(),
            'logged_in_at' => now(),
        ]);
    }

   
    public static function closeSession(int $userId): void
    {
        $session = UserSession::where('user_id', $userId)
            ->whereNull('logged_out_at')
            ->orderByDesc('logged_in_at')  
            ->first();

        if ($session) {
            $session->update(['logged_out_at' => now()]);
        }
    }

    public static function closeAllSessions(int $userId): void
    {
        UserSession::where('user_id', $userId)
            ->whereNull('logged_out_at')
            ->update(['logged_out_at' => now()]);
    }

    private static function incrementCurrentSessionActions(int $userId): void
    {
        $session = UserSession::where('user_id', $userId)
            ->whereNull('logged_out_at')
            ->orderByDesc('logged_in_at') 
            ->first();

        if ($session) {
            $session->increment('actions_count');
        }
    }
}