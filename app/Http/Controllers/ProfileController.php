<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\SharesFakeUserData;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfileController extends Controller
{
    use SharesFakeUserData;

    public function index()
    {
        // TODO: Return user profile page
        return Inertia::render('Profile/Index', $this->getFakeUserData());
    }

    public function update(Request $request)
    {
        // TODO: Update user profile
    }
}
