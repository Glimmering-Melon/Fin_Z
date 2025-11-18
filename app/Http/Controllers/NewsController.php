<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class NewsController extends Controller
{
    public function index()
    {
        // TODO: Return news feed page with sentiment analysis
        return Inertia::render('News/Index');
    }
}
