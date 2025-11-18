<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemLog extends Model
{
    protected $fillable = [
        'type',
        'message',
        'details',
        'level',
    ];

    protected $casts = [
        'details' => 'array',
    ];
}
