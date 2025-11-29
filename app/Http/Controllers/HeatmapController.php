<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\SharesFakeUserData;
use Inertia\Inertia;

class HeatmapController extends Controller
{
    use SharesFakeUserData;

    public function index()
    {
        // TODO: Return heatmap visualization page
        return Inertia::render('Heatmap/Index', $this->getFakeUserData());
    }
}
