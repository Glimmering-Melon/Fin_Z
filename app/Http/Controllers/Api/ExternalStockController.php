<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StockApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExternalStockController extends Controller
{
    private StockApiService $stockService;

    public function __construct(StockApiService $stockService)
    {
        $this->stockService = $stockService;
    }

    /**
     * Get stock data
     */
    public function show(string $symbol): JsonResponse
    {
        $data = $this->stockService->getStockData($symbol);

        if (!$data) {
            return response()->json([
                'success' => false,
                'message' => 'Stock not found or API error',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get multiple stocks
     */
    public function multiple(Request $request): JsonResponse
    {
        $symbols = $request->input('symbols', []);

        if (empty($symbols)) {
            return response()->json([
                'success' => false,
                'message' => 'Symbols array is required',
            ], 400);
        }

        $data = $this->stockService->getMultipleStocks($symbols);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get market indices
     */
    public function indices(): JsonResponse
    {
        $data = $this->stockService->getMarketIndices();

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Search stocks
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->input('q', '');

        if (empty($query)) {
            return response()->json([
                'success' => false,
                'message' => 'Query is required',
            ], 400);
        }

        $results = $this->stockService->searchStocks($query);

        return response()->json([
            'success' => true,
            'data' => $results,
            'count' => count($results),
        ]);
    }
}
