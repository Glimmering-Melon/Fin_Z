<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Watchlist;
use App\Models\Stock;
use App\Services\StockPriceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WatchlistController extends Controller
{
    protected $stockPriceService;

    public function __construct(StockPriceService $stockPriceService)
    {
        $this->stockPriceService = $stockPriceService;
    }

    public function index()
    {
        $userId = Auth::id() ?? 1; // TODO: Remove fallback when auth is implemented
        
        $watchlist = Watchlist::where('user_id', $userId)
            ->with('stock')
            ->get()
            ->map(function ($item) {
                $stock = $item->stock;
                
                // Lấy giá real-time từ Finnhub API (hoặc fallback database)
                $priceData = $this->stockPriceService->getPrice($stock->symbol);
                
                if (!$priceData) {
                    // Nếu cả API và database đều fail
                    $priceData = [
                        'price' => 0,
                        'change' => 0,
                        'change_percent' => 0,
                    ];
                }
                
                return [
                    'id' => $item->id,
                    'stock_id' => $stock->id,
                    'symbol' => $stock->symbol,
                    'name' => $stock->name,
                    'price' => $priceData['price'],
                    'change' => $priceData['change'],
                    'change_percent' => $priceData['change_percent'],
                    'added_at' => $item->created_at,
                ];
            });
        
        return response()->json($watchlist);
    }

    public function store(Request $request)
    {
        $request->validate([
            'symbol' => 'required|string',
        ]);
        
        $userId = Auth::id() ?? 1; // TODO: Remove fallback when auth is implemented
        $symbol = strtoupper($request->symbol);
        
        // Tìm hoặc tạo stock mới
        $stock = Stock::where('symbol', $symbol)->first();
        
        if (!$stock) {
            // Tự động tạo stock mới nếu chưa có
            // Thử lấy thông tin từ Finnhub API
            $priceData = $this->stockPriceService->getRealTimePrice($symbol);
            
            // Tạo stock mới (cho phép tạo ngay cả khi API fail)
            $stock = Stock::create([
                'symbol' => $symbol,
                'name' => $priceData ? ($symbol . ' Inc.') : $symbol,
                'exchange' => 'US',
                'sector' => 'Unknown',
            ]);
            
            // Nếu có data từ API, tạo luôn stock price
            if ($priceData) {
                \App\Models\StockPrice::create([
                    'stock_id' => $stock->id,
                    'date' => now(),
                    'open' => $priceData['open'] ?? $priceData['price'],
                    'high' => $priceData['high'] ?? $priceData['price'],
                    'low' => $priceData['low'] ?? $priceData['price'],
                    'close' => $priceData['price'],
                    'volume' => 0,
                ]);
            } else {
                // Tạo fake price để test
                $fakePrice = rand(50, 200);
                \App\Models\StockPrice::create([
                    'stock_id' => $stock->id,
                    'date' => now()->subDay(),
                    'open' => $fakePrice * 0.98,
                    'high' => $fakePrice * 1.02,
                    'low' => $fakePrice * 0.97,
                    'close' => $fakePrice,
                    'volume' => rand(1000000, 10000000),
                ]);
                
                $todayPrice = $fakePrice * (1 + rand(-5, 10) / 100);
                \App\Models\StockPrice::create([
                    'stock_id' => $stock->id,
                    'date' => now(),
                    'open' => $todayPrice * 0.98,
                    'high' => $todayPrice * 1.02,
                    'low' => $todayPrice * 0.97,
                    'close' => $todayPrice,
                    'volume' => rand(1000000, 10000000),
                ]);
            }
        }
        
        // Check duplicate
        $existing = Watchlist::where('user_id', $userId)
            ->where('stock_id', $stock->id)
            ->first();
        
        if ($existing) {
            return response()->json([
                'message' => 'Stock already in watchlist'
            ], 409);
        }
        
        // Thêm vào watchlist
        $watchlist = Watchlist::create([
            'user_id' => $userId,
            'stock_id' => $stock->id,
        ]);
        
        return response()->json([
            'message' => 'Stock added to watchlist',
            'data' => $watchlist
        ], 201);
    }

    public function destroy($id)
    {
        $userId = Auth::id() ?? 1; // TODO: Remove fallback when auth is implemented
        
        $watchlist = Watchlist::where('id', $id)
            ->where('user_id', $userId)
            ->first();
        
        if (!$watchlist) {
            return response()->json([
                'message' => 'Watchlist item not found'
            ], 404);
        }
        
        $watchlist->delete();
        
        return response()->json([
            'message' => 'Stock removed from watchlist'
        ]);
    }

    public function search(Request $request)
    {
        $query = $request->get('q', '');
        
        if (strlen($query) < 1) {
            return response()->json([]);
        }
        
        $results = $this->stockPriceService->searchStocks($query);
        
        return response()->json($results);
    }

    public function candles(Request $request, $symbol)
    {
        $timeframe = $request->get('timeframe', '1D');
        $limit = $request->get('limit', 100);
        
        $candles = $this->stockPriceService->getCandlestickData($symbol, $timeframe, $limit);
        
        return response()->json($candles);
    }
}
