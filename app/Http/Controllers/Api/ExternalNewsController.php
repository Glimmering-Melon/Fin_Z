<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\NewsApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExternalNewsController extends Controller
{
    private NewsApiService $newsService;

    public function __construct(NewsApiService $newsService)
    {
        $this->newsService = $newsService;
    }

    /**
     * Get latest news
     */
    public function index(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 10);
        $news = $this->newsService->getLatestNews($limit);

        return response()->json([
            'success' => true,
            'data' => $news,
            'count' => count($news),
        ]);
    }

    /**
     * Search news
     */
    public function search(Request $request): JsonResponse
    {
        $keyword = $request->input('q', '');
        $limit = $request->input('limit', 10);

        if (empty($keyword)) {
            return response()->json([
                'success' => false,
                'message' => 'Keyword is required',
            ], 400);
        }

        $news = $this->newsService->searchNews($keyword, $limit);

        return response()->json([
            'success' => true,
            'data' => $news,
            'count' => count($news),
        ]);
    }

    /**
     * Get news for specific stock
     */
    public function stockNews(string $symbol): JsonResponse
    {
        $news = $this->newsService->getStockNews($symbol);

        return response()->json([
            'success' => true,
            'symbol' => $symbol,
            'data' => $news,
            'count' => count($news),
        ]);
    }
}
