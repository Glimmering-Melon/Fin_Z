<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AlphaVantageService
{
    private string $baseUrl;
    private string $apiKey;
    private int $timeout;

    public function __construct()
    {
        $this->baseUrl = config('services.alpha_vantage.base_url');
        $this->apiKey = config('services.alpha_vantage.key');
        $this->timeout = config('services.alpha_vantage.timeout', 15);
    }

    /**
     * Get daily time series data
     */
    public function getDailyTimeSeries(string $symbol, bool $compact = true): ?array
    {
        try {
            $outputSize = $compact ? 'compact' : 'full'; // compact = last 100 days
            $cacheKey = "alpha_vantage_daily_{$symbol}_{$outputSize}";
            
            // Cache 1 hour (Alpha Vantage has rate limit)
            return Cache::remember($cacheKey, 3600, function () use ($symbol, $outputSize) {
                $response = Http::timeout($this->timeout)
                    ->get($this->baseUrl, [
                        'function' => 'TIME_SERIES_DAILY',
                        'symbol' => $symbol,
                        'outputsize' => $outputSize,
                        'apikey' => $this->apiKey,
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    
                    // Check for error messages
                    if (isset($data['Error Message']) || isset($data['Note'])) {
                        Log::warning("Alpha Vantage API limit or error", [
                            'symbol' => $symbol,
                            'response' => $data,
                        ]);
                        return null;
                    }

                    $timeSeries = $data['Time Series (Daily)'] ?? null;
                    
                    if ($timeSeries) {
                        return $this->formatTimeSeriesData($timeSeries);
                    }
                }

                return null;
            });
        } catch (\Exception $e) {
            Log::error("Error fetching Alpha Vantage daily data: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get intraday time series data
     */
    public function getIntradayTimeSeries(string $symbol, string $interval = '5min'): ?array
    {
        try {
            $cacheKey = "alpha_vantage_intraday_{$symbol}_{$interval}";
            
            // Cache 5 minutes
            return Cache::remember($cacheKey, 300, function () use ($symbol, $interval) {
                $response = Http::timeout($this->timeout)
                    ->get($this->baseUrl, [
                        'function' => 'TIME_SERIES_INTRADAY',
                        'symbol' => $symbol,
                        'interval' => $interval,
                        'apikey' => $this->apiKey,
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    
                    if (isset($data['Error Message']) || isset($data['Note'])) {
                        return null;
                    }

                    $timeSeries = $data["Time Series ({$interval})"] ?? null;
                    
                    if ($timeSeries) {
                        return $this->formatTimeSeriesData($timeSeries);
                    }
                }

                return null;
            });
        } catch (\Exception $e) {
            Log::error("Error fetching Alpha Vantage intraday data: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Format time series data to consistent structure
     */
    private function formatTimeSeriesData(array $timeSeries): array
    {
        $timestamps = [];
        $open = [];
        $high = [];
        $low = [];
        $close = [];
        $volume = [];

        // Sort by date ascending
        ksort($timeSeries);

        foreach ($timeSeries as $date => $values) {
            $timestamps[] = $date;
            $open[] = (float) ($values['1. open'] ?? 0);
            $high[] = (float) ($values['2. high'] ?? 0);
            $low[] = (float) ($values['3. low'] ?? 0);
            $close[] = (float) ($values['4. close'] ?? 0);
            $volume[] = (int) ($values['5. volume'] ?? 0);
        }

        return [
            'timestamps' => $timestamps,
            'open' => $open,
            'high' => $high,
            'low' => $low,
            'close' => $close,
            'volume' => $volume,
        ];
    }

    /**
     * Get quote (real-time price)
     */
    public function getQuote(string $symbol): ?array
    {
        try {
            $cacheKey = "alpha_vantage_quote_{$symbol}";
            
            // Cache 1 minute
            return Cache::remember($cacheKey, 60, function () use ($symbol) {
                $response = Http::timeout($this->timeout)
                    ->get($this->baseUrl, [
                        'function' => 'GLOBAL_QUOTE',
                        'symbol' => $symbol,
                        'apikey' => $this->apiKey,
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    $quote = $data['Global Quote'] ?? null;

                    if ($quote) {
                        return [
                            'symbol' => $quote['01. symbol'] ?? $symbol,
                            'price' => (float) ($quote['05. price'] ?? 0),
                            'change' => (float) ($quote['09. change'] ?? 0),
                            'changePercent' => (float) str_replace('%', '', $quote['10. change percent'] ?? '0'),
                            'volume' => (int) ($quote['06. volume'] ?? 0),
                            'open' => (float) ($quote['02. open'] ?? 0),
                            'high' => (float) ($quote['03. high'] ?? 0),
                            'low' => (float) ($quote['04. low'] ?? 0),
                            'previousClose' => (float) ($quote['08. previous close'] ?? 0),
                        ];
                    }
                }

                return null;
            });
        } catch (\Exception $e) {
            Log::error("Error fetching Alpha Vantage quote: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Search symbols
     */
    public function searchSymbols(string $keywords): array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->get($this->baseUrl, [
                    'function' => 'SYMBOL_SEARCH',
                    'keywords' => $keywords,
                    'apikey' => $this->apiKey,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['bestMatches'] ?? [];
            }

            return [];
        } catch (\Exception $e) {
            Log::error("Error searching symbols: " . $e->getMessage());
            return [];
        }
    }
}
