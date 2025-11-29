<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\SharesFakeUserData;
use Inertia\Inertia;

class SimulatorController extends Controller
{
    use SharesFakeUserData;

    public function index()
    {
        // TODO: Return investment simulator page
        return Inertia::render('Simulator/Index', $this->getFakeUserData());
    }
}
