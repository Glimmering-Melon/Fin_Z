<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne; 

class Stock extends Model
{
    protected $fillable = [
        'symbol',
        'name',
        'exchange',
        'sector',
    ];

    public function prices(): HasMany
    {
        return $this->hasMany(StockPrice::class);
    }
    public function latestPrice(): HasOne
    {
        return $this->hasOne(StockPrice::class)->latestOfMany('date');
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }

    public function news(): BelongsToMany
    {
        return $this->belongsToMany(News::class);
    }

    public function watchlists(): HasMany
    {
        return $this->hasMany(Watchlist::class);
    }
}
