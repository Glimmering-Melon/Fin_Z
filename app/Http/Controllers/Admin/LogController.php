<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class LogController extends Controller
{
    public function index()
    {
        // TODO: Display system logs (admin only)
        // - API errors
        // - Cron job status
        // - Slow queries
        return Inertia::render('Admin/Logs/Index');
    }
}
