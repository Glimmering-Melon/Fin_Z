<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AlphaVantageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlphaVantageController extends Controller
{
    private AlphaVantageService $alphaVantage;

    public function __construct(AlphaVantageService $alphaVantage)
    {
        $this->alphaVantage = $alphaVantage;
    }

    /**
     * Get daily time series
     */
    public function daily(string $symbol): JsonResponse
    {
        $data = $this->alphaVantage->getDailyTimeSeries(strtoupper($symbol), true);

        if (!$data) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch daily data. API limit may be reached.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get intraday time series
     */
    public function intraday(Request $request, string $symbol): JsonResponse
    {
        $interval = $request->input('interval', '5min');
        $data = $this->alphaVantage->getIntradayTimeSeries(strtoupper($symbol), $interval);

        if (!$data) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch intraday data',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get quote
     */
    public function quote(string $symbol): JsonResponse
    {
        $data = $this->alphaVantage->getQuote(strtoupper($symbol));

        if (!$data) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch quote',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Search symbols
     */
    public function search(Request $request): JsonResponse
    {
        $keywords = $request->input('q', '');

        if (empty($keywords)) {
            return response()->json([
                'success' => false,
                'message' => 'Keywords parameter is required',
            ], 400);
        }

        $results = $this->alphaVantage->searchSymbols($keywords);

        return response()->json([
            'success' => true,
            'data' => $results,
        ]);
    }
}
