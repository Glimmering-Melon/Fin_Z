<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Stock;

class HeatmapController extends Controller
{
    public function index(Request $request)
    {
        // TODO: Return heatmap data with filters (sector, timeframe)
        $query = Stock::query();
        $query->with(['latestPrice' => function ($q) {
            $q->select(
                'stock_prices.stock_id', 
                'stock_prices.date', 
                'stock_prices.open', 
                'stock_prices.close', 
                'stock_prices.volume'
            );
        }]);

        if ($request->has('exchange')) {
            $query->where('exchange', $request->input('exchange'));
        }
        if ($request->has('sector')) {
            $query->where('sector', $request->input('sector'));
        }
        $stocks = $query->get();
        $heatmapData = $stocks 
        -> filter(function ($stock) {
        return $stock->latestPrice !== null && $stock->latestPrice->open > 0;
        })
        -> map(function ($stock) {
                $price = $stock->latestPrice;
                $changePercent = (($price->close - $price->open) / $price->open) * 100;
                return [
                    'symbol' => $stock->symbol,
                    'name'   => $stock->name,
                    'sector' => $stock->sector,
                    'price'  => $price->close,
                    'volume' => $price->volume, 
                    'change' => round($changePercent, 2), 
                ];
        });
        $groupedData = $heatmapData->groupBy('sector')->map(function ($items, $sector) {
            return [
                'name' => $sector,
                'total_volume' => $items->sum('volume'),
                'stocks' => $items->values() 
            ];
        })->values();
        return response()->json([
            'status' => 'success',
            'data' => $groupedData,
            'meta' => [
                'total_stocks' => $heatmapData->count(),
                'timestamp' => now()->toIso8601String()
            ]
        ]);
    }
}
