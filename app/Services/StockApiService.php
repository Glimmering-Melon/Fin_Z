<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class StockApiService
{
    private string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('stock.api.base_url', 'https://api.example.com');
    }

    /**
     * Fetch market overview data (VN-Index, HNX-Index, UPCOM)
     */
    public function fetchMarketOverview(): array
    {
        try {
            // Cache for 30 seconds to reduce API calls
            return Cache::remember('market_overview', 30, function () {
                // TODO: Replace with actual API endpoint
                // $response = Http::get("{$this->baseUrl}/market/overview");
                
                // For now, return mock data
                return $this->getMockMarketData();
            });
        } catch (\Exception $e) {
            Log::error('Failed to fetch market overview: ' . $e->getMessage());
            return $this->getMockMarketData();
        }
    }

    /**
     * Get mock market data for development
     */
    private function getMockMarketData(): array
    {
        return [
            [
                'index' => 'VN-Index',
                'value' => 1234.56,
                'change' => 12.34,
                'percentChange' => 1.01,
                'volume' => 456789000,
                'lastUpdated' => now()->toIso8601String(),
            ],
            [
                'index' => 'HNX-Index',
                'value' => 234.56,
                'change' => -2.34,
                'percentChange' => -0.99,
                'volume' => 123456000,
                'lastUpdated' => now()->toIso8601String(),
            ],
            [
                'index' => 'UPCOM',
                'value' => 89.12,
                'change' => 0.45,
                'percentChange' => 0.51,
                'volume' => 45678000,
                'lastUpdated' => now()->toIso8601String(),
            ],
        ];
    }

    /**
     * Format large numbers (volume) for display
     */
    public static function formatVolume(int $volume): string
    {
        if ($volume >= 1000000000) {
            return number_format($volume / 1000000000, 2) . 'B';
        } elseif ($volume >= 1000000) {
            return number_format($volume / 1000000, 2) . 'M';
        } elseif ($volume >= 1000) {
            return number_format($volume / 1000, 2) . 'K';
        }
        return (string) $volume;
    }
}
