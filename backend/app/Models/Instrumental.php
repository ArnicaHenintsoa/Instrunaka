<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Instrumental extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'producer_id',
        'genre_id',
        'mood_id',
        'rhythm_id',
        'title',
        'description',
        'bpm',
        'musical_key',
        'duration_seconds',
        'cover_path',
        'status',
        'non_exclusive_price',
        'exclusive_price',
        'published_at',
    ];

    protected $casts = [
        'published_at'        => 'datetime',
        'non_exclusive_price' => 'integer',
        'exclusive_price'     => 'integer',
        'bpm'                 => 'integer',
        'duration_seconds'    => 'integer',
    ];

   

    public function producer(): BelongsTo
    {
        return $this->belongsTo(Producer::class);
    }

    public function genre(): BelongsTo
    {
        return $this->belongsTo(Genre::class);
    }

    public function mood(): BelongsTo
    {
        return $this->belongsTo(Mood::class);
    }

    public function rhythm(): BelongsTo
    {
        return $this->belongsTo(Rhythm::class);
    }

    public function files(): HasMany
    {
        return $this->hasMany(InstrumentalFile::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    public function favoritedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'favorites')
            ->withTimestamps();
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function playlists(): BelongsToMany
    {
        return $this->belongsToMany(Playlist::class, 'playlist_items')
            ->withTimestamps();
    }

    public function packs(): BelongsToMany
    {
        return $this->belongsToMany(Pack::class, 'pack_items')
            ->withTimestamps();
    }

    public function promotions(): HasMany
    {
        return $this->hasMany(Promotion::class);
    }

    public function activePromotion(): ?Promotion
    {
        return $this->promotions()
            ->where('active', true)
            ->where('starts_at', '<=', now())
            ->where('ends_at', '>=', now())
            ->first();
    }

  

    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }

    public function averageRating(): float
    {
        return round($this->reviews()->avg('rating') ?? 0, 1);
    }
}