<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class ChartController extends Controller
{
    public function index()
    {
        // TODO: Return chart page with time-series data
        return Inertia::render('Chart/Index');
    }
}
