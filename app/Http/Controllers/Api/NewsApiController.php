<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class NewsApiController extends Controller
{
    /**
     * Get fresh news data for current user
     */
    public function index(): JsonResponse
    {
        // Try to get user ID from session or default to 1 for testing
        $userId = auth()->id() ?? 1;
        
        \Log::info("Fresh News API: Processing request for user {$userId}", [
            'auth_check' => auth()->check(),
            'session_id' => session()->getId()
        ]);
        
        // Force fresh query - no cache
        $watchlistStocks = \App\Models\Watchlist::where('user_id', $userId)
            ->with('stock')
            ->get()
            ->fresh(); // Force fresh from database
            
        \Log::info("API: Fresh watchlist query for user {$userId}", [
            'count' => $watchlistStocks->count(),
            'symbols' => $watchlistStocks->pluck('stock.symbol')->toArray()
        ]);
        
        if ($watchlistStocks->isEmpty()) {
            return response()->json([
                'news' => [],
                'watchlistStocks' => [],
                'message' => 'No watchlist stocks found'
            ]);
        }
        
        // Get news for each stock from Finnhub
        $newsById = collect();
        $finnhubApiKey = env('FINNHUB_API_KEY');
        $from = now()->subDays(7)->format('Y-m-d');
        $to = now()->format('Y-m-d');
        
        // Create a map of stock symbols to names
        $stockMap = $watchlistStocks->pluck('stock.name', 'stock.symbol')->toArray();
        
        // Limit to first 3 stocks to avoid timeout
        foreach ($watchlistStocks->take(3) as $watchlistItem) {
            $symbol = $watchlistItem->stock->symbol;
            
            try {
                \Log::info("API: Fetching news for {$symbol}");
                
                $response = \Http::timeout(15)->get('https://finnhub.io/api/v1/company-news', [
                    'symbol' => $symbol,
                    'from' => $from,
                    'to' => $to,
                    'token' => $finnhubApiKey,
                ]);
                
                if ($response->successful()) {
                    $newsData = $response->json();
                    
                    // Take only first 10 articles per stock
                    foreach (array_slice($newsData, 0, 10) as $item) {
                        $newsId = $item['id'] ?? md5($item['url'] ?? uniqid());
                        
                        // If news already exists, just add the symbol
                        if ($newsById->has($newsId)) {
                            $existing = $newsById->get($newsId);
                            if (!in_array($symbol, $existing['symbols'])) {
                                $existing['symbols'][] = $symbol;
                                $newsById->put($newsId, $existing);
                            }
                        } else {
                            // New news item
                            $sentiment = $this->analyzeSentiment($item['headline'] ?? '', $item['summary'] ?? '');
                            
                            $newsById->put($newsId, [
                                'id' => $newsId,
                                'title' => $item['headline'] ?? '',
                                'summary' => $item['summary'] ?? '',
                                'url' => $item['url'] ?? '',
                                'image' => $item['image'] ?? null,
                                'source' => $item['source'] ?? 'Unknown',
                                'published_at' => isset($item['datetime']) ? date('Y-m-d H:i:s', $item['datetime']) : now(),
                                'category' => $item['category'] ?? 'general',
                                'symbols' => [$symbol],
                                'sentiment' => $sentiment['label'],
                                'sentiment_score' => $sentiment['score'],
                            ]);
                        }
                    }
                }
                
            } catch (\Exception $e) {
                \Log::error("API: Error fetching news for {$symbol}: " . $e->getMessage());
            }
        }
        
        // Sort by published date (newest first)
        $transformedNews = $newsById
            ->sortByDesc('published_at')
            ->values()
            ->toArray();
        
        return response()->json([
            'news' => $transformedNews,
            'watchlistStocks' => $watchlistStocks->map(fn($item) => [
                'symbol' => $item->stock->symbol,
                'name' => $item->stock->name,
            ])->toArray(),
            'timestamp' => now()->toISOString(),
        ]);
    }
    
    /**
     * Simple sentiment analysis based on keywords
     */
    private function analyzeSentiment(string $title, string $summary): array
    {
        $text = strtolower($title . ' ' . $summary);
        
        $positiveWords = ['gain', 'profit', 'growth', 'surge', 'rally', 'bullish', 'upgrade', 'beat', 'strong', 'rise', 'up', 'high', 'success', 'positive', 'boost', 'jump'];
        $negativeWords = ['loss', 'drop', 'fall', 'decline', 'crash', 'bearish', 'downgrade', 'miss', 'weak', 'down', 'low', 'fail', 'negative', 'cut', 'plunge'];
        
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
            return ['label' => 'neutral', 'score' => 0.5];
        }
        
        $score = $positiveCount / $total;
        
        if ($score > 0.6) {
            return ['label' => 'positive', 'score' => $score];
        } elseif ($score < 0.4) {
            return ['label' => 'negative', 'score' => $score];
        } else {
            return ['label' => 'neutral', 'score' => $score];
        }
    }
}