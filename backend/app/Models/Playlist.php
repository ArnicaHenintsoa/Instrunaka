<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Playlist extends Model
{
    protected $fillable = ['user_id', 'name', 'description', 'is_public'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function instrumentals(): BelongsToMany
    {
        return $this->belongsToMany(Instrumental::class, 'playlist_items')
            ->withTimestamps();
    }
}