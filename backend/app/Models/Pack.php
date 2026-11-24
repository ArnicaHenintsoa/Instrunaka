<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Pack extends Model
{
    protected $fillable = ['name', 'description', 'price', 'cover_path', 'active'];

    protected $casts = [
        'active' => 'boolean',
        'price'  => 'integer',
    ];

    public function instrumentals(): BelongsToMany
    {
        return $this->belongsToMany(Instrumental::class, 'pack_items')
            ->withTimestamps();
    }

    
    public function items(): BelongsToMany
    {
        return $this->instrumentals();
    }

    public function getOriginalPriceAttribute(): int
    {
        return (int) $this->instrumentals->sum('non_exclusive_price');
    }

    public function getSavingsAttribute(): int
    {
        return $this->original_price - $this->price;
    }
}