<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AlertController extends Controller
{
    /**
     * Get list of alerts with filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = Alert::with('stock');

        // Filter by symbol
        if ($request->has('symbol')) {
            $query->whereHas('stock', function ($q) use ($request) {
                $q->where('symbol', 'like', '%' . $request->symbol . '%');
            });
        }

        // Filter by severity
        if ($request->has('severity')) {
            $query->where('severity', $request->severity);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Filter by read status
        if ($request->has('is_read')) {
            $query->where('is_read', $request->boolean('is_read'));
        }

        // Order by newest first
        $query->orderBy('created_at', 'desc');

        // Paginate results
        $perPage = $request->input('per_page', 20);
        $alerts = $query->paginate($perPage);

        return response()->json($alerts);
    }

    /**
     * Mark alert as read
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $alert = Alert::findOrFail($id);
        
        $alert->update(['is_read' => true]);

        return response()->json([
            'message' => 'Alert marked as read',
            'alert' => $alert
        ]);
    }

    /**
     * Mark multiple alerts as read
     */
    public function markMultipleAsRead(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:alerts,id'
        ]);

        $count = Alert::whereIn('id', $request->ids)
            ->update(['is_read' => true]);

        return response()->json([
            'message' => "{$count} alerts marked as read",
            'count' => $count
        ]);
    }

    /**
     * Get alert statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total' => Alert::count(),
            'unread' => Alert::where('is_read', false)->count(),
            'by_severity' => [
                'high' => Alert::where('severity', 'high')->count(),
                'medium' => Alert::where('severity', 'medium')->count(),
                'low' => Alert::where('severity', 'low')->count(),
            ],
            'by_type' => [
                'volume_spike' => Alert::where('type', 'volume_spike')->count(),
                'price_jump' => Alert::where('type', 'price_jump')->count(),
            ],
            'recent' => Alert::where('created_at', '>=', now()->subDays(7))->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Delete old read alerts
     */
    public function cleanup(Request $request): JsonResponse
    {
        $days = $request->input('days', 7);
        
        $count = Alert::where('is_read', true)
            ->where('created_at', '<', now()->subDays($days))
            ->delete();

        return response()->json([
            'message' => "Deleted {$count} old alerts",
            'count' => $count
        ]);
    }
}
