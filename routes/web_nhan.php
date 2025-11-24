<?php

use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\NewsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;



// Alerts Page
Route::get('/alerts', function () {
    $alerts = app(AlertController::class)->index(request());
    $statistics = app(AlertController::class)->statistics();
    
    return Inertia::render('Alerts/Index', [
        'alerts' => $alerts->getData(),
        'filters' => request()->only(['severity', 'symbol', 'is_read']),
        'statistics' => $statistics->getData(),
    ]);
})->name('alerts.index');

// News Page
Route::get('/news', function () {
    $news = app(NewsController::class)->index(request());
    $statistics = app(NewsController::class)->statistics();
    $sources = app(NewsController::class)->sources();
    
    return Inertia::render('News/Index', [
        'news' => $news->getData(),
        'filters' => request()->only(['sentiment', 'min_score', 'keyword', 'source']),
        'statistics' => $statistics->getData(),
        'sources' => $sources->getData(),
    ]);
})->name('news.index');
