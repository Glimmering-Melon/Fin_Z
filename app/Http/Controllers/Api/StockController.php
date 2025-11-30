<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StockDataService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StockController extends Controller
{
    private StockDataService $stockDataService;

    public function __construct(StockDataService $stockDataService)
    {
        $this->stockDataService = $stockDataService;
    }

    public function index()
    {
        // Only return stocks that have price data
        $stocks = \App\Models\Stock::select('id', 'symbol', 'name', 'exchange', 'sector')
            ->whereHas('prices')
            ->orderBy('symbol', 'asc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $stocks,
            'count' => $stocks->count(),
        ]);
    }

    public function show($symbol)
    {
        // TODO: Return stock details by symbol
    }

    public function history($symbol, Request $request): JsonResponse
    {
        \Log::info("StockController::history called", ['symbol' => $symbol]);
        
        $days = $request->input('days', 100);
        
        $data = $this->stockDataService->getHistoricalData($symbol, $days);
        
        \Log::info("Data retrieved", ['has_data' => !is_null($data)]);
        
        if (!$data) {
            return response()->json([
                'error' => 'Stock not found or data unavailable',
                'symbol' => $symbol
            ], 404);
        }
        
        return response()->json([
            'symbol' => strtoupper($symbol),
            'data' => $data
        ]);
    }
}
