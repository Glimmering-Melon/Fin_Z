<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class NewsController extends Controller
{
    public function index()
    {
        $userId = auth()->id() ?? 1; // Default to user 1 for testing
        
        // Get stocks from user's watchlist
        $watchlistStocks = \App\Models\Watchlist::where('user_id', $userId)
            ->with('stock')
            ->get();
        
        if ($watchlistStocks->isEmpty()) {
            return Inertia::render('News/Index', [
                'news' => [],
                'watchlistStocks' => [],
            ]);
        }
        
        // Get news for each stock from Finnhub
        $newsById = collect();
        $finnhubApiKey = env('FINNHUB_API_KEY');
        $from = now()->subDays(7)->format('Y-m-d');
        $to = now()->format('Y-m-d');
        
        \Log::info("Fetching news for " . $watchlistStocks->count() . " stocks");
        
        // Create a map of stock symbols to names
        $stockMap = $watchlistStocks->pluck('stock.name', 'stock.symbol')->toArray();
        
        // Limit to first 3 stocks to avoid timeout
        foreach ($watchlistStocks->take(3) as $watchlistItem) {
            $symbol = $watchlistItem->stock->symbol;
            
            try {
                \Log::info("Fetching news for {$symbol}");
                
                $response = \Http::timeout(15)->get('https://finnhub.io/api/v1/company-news', [
                    'symbol' => $symbol,
                    'from' => $from,
                    'to' => $to,
                    'token' => $finnhubApiKey,
                ]);
                
                if ($response->successful()) {
                    $newsData = $response->json();
                    \Log::info("Got " . count($newsData) . " articles for {$symbol}");
                    
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
                } else {
                    \Log::error("API error for {$symbol}: " . $response->status());
                }
                
            } catch (\Exception $e) {
                \Log::error("Error fetching news for {$symbol}: " . $e->getMessage());
            }
        }
        
        \Log::info("Total unique news: " . $newsById->count());
        
        // Sort by published date (newest first)
        $transformedNews = $newsById
            ->sortByDesc('published_at')
            ->values()
            ->toArray();
        
        return Inertia::render('News/Index', [
            'news' => $transformedNews,
            'watchlistStocks' => $watchlistStocks->map(fn($item) => [
                'symbol' => $item->stock->symbol,
                'name' => $item->stock->name,
            ])->toArray(),
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
