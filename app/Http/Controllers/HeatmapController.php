<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class HeatmapController extends Controller
{
    public function index()
    {
        // TODO: Return heatmap visualization page
        return Inertia::render('Heatmap/Index');
    }
}
