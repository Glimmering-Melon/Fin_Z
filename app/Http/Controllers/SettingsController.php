<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function index()
    {
        // TODO: Return settings page
        return Inertia::render('Settings/Index');
    }

    public function update(Request $request)
    {
        // TODO: Update user settings
    }
}
