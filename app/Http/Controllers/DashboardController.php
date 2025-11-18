<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // TODO: Return dashboard overview with market data
        return Inertia::render('Dashboard/Index');
    }
}
