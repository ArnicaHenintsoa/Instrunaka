<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Mail\WelcomeMail;
use App\Models\Role;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Créer un nouveau compte utilisateur.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $defaultRole = Role::where('name', 'user')->first();

        $user = User::create([
            'name'     => $request->validated('name'),
            'email'    => $request->validated('email'),
            'password' => $request->validated('password'),
            'role_id'  => $defaultRole?->id,
            'status'   => 'active',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        AuditLogger::openSession($user->id);
        AuditLogger::log('login', null, ['email' => $user->email, 'mode' => 'register'], $user);

        Mail::to($user->email)->send(new WelcomeMail($user));

        return response()->json([
            'message' => 'Compte créé avec succès.',
            'user'    => $this->userResource($user),
            'token'   => $token,
        ], 201);
    }

    /**
     * Connexion : vérifie les identifiants et retourne un token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->validated('email'))->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects.'],
            ]);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Ce compte est ' . $user->status . '.',
            ], 403);
        }

        // On crée un nouveau token sans supprimer les autres (multi-appareils)
        $token = $user->createToken('auth_token')->plainTextToken;

        AuditLogger::openSession($user->id);
        AuditLogger::log('login', null, ['email' => $user->email], $user);

        return response()->json([
            'message' => 'Connexion réussie.',
            'user'    => $this->userResource($user),
            'token'   => $token,
        ]);
    }

    /**
     * Retourne le profil de l'utilisateur connecté.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->userResource($request->user()),
        ]);
    }

    /**
     * Déconnexion : ferme la session + révoque le token courant.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        AuditLogger::log('logout', null, [], $user);
        AuditLogger::closeSession($user->id);

        $user->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie.',
        ]);
    }

    /**
     * Envoi du lien de réinitialisation de mot de passe par email.
     * Utilise le broker natif de Laravel.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        // On génère le token et on envoie l'email.
        $status = Password::sendResetLink(
            $request->only('email')
        );

        // On renvoie TOUJOURS le même message pour ne pas révéler si l'email existe.
        return response()->json([
            'message' => 'Si votre adresse email est dans notre base, un lien de réinitialisation vient de vous être envoyé.'
        ]);
    }

    /**
     * Réinitialisation effective du mot de passe avec token valide.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token'    => 'required',
            'email'    => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        // Le broker vérifie le token, l'email, l'expiration, et met à jour le mot de passe.
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();

                // SÉCURITÉ : on révoque tous les tokens Sanctum existants
                $user->tokens()->delete();

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Votre mot de passe a été réinitialisé avec succès.']);
        }

        return response()->json(['message' => 'Ce lien est invalide ou a expiré.'], 400);
    }

    /**
     * Formatage standardisé de l'utilisateur pour l'API.
     */
    private function userResource(User $user): array
    {
        return [
            'id'          => $user->id,
            'name'        => $user->name,
            'email'       => $user->email,
            'status'      => $user->status,
            'is_producer' => $user->isProducer(),
            'is_admin'    => $user->isAdmin(),
            'role'        => $user->role?->name,
            'created_at'  => $user->created_at?->toIso8601String(),
        ];
    }
}