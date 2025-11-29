<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StockDataService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockDataController extends Controller
{
    private StockDataService $stockData;

    public function __construct(StockDataService $stockData)
    {
        $this->stockData = $stockData;
    }

    /**
     * Get historical data from database
     */
    public function history(string $symbol, Request $request): JsonResponse
    {
        $days = $request->input('days', 100);
        $data = $this->stockData->getHistoricalData(strtoupper($symbol), $days);

        if (!$data) {
            return response()->json([
                'success' => false,
                'message' => 'No data available',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $data,
            'source' => 'database',
        ]);
    }

    /**
     * Get latest price
     */
    public function latest(string $symbol): JsonResponse
    {
        $data = $this->stockData->getLatestPrice(strtoupper($symbol));

        if (!$data) {
            return response()->json([
                'success' => false,
                'message' => 'No data available',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get top gainers
     */
    public function topGainers(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 10);
        $data = $this->stockData->getTopMovers('gainers', $limit);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get top losers
     */
    public function topLosers(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 10);
        $data = $this->stockData->getTopMovers('losers', $limit);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}
