<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Genre extends Model
{
    protected $fillable = ['name', 'label'];

    public function instrumentals(): HasMany
    {
        return $this->hasMany(Instrumental::class);
    }
}