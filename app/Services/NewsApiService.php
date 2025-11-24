<?php

namespace App\Services;

use App\Models\News;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class NewsApiService
{
    private string $baseUrl;
    private string $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('stock.news_api.base_url');
        $this->apiKey = config('stock.news_api.api_key');
    }

    /**
     * Fetch news from API
     */
    public function fetchNews(array $symbols = [], int $limit = 50): array
    {
        try {
            // Example using NewsAPI.org format
            // Adjust based on your actual API provider
            $response = Http::timeout(30)
                ->get($this->baseUrl . '/everything', [
                    'apiKey' => $this->apiKey,
                    'q' => 'stock OR market OR finance',
                    'language' => 'en',
                    'sortBy' => 'publishedAt',
                    'pageSize' => $limit,
                ]);

            if (!$response->successful()) {
                Log::error('News API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return [];
            }

            $data = $response->json();
            $articles = $data['articles'] ?? [];

            return array_map(function ($article) {
                return [
                    'title' => $article['title'] ?? '',
                    'content' => $article['description'] ?? $article['content'] ?? '',
                    'url' => $article['url'] ?? '',
                    'source' => $article['source']['name'] ?? 'Unknown',
                    'published_at' => isset($article['publishedAt']) 
                        ? Carbon::parse($article['publishedAt']) 
                        : now(),
                ];
            }, $articles);

        } catch (\Exception $e) {
            Log::error('Failed to fetch news', [
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Analyze sentiment using keyword-based approach
     * For production, integrate with IBM Watson, MeaningCloud, or AYLIEN
     */
    public function analyzeSentiment(string $text): array
    {
        try {
            // Simple keyword-based sentiment analysis
            // Replace with actual API call for production
            $text = strtolower($text);
            
            $positiveWords = [
                'gain', 'profit', 'growth', 'increase', 'rise', 'surge', 
                'bullish', 'positive', 'strong', 'up', 'high', 'success',
                'rally', 'boom', 'advance', 'improve', 'outperform'
            ];
            
            $negativeWords = [
                'loss', 'decline', 'decrease', 'fall', 'drop', 'crash',
                'bearish', 'negative', 'weak', 'down', 'low', 'fail',
                'plunge', 'slump', 'retreat', 'worsen', 'underperform'
            ];

            $positiveCount = 0;
            $negativeCount = 0;

            foreach ($positiveWords as $word) {
                $positiveCount += substr_count($text, $word);
            }

            foreach ($negativeWords as $word) {
                $negativeCount += substr_count($text, $word);
            }

            $total = $positiveCount + $negativeCount;
            
            if ($total === 0) {
                return [
                    'sentiment' => 'neutral',
                    'sentiment_score' => 0.5,
                ];
            }

            $score = $positiveCount / $total;
            
            if ($score > 0.6) {
                $sentiment = 'positive';
            } elseif ($score < 0.4) {
                $sentiment = 'negative';
            } else {
                $sentiment = 'neutral';
            }

            return [
                'sentiment' => $sentiment,
                'sentiment_score' => round($score, 2),
            ];

        } catch (\Exception $e) {
            Log::error('Sentiment analysis failed', [
                'error' => $e->getMessage()
            ]);
            
            return [
                'sentiment' => 'neutral',
                'sentiment_score' => 0.5,
            ];
        }
    }

    /**
     * Save news to database with duplicate check
     */
    public function saveNews(array $newsData): ?News
    {
        try {
            // Check for duplicate by URL
            $existing = News::where('url', $newsData['url'])->first();
            
            if ($existing) {
                Log::info('Duplicate news skipped', ['url' => $newsData['url']]);
                return null;
            }

            // Analyze sentiment
            $sentiment = $this->analyzeSentiment(
                $newsData['title'] . ' ' . $newsData['content']
            );

            $newsData = array_merge($newsData, $sentiment);

            return News::create($newsData);

        } catch (\Exception $e) {
            Log::error('Failed to save news', [
                'error' => $e->getMessage(),
                'url' => $newsData['url'] ?? 'unknown'
            ]);
            return null;
        }
    }
}

