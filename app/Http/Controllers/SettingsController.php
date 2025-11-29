<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\SharesFakeUserData;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    use SharesFakeUserData;

    public function index()
    {
        // TODO: Return settings page
        return Inertia::render('Settings/Index', $this->getFakeUserData());
    }

    public function update(Request $request)
    {
        // TODO: Update user settings
    }
}
