<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InstrumentalFile extends Model
{
    protected $fillable = [
        'instrumental_id',
        'type',
        'path',
        'original_name',
        'size_bytes',
        'mime_type',
    ];

    protected $casts = [
        'size_bytes' => 'integer',
    ];

    public function instrumental(): BelongsTo
    {
        return $this->belongsTo(Instrumental::class);
    }

    public function isPreview(): bool
    {
        return $this->type === 'preview';
    }
}