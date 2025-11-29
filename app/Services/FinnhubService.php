<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class FinnhubService
{
    private string $baseUrl;
    private string $apiKey;
    private int $timeout;

    public function __construct()
    {
        $this->baseUrl = config('services.finnhub.base_url');
        $this->apiKey = config('services.finnhub.key');
        $this->timeout = config('services.finnhub.timeout', 10);
    }

    /**
     * Get stock quote (real-time price)
     */
    public function getQuote(string $symbol): ?array
    {
        try {
            $cacheKey = "finnhub_quote_{$symbol}";
            
            // Cache 1 minute for real-time data
            return Cache::remember($cacheKey, 60, function () use ($symbol) {
                $response = Http::timeout($this->timeout)
                    ->get("{$this->baseUrl}/quote", [
                        'symbol' => $symbol,
                        'token' => $this->apiKey,
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    
                    return [
                        'symbol' => $symbol,
                        'current' => $data['c'] ?? 0,  // Current price
                        'change' => $data['d'] ?? 0,   // Change
                        'changePercent' => $data['dp'] ?? 0, // Percent change
                        'high' => $data['h'] ?? 0,     // High price of the day
                        'low' => $data['l'] ?? 0,      // Low price of the day
                        'open' => $data['o'] ?? 0,     // Open price of the day
                        'previousClose' => $data['pc'] ?? 0, // Previous close price
                        'timestamp' => $data['t'] ?? time(),
                    ];
                }

                Log::error("Finnhub API error for {$symbol}", [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return null;
            });
        } catch (\Exception $e) {
            Log::error("Error fetching Finnhub quote for {$symbol}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get company profile
     */
    public function getCompanyProfile(string $symbol): ?array
    {
        try {
            $cacheKey = "finnhub_profile_{$symbol}";
            
            // Cache 1 day
            return Cache::remember($cacheKey, 86400, function () use ($symbol) {
                $response = Http::timeout($this->timeout)
                    ->get("{$this->baseUrl}/stock/profile2", [
                        'symbol' => $symbol,
                        'token' => $this->apiKey,
                    ]);

                if ($response->successful()) {
                    return $response->json();
                }

                return null;
            });
        } catch (\Exception $e) {
            Log::error("Error fetching company profile: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get company news
     */
    public function getCompanyNews(string $symbol, ?string $from = null, ?string $to = null): array
    {
        try {
            $from = $from ?? date('Y-m-d', strtotime('-7 days'));
            $to = $to ?? date('Y-m-d');
            
            $cacheKey = "finnhub_news_{$symbol}_{$from}_{$to}";
            
            // Cache 15 minutes
            return Cache::remember($cacheKey, 900, function () use ($symbol, $from, $to) {
                $response = Http::timeout($this->timeout)
                    ->get("{$this->baseUrl}/company-news", [
                        'symbol' => $symbol,
                        'from' => $from,
                        'to' => $to,
                        'token' => $this->apiKey,
                    ]);

                if ($response->successful()) {
                    return $response->json();
                }

                return [];
            });
        } catch (\Exception $e) {
            Log::error("Error fetching company news: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get market news
     */
    public function getMarketNews(string $category = 'general'): array
    {
        try {
            $cacheKey = "finnhub_market_news_{$category}";
            
            // Cache 15 minutes
            return Cache::remember($cacheKey, 900, function () use ($category) {
                $response = Http::timeout($this->timeout)
                    ->get("{$this->baseUrl}/news", [
                        'category' => $category,
                        'token' => $this->apiKey,
                    ]);

                if ($response->successful()) {
                    return $response->json();
                }

                return [];
            });
        } catch (\Exception $e) {
            Log::error("Error fetching market news: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Search symbols
     */
    public function searchSymbol(string $query): array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->get("{$this->baseUrl}/search", [
                    'q' => $query,
                    'token' => $this->apiKey,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['result'] ?? [];
            }

            return [];
        } catch (\Exception $e) {
            Log::error("Error searching symbols: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get candles (OHLC data)
     */
    public function getCandles(
        string $symbol,
        string $resolution = 'D',
        ?int $from = null,
        ?int $to = null
    ): ?array {
        try {
            $from = $from ?? strtotime('-30 days');
            $to = $to ?? time();
            
            $cacheKey = "finnhub_candles_{$symbol}_{$resolution}_{$from}_{$to}";
            
            // Cache 5 minutes
            return Cache::remember($cacheKey, 300, function () use ($symbol, $resolution, $from, $to) {
                $response = Http::timeout($this->timeout)
                    ->get("{$this->baseUrl}/stock/candle", [
                        'symbol' => $symbol,
                        'resolution' => $resolution,
                        'from' => $from,
                        'to' => $to,
                        'token' => $this->apiKey,
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    
                    if (($data['s'] ?? '') === 'ok') {
                        return [
                            'timestamps' => $data['t'] ?? [],
                            'open' => $data['o'] ?? [],
                            'high' => $data['h'] ?? [],
                            'low' => $data['l'] ?? [],
                            'close' => $data['c'] ?? [],
                            'volume' => $data['v'] ?? [],
                        ];
                    }
                }

                return null;
            });
        } catch (\Exception $e) {
            Log::error("Error fetching candles: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get multiple quotes at once
     */
    public function getMultipleQuotes(array $symbols): array
    {
        $results = [];
        
        foreach ($symbols as $symbol) {
            $quote = $this->getQuote($symbol);
            if ($quote) {
                $results[$symbol] = $quote;
            }
        }

        return $results;
    }

    /**
     * Get recommendation trends
     */
    public function getRecommendationTrends(string $symbol): array
    {
        try {
            $cacheKey = "finnhub_recommendations_{$symbol}";
            
            // Cache 1 day
            return Cache::remember($cacheKey, 86400, function () use ($symbol) {
                $response = Http::timeout($this->timeout)
                    ->get("{$this->baseUrl}/stock/recommendation", [
                        'symbol' => $symbol,
                        'token' => $this->apiKey,
                    ]);

                if ($response->successful()) {
                    return $response->json();
                }

                return [];
            });
        } catch (\Exception $e) {
            Log::error("Error fetching recommendations: " . $e->getMessage());
            return [];
        }
    }
}
