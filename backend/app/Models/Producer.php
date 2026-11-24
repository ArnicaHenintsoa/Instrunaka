<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Producer extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'display_name',
        'bio',
        'avatar_path',
        'verified',
    ];

    protected $casts = [
        'verified' => 'boolean',
    ];

    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function instrumentals(): HasMany
    {
        return $this->hasMany(Instrumental::class);
    }

  
    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'producer_follows')
            ->withTimestamps();
    }
}