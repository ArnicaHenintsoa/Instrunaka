<?php

namespace App\Http\Middleware;

use App\Models\UserSession;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->status !== 'active') {

            $user->tokens()->delete();

            return response()->json([
                'message' => 'Votre compte a été suspendu. Veuillez contacter l\'administration.',
            ], 403);
        }

        if ($user) {
            try {
                $this->touchSession($user->id);
            } catch (\Throwable $e) {
                
                report($e);
            }
        }

        return $next($request);
    }

    
    private function touchSession(int $userId): void
    {
        $session = UserSession::where('user_id', $userId)
            ->whereNull('logged_out_at')
            ->latest('logged_in_at')
            ->first();

        if (! $session) {
            return;
        }

        if ($session->last_seen_at === null || $session->last_seen_at->lt(now()->subMinute())) {
            $session->timestamps = false; 
            $session->last_seen_at = now();
            $session->save();
        }
    }
}
