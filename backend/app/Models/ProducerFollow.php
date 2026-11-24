<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProducerFollow extends Model
{
    protected $fillable = ['user_id', 'producer_id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function producer(): BelongsTo
    {
        return $this->belongsTo(Producer::class);
    }
}