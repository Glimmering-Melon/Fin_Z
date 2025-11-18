<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alert extends Model
{
    protected $fillable = [
        'stock_id',
        'type',
        'severity',
        'z_score',
        'message',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'z_score' => 'decimal:4',
    ];

    public function stock(): BelongsTo
    {
        return $this->belongsTo(Stock::class);
    }
}
