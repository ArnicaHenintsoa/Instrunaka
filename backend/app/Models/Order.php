<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference',
        'user_id',
        'instrumental_id',
        'pack_id',
        'type',
        'amount',
        'original_amount',
        'discount_amount',
        'promo_code_id',
        'status',
        'refund_required',
        'validated_by',
        'validated_at',
        'admin_note',
    ];

    protected $casts = [
        'amount'          => 'integer',
        'original_amount' => 'integer',
        'discount_amount' => 'integer',
        'refund_required' => 'boolean',
        'validated_at'    => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function instrumental(): BelongsTo
    {
        return $this->belongsTo(Instrumental::class);
    }

    public function pack(): BelongsTo
    {
        return $this->belongsTo(Pack::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function validator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function isExclusive(): bool
    {
        return $this->type === 'exclusive';
    }

    public function isNonExclusive(): bool
    {
        return $this->type === 'non_exclusive';
    }

    public function isPack(): bool
    {
        return $this->type === 'pack';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isValidated(): bool
    {
        return $this->status === 'validated';
    }
}