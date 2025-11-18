<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    public function index(Request $request)
    {
        // TODO: Return alerts with filters (symbol, severity, date)
    }

    public function markAsRead($id)
    {
        // TODO: Mark alert as read
    }
}
