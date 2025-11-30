<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Stock;

class HeatmapController extends Controller
{
    public function index(Request $request)
    {
        $userId = auth()->id() ?? 1; // Default to user 1 for testing
        
        // Get stocks from user's watchlist
        $watchlistStockIds = \App\Models\Watchlist::where('user_id', $userId)
            ->pluck('stock_id');
        
        if ($watchlistStockIds->isEmpty()) {
            return response()->json([
                'status' => 'success',
                'data' => [],
                'meta' => [
                    'total_stocks' => 0,
                    'timestamp' => now()->toIso8601String(),
                    'message' => 'No stocks in watchlist'
                ]
            ]);
        }
        
        // Get stock data with latest prices
        $stocks = Stock::whereIn('id', $watchlistStockIds)
            ->with(['latestPrice'])
            ->get();
        
        $heatmapData = $stocks
            ->filter(function ($stock) {
                return $stock->latestPrice !== null;
            })
            ->map(function ($stock) {
                $latestPrice = $stock->latestPrice;
                
                // Get previous price for change calculation
                $previousPrice = \App\Models\StockPrice::where('stock_id', $stock->id)
                    ->where('date', '<', $latestPrice->date)
                    ->orderBy('date', 'desc')
                    ->first();
                
                $changePercent = 0;
                if ($previousPrice && $previousPrice->close > 0) {
                    $changePercent = (($latestPrice->close - $previousPrice->close) / $previousPrice->close) * 100;
                }
                
                return [
                    'symbol' => $stock->symbol,
                    'name' => $stock->name,
                    'sector' => $stock->sector ?? 'Other',
                    'exchange' => $stock->exchange,
                    'price' => (float) $latestPrice->close,
                    'volume' => (int) $latestPrice->volume,
                    'change' => round($changePercent, 2),
                    'marketCap' => (float) $latestPrice->close * (int) $latestPrice->volume, // Approximate
                ];
            });
        
        return response()->json([
            'status' => 'success',
            'data' => $heatmapData->values(),
            'meta' => [
                'total_stocks' => $heatmapData->count(),
                'timestamp' => now()->toIso8601String()
            ]
        ]);
    }
}
