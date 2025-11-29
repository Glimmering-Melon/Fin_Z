<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class NewsApiService
{
    private string $baseUrl;
    private ?string $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('services.news_api.base_url', 'https://newsapi.org/v2');
        $this->apiKey = config('services.news_api.key');
    }

    /**
     * Fetch latest news
     */
    public function getLatestNews(int $limit = 10): array
    {
        try {
            $cacheKey = "latest_news_{$limit}";
            
            // Cache 15 phút
            return Cache::remember($cacheKey, 900, function () use ($limit) {
                $response = Http::timeout(10)
                    ->get("{$this->baseUrl}/top-headlines", [
                        'apiKey' => $this->apiKey,
                        'country' => 'us',
                        'category' => 'business',
                        'pageSize' => $limit,
                    ]);

                if ($response->successful()) {
                    return $response->json('articles', []);
                }

                Log::error("Failed to fetch news", [
                    'status' => $response->status(),
                ]);

                return [];
            });
        } catch (\Exception $e) {
            Log::error("Error fetching news: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Fetch news by keyword
     */
    public function searchNews(string $keyword, int $limit = 10): array
    {
        try {
            $response = Http::timeout(10)
                ->get("{$this->baseUrl}/everything", [
                    'apiKey' => $this->apiKey,
                    'q' => $keyword,
                    'sortBy' => 'publishedAt',
                    'pageSize' => $limit,
                ]);

            if ($response->successful()) {
                return $response->json('articles', []);
            }

            return [];
        } catch (\Exception $e) {
            Log::error("Error searching news: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Fetch news for specific stock
     */
    public function getStockNews(string $symbol, int $limit = 5): array
    {
        return $this->searchNews($symbol, $limit);
    }
}
