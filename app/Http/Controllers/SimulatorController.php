<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class SimulatorController extends Controller
{
    public function index()
    {
        // TODO: Return investment simulator page
        return Inertia::render('Simulator/Index');
    }
}
