<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FinnhubService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinnhubController extends Controller
{
    private FinnhubService $finnhub;

    public function __construct(FinnhubService $finnhub)
    {
        $this->finnhub = $finnhub;
    }

    /**
     * Get stock quote
     */
    public function quote(string $symbol): JsonResponse
    {
        $data = $this->finnhub->getQuote(strtoupper($symbol));

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
     * Get company profile
     */
    public function profile(string $symbol): JsonResponse
    {
        $data = $this->finnhub->getCompanyProfile(strtoupper($symbol));

        if (!$data) {
            return response()->json([
                'success' => false,
                'message' => 'Company not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get company news
     */
    public function companyNews(Request $request, string $symbol): JsonResponse
    {
        $from = $request->input('from');
        $to = $request->input('to');

        $news = $this->finnhub->getCompanyNews(strtoupper($symbol), $from, $to);

        return response()->json([
            'success' => true,
            'data' => $news,
            'count' => count($news),
        ]);
    }

    /**
     * Get market news
     */
    public function marketNews(Request $request): JsonResponse
    {
        $category = $request->input('category', 'general');
        $news = $this->finnhub->getMarketNews($category);

        return response()->json([
            'success' => true,
            'data' => $news,
            'count' => count($news),
        ]);
    }

    /**
     * Search symbols
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->input('q', '');

        if (empty($query)) {
            return response()->json([
                'success' => false,
                'message' => 'Query parameter is required',
            ], 400);
        }

        $results = $this->finnhub->searchSymbol($query);

        return response()->json([
            'success' => true,
            'data' => $results,
            'count' => count($results),
        ]);
    }

    /**
     * Get candles (OHLC data)
     */
    public function candles(Request $request, string $symbol): JsonResponse
    {
        $resolution = $request->input('resolution', 'D');
        $from = $request->input('from');
        $to = $request->input('to');

        $data = $this->finnhub->getCandles(
            strtoupper($symbol),
            $resolution,
            $from ? strtotime($from) : null,
            $to ? strtotime($to) : null
        );

        if (!$data) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch candles',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get multiple quotes
     */
    public function multipleQuotes(Request $request): JsonResponse
    {
        $symbols = $request->input('symbols', []);

        if (empty($symbols)) {
            return response()->json([
                'success' => false,
                'message' => 'Symbols array is required',
            ], 400);
        }

        $symbols = array_map('strtoupper', $symbols);
        $data = $this->finnhub->getMultipleQuotes($symbols);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get recommendation trends
     */
    public function recommendations(string $symbol): JsonResponse
    {
        $data = $this->finnhub->getRecommendationTrends(strtoupper($symbol));

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}
