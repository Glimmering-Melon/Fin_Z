<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class StockPriceService
{
    protected $apiUrl;
    protected $apiKey;

    public function __construct()
    {
        $this->apiUrl = env('STOCK_API_URL', 'https://finnhub.io/api/v1');
        $this->apiKey = env('STOCK_API_KEY');
    }

    /**
     * Search stocks từ Polygon.io API
     */
    public function searchStocks(string $query): array
    {
        try {
            // Polygon.io ticker search endpoint
            $response = Http::withoutVerifying()->get("{$this->apiUrl}/v3/reference/tickers", [
                'search' => $query,
                'active' => 'true',
                'limit' => 10,
                'apiKey' => $this->apiKey
            ]);
            
            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['results']) && is_array($data['results'])) {
                    return array_map(function($item) {
                        return [
                            'symbol' => $item['ticker'] ?? '',
                            'name' => $item['name'] ?? '',
                            'type' => $item['type'] ?? '',
                        ];
                    }, $data['results']);
                }
            }
        } catch (\Exception $e) {
            Log::error("Error searching stocks: " . $e->getMessage());
        }
        
        return [];
    }

    /**
     * Lấy giá real-time từ Polygon.io API
     */
    public function getRealTimePrice(string $symbol): ?array
    {
        // Cache 30 giây để tránh call API quá nhiều
        return Cache::remember("stock_price_{$symbol}", 30, function () use ($symbol) {
            try {
                // Polygon.io - Previous Close endpoint (free tier)
                $response = Http::withoutVerifying()->get("{$this->apiUrl}/v2/aggs/ticker/{$symbol}/prev", [
                    'adjusted' => 'true',
                    'apiKey' => $this->apiKey
                ]);
                
                if ($response->successful()) {
                    $data = $response->json();
                    
                    // Polygon trả về: o (open), h (high), l (low), c (close)
                    if (isset($data['results']) && count($data['results']) > 0) {
                        $result = $data['results'][0];
                        
                        $open = (float) $result['o'];
                        $close = (float) $result['c'];
                        $change = $close - $open;
                        $changePercent = $open > 0 ? ($change / $open) * 100 : 0;
                        
                        return [
                            'symbol' => $symbol,
                            'price' => $close,
                            'change' => round($change, 2),
                            'change_percent' => round($changePercent, 2),
                            'high' => (float) $result['h'],
                            'low' => (float) $result['l'],
                            'open' => $open,
                            'volume' => (int) $result['v'],
                            'previous_close' => $open,
                        ];
                    }
                }
                
                Log::warning("Polygon API returned no data for {$symbol}");
                
            } catch (\Exception $e) {
                Log::error("Error fetching stock price for {$symbol}: " . $e->getMessage());
            }
            
            return null;
        });
    }

    /**
     * Lấy giá từ database (fallback khi API fail)
     */
    public function getPriceFromDatabase(string $symbol): ?array
    {
        $stock = \App\Models\Stock::where('symbol', $symbol)->first();
        
        if (!$stock) {
            return null;
        }

        $prices = $stock->prices()->latest()->limit(2)->get();
        
        if ($prices->isEmpty()) {
            return null;
        }

        $currentPrice = $prices->first();
        $previousPrice = $prices->skip(1)->first();
        
        $change = 0;
        $changePercent = 0;
        
        if ($currentPrice && $previousPrice) {
            $change = $currentPrice->close - $previousPrice->close;
            $changePercent = ($change / $previousPrice->close) * 100;
        }

        return [
            'symbol' => $symbol,
            'price' => (float) $currentPrice->close,
            'change' => round($change, 2),
            'change_percent' => round($changePercent, 2),
            'high' => (float) $currentPrice->high,
            'low' => (float) $currentPrice->low,
            'open' => (float) $currentPrice->open,
        ];
    }

    /**
     * Lấy giá với fallback: API -> Database
     */
    public function getPrice(string $symbol): ?array
    {
        // Thử lấy từ API trước
        $price = $this->getRealTimePrice($symbol);
        
        // Nếu API fail, fallback về database
        if (!$price) {
            $price = $this->getPriceFromDatabase($symbol);
        }
        
        return $price;
    }
    
    /**
     * Lấy giá nhiều cổ phiếu cùng lúc
     */
    public function getBatchPrices(array $symbols): array
    {
        $prices = [];
        foreach ($symbols as $symbol) {
            $price = $this->getPrice($symbol);
            if ($price) {
                $prices[$symbol] = $price;
            }
        }
        return $prices;
    }
}
