<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\SharesFakeUserData;
use Inertia\Inertia;

class DashboardController extends Controller
{
    use SharesFakeUserData;

    public function index()
    {
        // TODO: Return dashboard overview with market data
        return Inertia::render('Dashboard/Index', $this->getFakeUserData());
    }
}
