<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'status',
        'is_producer',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_producer'       => 'boolean',
        ];
    }

  

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function producer(): HasOne
    {
        return $this->hasOne(Producer::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

   
    public function favorites(): BelongsToMany
    {
        return $this->belongsToMany(Instrumental::class, 'favorites')
            ->withTimestamps();
    }

    
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

   
    public function followedProducers(): BelongsToMany
    {
        return $this->belongsToMany(Producer::class, 'producer_follows')
            ->withTimestamps();
    }

  
    public function playlists(): HasMany
    {
        return $this->hasMany(Playlist::class);
    }

  
    public function producerRequests(): HasMany
    {
        return $this->hasMany(ProducerRequest::class);
    }

    
    public function latestProducerRequest(): HasOne
    {
        return $this->hasOne(ProducerRequest::class)->latestOfMany();
    }

   
    public function sessions(): HasMany
    {
        return $this->hasMany(UserSession::class);
    }

   
    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    

    public function isAdmin(): bool
    {
        return $this->role?->name === 'admin';
    }

    public function isProducer(): bool
    {
        return (bool) $this->is_producer;
    }

   
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new \App\Notifications\ResetPasswordNotification($token));
    }
}