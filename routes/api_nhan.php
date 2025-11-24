<?php

use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\NewsController;
use Illuminate\Support\Facades\Route;


// Alerts endpoints
Route::prefix('alerts')->group(function () {
    Route::get('/', [AlertController::class, 'index']);
    Route::get('/statistics', [AlertController::class, 'statistics']);
    Route::post('/{id}/mark-as-read', [AlertController::class, 'markAsRead']);
    Route::post('/mark-multiple-as-read', [AlertController::class, 'markMultipleAsRead']);
    Route::delete('/cleanup', [AlertController::class, 'cleanup']);
});

// News endpoints
Route::prefix('news')->group(function () {
    Route::get('/', [NewsController::class, 'index']);
    Route::get('/statistics', [NewsController::class, 'statistics']);
    Route::get('/sources', [NewsController::class, 'sources']);
    Route::get('/{id}', [NewsController::class, 'show']);
});
