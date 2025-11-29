<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ChartController;
use App\Http\Controllers\HeatmapController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\SimulatorController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\ResetPasswordController;

// Test route (remove after debugging)
Route::get('/test', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Laravel is working!',
        'auth' => auth()->check() ? 'Authenticated' : 'Guest',
        'user' => auth()->user(),
    ]);
});

// Guest routes (authentication)
Route::middleware(['guest'])->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
    
    Route::get('/forgot-password', [ForgotPasswordController::class, 'show'])->name('password.request');
    Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLink'])->name('password.email');
    
    Route::get('/reset-password/{token}', [ResetPasswordController::class, 'show'])->name('password.reset');
    Route::post('/reset-password', [ResetPasswordController::class, 'reset'])->name('password.update');
});

// Authenticated routes
Route::middleware(['auth'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/chart', [ChartController::class, 'index'])->name('chart');
    Route::get('/heatmap', [HeatmapController::class, 'index'])->name('heatmap');
    Route::get('/news', [NewsController::class, 'index'])->name('news');
    Route::get('/simulator', [SimulatorController::class, 'index'])->name('simulator');
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings');
    Route::patch('/settings', [SettingsController::class, 'update'])->name('settings.update');
});
