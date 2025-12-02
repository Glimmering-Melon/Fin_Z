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

    /**
     * Lấy candlestick data từ Polygon.io
     */
    public function getCandlestickData(string $symbol, string $timeframe = '1D', int $limit = 100): array
    {
        // Cache key dựa trên symbol và timeframe
        $cacheKey = "candles_{$symbol}_{$timeframe}";
        $cacheDuration = 300; // 5 phút
        
        return Cache::remember($cacheKey, $cacheDuration, function () use ($symbol, $timeframe, $limit) {
            try {
                // Finnhub free plan chỉ support Daily resolution
                // Map timeframe to days range (độ chia theo khoảng thời gian)
                $days = match($timeframe) {
                    '1H' => 7,      // 7 days (zoom vào 1H sẽ thấy 7 ngày)
                    '1D' => 30,     // 30 days (zoom vào 1D sẽ thấy 1 tháng)
                    '1W' => 90,     // 90 days (zoom vào 1W sẽ thấy 3 tháng)
                    '1M' => 365,    // 365 days (zoom vào 1M sẽ thấy 1 năm)
                    default => 1825, // 5 years (zoom ALL)
                };
                
                $resolution = 'D'; // Daily only for free plan
                
                $to = time();
                $from = strtotime("-{$days} days");
                
                // Finnhub API: /stock/candle
                $response = Http::withoutVerifying()->get("{$this->apiUrl}/stock/candle", [
                    'symbol' => $symbol,
                    'resolution' => $resolution,
                    'from' => $from,
                    'to' => $to,
                    'token' => $this->apiKey
                ]);
                
                if ($response->successful()) {
                    $data = $response->json();
                    
                    if (isset($data['s']) && $data['s'] === 'ok' && isset($data['t'])) {
                        $candles = [];
                        $count = count($data['t']);
                        
                        for ($i = 0; $i < $count; $i++) {
                            $candles[] = [
                                'time' => $data['t'][$i],
                                'open' => (float) $data['o'][$i],
                                'high' => (float) $data['h'][$i],
                                'low' => (float) $data['l'][$i],
                                'close' => (float) $data['c'][$i],
                                'volume' => (int) $data['v'][$i],
                            ];
                        }
                        
                        return $candles;
                    }
                }
                
                Log::warning("Finnhub API failed for {$symbol} with timeframe {$timeframe}, using fake data");
                return $this->generateFakeCandles($symbol, $timeframe, $limit);
                
            } catch (\Exception $e) {
                Log::error("Error fetching candlestick data: " . $e->getMessage());
                return $this->generateFakeCandles($symbol, $timeframe, $limit);
            }
        });
    }

    private function generateFakeCandles(string $symbol, string $timeframe, int $limit): array
    {
        $candles = [];
        $basePrice = 100 + (crc32($symbol) % 200);
        $currentPrice = $basePrice;
        
        // Generate appropriate interval based on timeframe (độ chia nhỏ cho timeframe nhỏ)
        [$interval, $count] = match($timeframe) {
            '1H' => [60, 360],           // 1 minute x 360 = 6 hours (zoom 1H thấy 6h data)
            '1D' => [300, 576],          // 5 minutes x 576 = 2 days (zoom 1D thấy 2 ngày)
            '1W' => [900, 672],          // 15 minutes x 672 = 1 week (zoom 1W thấy 1 tuần)
            '1M' => [3600, 720],         // 1 hour x 720 = 30 days (zoom 1M thấy 1 tháng)
            default => [86400, 1825],    // 1 day x 1825 = 5 years (zoom ALL thấy 5 năm)
        };
        
        $startTime = time() - ($count * $interval);
        
        for ($i = 0; $i < $count; $i++) {
            $time = $startTime + ($i * $interval);
            $change = (mt_rand(-100, 120) / 100) * ($currentPrice * 0.02);
            $open = $currentPrice;
            $close = $currentPrice + $change;
            $high = max($open, $close) * (1 + mt_rand(0, 20) / 1000);
            $low = min($open, $close) * (1 - mt_rand(0, 20) / 1000);
            
            $candles[] = [
                'time' => $time,
                'open' => round($open, 2),
                'high' => round($high, 2),
                'low' => round($low, 2),
                'close' => round($close, 2),
                'volume' => mt_rand(1000000, 10000000),
            ];
            
            $currentPrice = $close;
        }
        
        return $candles;
    }

    private function groupCandlesByWeek(array $candles): array
    {
        $weekly = [];
        $currentWeek = null;
        $weekData = [];
        
        foreach ($candles as $candle) {
            $week = date('Y-W', (int) $candle['time']);
            
            if ($week !== $currentWeek) {
                if (!empty($weekData)) {
                    $weekly[] = $this->mergeCandles($weekData);
                }
                $currentWeek = $week;
                $weekData = [];
            }
            
            $weekData[] = $candle;
        }
        
        if (!empty($weekData)) {
            $weekly[] = $this->mergeCandles($weekData);
        }
        
        return $weekly;
    }

    private function groupCandlesByMonth(array $candles): array
    {
        $monthly = [];
        $currentMonth = null;
        $monthData = [];
        
        foreach ($candles as $candle) {
            $month = date('Y-m', (int) $candle['time']);
            
            if ($month !== $currentMonth) {
                if (!empty($monthData)) {
                    $monthly[] = $this->mergeCandles($monthData);
                }
                $currentMonth = $month;
                $monthData = [];
            }
            
            $monthData[] = $candle;
        }
        
        if (!empty($monthData)) {
            $monthly[] = $this->mergeCandles($monthData);
        }
        
        return $monthly;
    }

    private function mergeCandles(array $candles): array
    {
        $first = $candles[0];
        $last = end($candles);
        
        return [
            'time' => $first['time'],
            'open' => $first['open'],
            'high' => max(array_column($candles, 'high')),
            'low' => min(array_column($candles, 'low')),
            'close' => $last['close'],
            'volume' => array_sum(array_column($candles, 'volume')),
        ];
    }
}
