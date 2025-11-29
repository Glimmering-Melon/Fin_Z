<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\SharesFakeUserData;
use Inertia\Inertia;

class ChartController extends Controller
{
    use SharesFakeUserData;

    public function index()
    {
        // TODO: Return chart page with time-series data
        return Inertia::render('Chart/Index', $this->getFakeUserData());
    }
}
