<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Promotion extends Model
{
    protected $fillable = ['instrumental_id', 'discount_percent', 'starts_at', 'ends_at', 'active'];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at'   => 'datetime',
        'active'    => 'boolean',
    ];

    public function instrumental(): BelongsTo
    {
        return $this->belongsTo(Instrumental::class);
    }

    public function isActiveNow(): bool
    {
        if (!$this->active) return false;
        $now = now();
        return $this->starts_at <= $now && $this->ends_at >= $now;
    }
}