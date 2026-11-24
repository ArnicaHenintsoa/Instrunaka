<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSession extends Model
{
    
    public const ONLINE_WINDOW_MINUTES = 5;

    protected $fillable = [
        'user_id',
        'ip_address',
        'user_agent',
        'logged_in_at',
        'last_seen_at',
        'logged_out_at',
        'actions_count',
    ];

    protected $casts = [
        'logged_in_at'  => 'datetime',
        'last_seen_at'  => 'datetime',
        'logged_out_at' => 'datetime',
    ];

  
    protected $appends = ['is_online'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    
    public function getIsOnlineAttribute(): bool
    {
        if ($this->logged_out_at !== null) {
            return false;
        }

        $lastActivity = $this->last_seen_at ?? $this->logged_in_at;

        return $lastActivity !== null
            && $lastActivity->gt(now()->subMinutes(self::ONLINE_WINDOW_MINUTES));
    }
}
