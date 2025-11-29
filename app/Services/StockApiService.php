<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class StockApiService
{
    private string $baseUrl;
    private ?string $apiKey;

    public function __construct()
    {
        // Cấu hình API endpoint
        $this->baseUrl = config('services.stock_api.base_url', 'https://api.example.com');
        $this->apiKey = config('services.stock_api.key');
    }

    /**
     * Fetch stock data from external API
     */
    public function getStockData(string $symbol): ?array
    {
        try {
            $cacheKey = "stock_data_{$symbol}";
            
            // Cache 5 phút
            return Cache::remember($cacheKey, 300, function () use ($symbol) {
                $response = Http::timeout(10)
                    ->withHeaders([
                        'Authorization' => "Bearer {$this->apiKey}",
                        'Accept' => 'application/json',
                    ])
                    ->get("{$this->baseUrl}/stocks/{$symbol}");

                if ($response->successful()) {
                    return $response->json();
                }

                Log::error("Failed to fetch stock data for {$symbol}", [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return null;
            });
        } catch (\Exception $e) {
            Log::error("Error fetching stock data: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Fetch multiple stocks
     */
    public function getMultipleStocks(array $symbols): array
    {
        $results = [];
        
        foreach ($symbols as $symbol) {
            $data = $this->getStockData($symbol);
            if ($data) {
                $results[$symbol] = $data;
            }
        }

        return $results;
    }

    /**
     * Fetch market indices (VN-INDEX, HNX-INDEX, etc.)
     */
    public function getMarketIndices(): array
    {
        try {
            $cacheKey = 'market_indices';
            
            return Cache::remember($cacheKey, 300, function () {
                $response = Http::timeout(10)
                    ->withHeaders([
                        'Authorization' => "Bearer {$this->apiKey}",
                        'Accept' => 'application/json',
                    ])
                    ->get("{$this->baseUrl}/market/indices");

                if ($response->successful()) {
                    return $response->json();
                }

                return [
                    'vnindex' => ['value' => 0, 'change' => 0, 'changePercent' => 0],
                    'hnx' => ['value' => 0, 'change' => 0, 'changePercent' => 0],
                    'upcom' => ['value' => 0, 'change' => 0, 'changePercent' => 0],
                ];
            });
        } catch (\Exception $e) {
            Log::error("Error fetching market indices: " . $e->getMessage());
            return [
                'vnindex' => ['value' => 0, 'change' => 0, 'changePercent' => 0],
                'hnx' => ['value' => 0, 'change' => 0, 'changePercent' => 0],
                'upcom' => ['value' => 0, 'change' => 0, 'changePercent' => 0],
            ];
        }
    }

    /**
     * Search stocks
     */
    public function searchStocks(string $query): array
    {
        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->apiKey}",
                    'Accept' => 'application/json',
                ])
                ->get("{$this->baseUrl}/stocks/search", [
                    'q' => $query,
                    'limit' => 10,
                ]);

            if ($response->successful()) {
                return $response->json('data', []);
            }

            return [];
        } catch (\Exception $e) {
            Log::error("Error searching stocks: " . $e->getMessage());
            return [];
        }
    }
}
