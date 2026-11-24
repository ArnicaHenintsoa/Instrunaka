<?php

namespace App\Http\Middleware;

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

        return $next($request);
    }
}