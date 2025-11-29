<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\StockController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\HeatmapController;
use App\Http\Controllers\Api\SimulatorController;
use App\Http\Controllers\Api\MarketDataController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\WatchlistController;

// Market data (public)
Route::get('/market/overview', [MarketDataController::class, 'overview']);
Route::get('/market/top-gainers', [MarketDataController::class, 'topGainers']);
Route::get('/market/top-losers', [MarketDataController::class, 'topLosers']);

// Search (public)
Route::get('/search', [SearchController::class, 'search']);

// Stock Data from Database (Primary - Fast & No API limits)
Route::prefix('stockdata')->group(function () {
    Route::get('/history/{symbol}', [\App\Http\Controllers\Api\StockDataController::class, 'history']);
    Route::get('/latest/{symbol}', [\App\Http\Controllers\Api\StockDataController::class, 'latest']);
    Route::get('/top-gainers', [\App\Http\Controllers\Api\StockDataController::class, 'topGainers']);
    Route::get('/top-losers', [\App\Http\Controllers\Api\StockDataController::class, 'topLosers']);
});

// Alpha Vantage API endpoints (Fallback - For intraday & new stocks)
Route::prefix('alphavantage')->group(function () {
    Route::get('/daily/{symbol}', [\App\Http\Controllers\Api\AlphaVantageController::class, 'daily']);
    Route::get('/intraday/{symbol}', [\App\Http\Controllers\Api\AlphaVantageController::class, 'intraday']);
    Route::get('/quote/{symbol}', [\App\Http\Controllers\Api\AlphaVantageController::class, 'quote']);
    Route::get('/search', [\App\Http\Controllers\Api\AlphaVantageController::class, 'search']);
});

// Finnhub API endpoints
Route::prefix('finnhub')->group(function () {
    Route::get('/quote/{symbol}', [\App\Http\Controllers\Api\FinnhubController::class, 'quote']);
    Route::get('/profile/{symbol}', [\App\Http\Controllers\Api\FinnhubController::class, 'profile']);
    Route::get('/news/company/{symbol}', [\App\Http\Controllers\Api\FinnhubController::class, 'companyNews']);
    Route::get('/news/market', [\App\Http\Controllers\Api\FinnhubController::class, 'marketNews']);
    Route::get('/search', [\App\Http\Controllers\Api\FinnhubController::class, 'search']);
    Route::get('/candles/{symbol}', [\App\Http\Controllers\Api\FinnhubController::class, 'candles']);
    Route::post('/quotes/multiple', [\App\Http\Controllers\Api\FinnhubController::class, 'multipleQuotes']);
    Route::get('/recommendations/{symbol}', [\App\Http\Controllers\Api\FinnhubController::class, 'recommendations']);
});

// External API endpoints
Route::prefix('external')->group(function () {
    // Stock data from external API
    Route::get('/stocks/{symbol}', [\App\Http\Controllers\Api\ExternalStockController::class, 'show']);
    Route::post('/stocks/multiple', [\App\Http\Controllers\Api\ExternalStockController::class, 'multiple']);
    Route::get('/stocks/search', [\App\Http\Controllers\Api\ExternalStockController::class, 'search']);
    Route::get('/market/indices', [\App\Http\Controllers\Api\ExternalStockController::class, 'indices']);
    
    // News from external API
    Route::get('/news', [\App\Http\Controllers\Api\ExternalNewsController::class, 'index']);
    Route::get('/news/search', [\App\Http\Controllers\Api\ExternalNewsController::class, 'search']);
    Route::get('/news/stock/{symbol}', [\App\Http\Controllers\Api\ExternalNewsController::class, 'stockNews']);
});

// Stocks
Route::get('/stocks', [StockController::class, 'index']);
Route::get('/stocks/{symbol}', [StockController::class, 'show']);
Route::get('/stocks/{symbol}/history', [StockController::class, 'history']);

// News
Route::get('/news', [NewsController::class, 'index']);
Route::get('/news/sentiment', [NewsController::class, 'sentiment']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    // Alerts
    Route::get('/alerts', [AlertController::class, 'index']);
    Route::patch('/alerts/{id}/read', [AlertController::class, 'markAsRead']);

    // Watchlist
    Route::get('/user/watchlist', [WatchlistController::class, 'index']);
    Route::post('/user/watchlist', [WatchlistController::class, 'store']);
    Route::delete('/user/watchlist/{id}', [WatchlistController::class, 'destroy']);
});

// Heatmap
Route::get('/heatmap', [HeatmapController::class, 'index']);

// Simulator
Route::post('/simulator/simulate', [SimulatorController::class, 'simulate']);
Route::post('/simulator/compare', [SimulatorController::class, 'compare']);
Route::post('/simulator/performance', [SimulatorController::class, 'performance']);

// Watchlist
Route::get('/user/watchlist', [WatchlistController::class, 'index']);
Route::post('/user/watchlist', [WatchlistController::class, 'store']);
Route::delete('/user/watchlist/{id}', [WatchlistController::class, 'destroy']);
