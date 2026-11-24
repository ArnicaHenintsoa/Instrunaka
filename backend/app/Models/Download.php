<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Download extends Model
{
    protected $fillable = [
        'user_id',
        'order_id',
        'instrumental_file_id',
        'file_type',
        'ip_address',
        'user_agent',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function file(): BelongsTo
    {
        return $this->belongsTo(InstrumentalFile::class, 'instrumental_file_id');
    }
}