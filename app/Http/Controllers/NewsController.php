<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\SharesFakeUserData;
use Inertia\Inertia;

class NewsController extends Controller
{
    use SharesFakeUserData;

    public function index()
    {
        // TODO: Return news feed page with sentiment analysis
        return Inertia::render('News/Index', $this->getFakeUserData());
    }
}
