<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AlertController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Alert::with('stock');

        // Apply filters
        if ($request->has('severity') && $request->severity !== 'all') {
            $query->where('severity', $request->severity);
        }

        if ($request->has('is_read')) {
            $query->where('is_read', $request->boolean('is_read'));
        }

        if ($request->has('symbol')) {
            $query->whereHas('stock', function ($q) use ($request) {
                $q->where('symbol', 'like', '%' . $request->symbol . '%');
            });
        }

        // Order by newest first
        $query->orderBy('created_at', 'desc');

        // Paginate
        $alerts = $query->paginate(20)->withQueryString();

        // Get statistics
        $statistics = [
            'total' => Alert::count(),
            'unread' => Alert::where('is_read', false)->count(),
            'by_severity' => [
                'high' => Alert::where('severity', 'high')->count(),
                'medium' => Alert::where('severity', 'medium')->count(),
                'low' => Alert::where('severity', 'low')->count(),
            ],
        ];

        return Inertia::render('Alerts/Index', [
            'alerts' => $alerts,
            'filters' => $request->only(['severity', 'symbol', 'is_read']),
            'statistics' => $statistics,
        ]);
    }
}
