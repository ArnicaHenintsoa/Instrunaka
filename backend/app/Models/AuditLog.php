<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    protected $fillable = [
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'payload',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'payload' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

  
    public function label(): string
    {
        return match ($this->action) {
            'login'                     => '🔓 Connexion',
            'logout'                    => '🔒 Déconnexion',
            'order.validated'           => '✅ Commande validée',
            'order.rejected'            => '❌ Commande refusée',
            'user.suspended'            => '🚫 Utilisateur suspendu',
            'user.reactivated'          => '✔️ Utilisateur réactivé',
            'instrumental.validated'    => '✅ Instrumentale validée',
            'instrumental.rejected'     => '❌ Instrumentale refusée',
            'instrumental.unpublished'  => '📤 Instrumentale dépubliée',
            'instrumental.deleted'      => '🗑️ Instrumentale supprimée',
            'promotion.created'         => '🎁 Promotion créée',
            'promotion.deleted'         => '🗑️ Promotion supprimée',
            'promo_code.created'        => '🎟️ Code promo créé',
            'promo_code.deleted'        => '🗑️ Code promo supprimé',
            'review.hidden'             => '🙈 Avis masqué',
            'review.shown'              => '👁️ Avis affiché',
            'review.deleted'            => '🗑️ Avis supprimé',
            'pack.created'              => '📦 Pack créé',
            'pack.deleted'              => '🗑️ Pack supprimé',
            default                     => $this->action,
        };
    }
}