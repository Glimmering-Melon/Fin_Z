<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class News extends Model
{
    protected $fillable = [
        'title',
        'content',
        'url',
        'source',
        'sentiment',
        'sentiment_score',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'sentiment_score' => 'decimal:2',
    ];

    public function stocks(): BelongsToMany
    {
        return $this->belongsToMany(Stock::class);
    }
}
