<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\StockController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\HeatmapController;
use App\Http\Controllers\Api\SimulatorController;
use App\Http\Controllers\Api\WatchlistController;

// TODO: Add authentication middleware

// Stocks
Route::get('/stocks', [StockController::class, 'index']);
Route::get('/stocks/{symbol}', [StockController::class, 'show']);
Route::get('/stocks/{symbol}/history', [StockController::class, 'history']);

// News (Nhẩn)
Route::get('/news', [NewsController::class, 'index']);
Route::get('/news/statistics', [NewsController::class, 'statistics']);
Route::get('/news/sources', [NewsController::class, 'sources']);
Route::get('/news/{id}', [NewsController::class, 'show']);

// Alerts (Nhẩn)
Route::get('/alerts', [AlertController::class, 'index']);
Route::get('/alerts/statistics', [AlertController::class, 'statistics']);
Route::post('/alerts/{id}/mark-as-read', [AlertController::class, 'markAsRead']);
Route::post('/alerts/mark-multiple-as-read', [AlertController::class, 'markMultipleAsRead']);
Route::delete('/alerts/cleanup', [AlertController::class, 'cleanup']);

// Heatmap
Route::get('/heatmap', [HeatmapController::class, 'index']);

// Simulator
Route::post('/simulator', [SimulatorController::class, 'simulate']);

// Watchlist
Route::get('/user/watchlist', [WatchlistController::class, 'index']);
Route::post('/user/watchlist', [WatchlistController::class, 'store']);
Route::delete('/user/watchlist/{id}', [WatchlistController::class, 'destroy']);
