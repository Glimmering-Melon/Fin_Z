<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ChartController;
use App\Http\Controllers\HeatmapController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\SimulatorController;
use App\Http\Controllers\SettingsController;
use Inertia\Inertia;

// TODO: Add authentication routes

// Test route for Watchlist (no auth required)
Route::get('/test/watchlist', function () {
    return Inertia::render('WatchlistTest');
})->name('test.watchlist');

Route::middleware(['auth'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/chart', [ChartController::class, 'index'])->name('chart');
    Route::get('/heatmap', [HeatmapController::class, 'index'])->name('heatmap');
    Route::get('/news', [NewsController::class, 'index'])->name('news');
    Route::get('/simulator', [SimulatorController::class, 'index'])->name('simulator');
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings');
    Route::patch('/settings', [SettingsController::class, 'update'])->name('settings.update');
});
