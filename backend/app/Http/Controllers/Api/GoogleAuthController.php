<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')
            ->stateless()
            ->with(['prompt' => 'select_account'])
            ->redirect();
    }

    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return redirect(config('app.frontend_url') . '/connexion?error=google_failed');
        }

        $user = User::where('email', $googleUser->getEmail())->first();

        if (!$user) {
            // Créer un nouvel utilisateur avec le rôle par défaut (par nom)
            $defaultRole = Role::where('name', 'user')->first();

            $user = User::create([
                'name'              => $googleUser->getName() ?? 'Utilisateur Google',
                'email'             => $googleUser->getEmail(),
                'password'          => bcrypt(Str::random(32)),
                'email_verified_at' => now(),
                'status'            => 'active',
                'role_id'           => $defaultRole?->id,
                'is_producer'       => false,
            ]);
        }

        // Refuser les comptes non actifs
        if ($user->status !== 'active') {
            return redirect(config('app.frontend_url') . '/connexion?error=account_suspended');
        }

        // Générer un code à usage unique (60 secondes)
        $code = Str::random(64);
        Cache::put("google_auth_code:{$code}", $user->id, now()->addSeconds(60));

        return redirect(config('app.frontend_url') . '/auth/google/success?code=' . $code);
    }

    /**
     * Échange le code à usage unique contre un token Sanctum.
     */
    public function exchangeCode(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string']);

        $userId = Cache::pull("google_auth_code:{$request->code}");

        if (!$userId) {
            return response()->json(['message' => 'Code invalide ou expiré.'], 400);
        }

        $user = User::findOrFail($userId);
        $token = $user->createToken('google-auth')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'          => $user->id,
                'name'        => $user->name,
                'email'       => $user->email,
                'is_admin'    => $user->isAdmin(),
                'is_producer' => $user->isProducer(),
            ],
        ]);
    }
}