# 📊 Chart Zoom Implementation - TradingView Style

## Yêu cầu:

### 1. Ban đầu (Default):
- Hiển thị **TẤT CẢ** nến từ quá khứ đến hiện tại
- Sử dụng **daily candles** (1 nến = 1 ngày)
- User có thể scroll/zoom tự do

### 2. Click Timeframe Buttons:
- **1H**: Zoom vào 1 giờ gần nhất + fetch **1-minute candles**
- **1D**: Zoom vào 1 ngày gần nhất + fetch **5-minute candles**
- **1W**: Zoom vào 1 tuần gần nhất + fetch **hourly candles**
- **1M**: Zoom vào 1 tháng gần nhất + fetch **daily candles**
- **ALL**: Reset về view toàn bộ với daily candles

## Implementation:

### Backend Changes (StockPriceService.php):

```php
public function getCandlestickData(string $symbol, string $timeframe = 'ALL', int $limit = 1000): array
{
    $cacheKey = "candles_{$symbol}_{$timeframe}";
    $cacheDuration = 300;
    
    return Cache::remember($cacheKey, $cacheDuration, function () use ($symbol, $timeframe, $limit) {
        try {
            // Map timeframe to appropriate interval
            [$multiplier, $timespan, $from] = $this->getTimeframeConfig($timeframe);
            
            $to = date('Y-m-d');
            
            $response = Http::withoutVerifying()->get(
                "{$this->apiUrl}/v2/aggs/ticker/{$symbol}/range/{$multiplier}/{$timespan}/{$from}/{$to}",
                ['adjusted' => 'true', 'sort' => 'asc', 'limit' => 50000, 'apiKey' => $this->apiKey]
            );
            
            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['results']) && is_array($data['results'])) {
                    return array_map(fn($candle) => [
                        'time' => $candle['t'] / 1000,
                        'open' => (float) $candle['o'],
                        'high' => (float) $candle['h'],
                        'low' => (float) $candle['l'],
                        'close' => (float) $candle['c'],
                        'volume' => (int) $candle['v'],
                    ], $data['results']);
                }
            }
            
            return $this->generateFakeCandles($symbol, $timeframe, $limit);
            
        } catch (\Exception $e) {
            return $this->generateFakeCandles($symbol, $timeframe, $limit);
        }
    });
}

private function getTimeframeConfig(string $timeframe): array
{
    return match($timeframe) {
        '1H' => [1, 'minute', date('Y-m-d H:i:s', strtotime('-1 hour'))],
        '1D' => [5, 'minute', date('Y-m-d', strtotime('-1 day'))],
        '1W' => [1, 'hour', date('Y-m-d', strtotime('-1 week'))],
        '1M' => [1, 'day', date('Y-m-d', strtotime('-1 month'))],
        default => [1, 'day', date('Y-m-d', strtotime('-5 years'))], // ALL
    };
}

private function generateFakeCandles(string $symbol, string $timeframe, int $limit): array
{
    $basePrice = 100 + (crc32($symbol) % 200);
    $currentPrice = $basePrice;
    
    [$interval, $count] = match($timeframe) {
        '1H' => [60, 60],           // 1 min x 60 = 1 hour
        '1D' => [300, 288],          // 5 min x 288 = 1 day
        '1W' => [3600, 168],         // 1 hour x 168 = 1 week
        '1M' => [86400, 30],         // 1 day x 30 = 1 month
        default => [86400, 1000],    // 1 day x 1000 = ~3 years
    };
    
    $candles = [];
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
```

### Frontend Changes (CandlestickChart.tsx):

```typescript
const [timeframe, setTimeframe] = useState<'ALL' | '1H' | '1D' | '1W' | '1M'>('ALL');

// Fetch data when timeframe changes
useEffect(() => {
    fetchData();
}, [symbol, timeframe]);

const fetchData = async () => {
    setLoading(true);
    
    try {
        const response = await axios.get(`/api/stocks/${symbol}/candles`, {
            params: { timeframe, limit: 1000 }
        });

        const data: CandleData[] = response.data;

        // Update chart
        if (candleSeriesRef.current) {
            candleSeriesRef.current.setData(data.map(d => ({
                time: d.time as any,
                open: d.open,
                high: d.high,
                low: d.low,
                close: d.close,
            })));
        }

        if (volumeSeriesRef.current) {
            volumeSeriesRef.current.setData(data.map(d => ({
                time: d.time as any,
                value: d.volume,
                color: d.close >= d.open ? '#10b98180' : '#ef444480',
            })));
        }

        chartRef.current?.timeScale().fitContent();
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        setLoading(false);
    }
};
```

## Kết quả:

### Mặc định (ALL):
- 1000 daily candles (~3 years)
- Xem toàn bộ lịch sử

### Click 1H:
- Fetch 60 candles x 1 minute = 1 hour
- Zoom vào 1 giờ gần nhất
- Độ chia nhỏ nhất

### Click 1D:
- Fetch 288 candles x 5 minutes = 1 day
- Zoom vào 1 ngày gần nhất
- Độ chia vừa

### Click 1W:
- Fetch 168 candles x 1 hour = 1 week
- Zoom vào 1 tuần gần nhất
- Độ chia lớn

### Click 1M:
- Fetch 30 candles x 1 day = 1 month
- Zoom vào 1 tháng gần nhất
- Độ chia lớn nhất

## Lưu ý:

1. **Polygon.io Free Tier** không hỗ trợ minute data
2. Hiện tại dùng **fake data** để demo
3. Cần upgrade API để có real minute/hour data
4. Cache 5 phút để tránh rate limit

## Test:

1. Mở: http://localhost:8000/test/chart
2. Chart load với ALL data (daily candles)
3. Click 1H → Fetch minute candles, zoom vào 1 giờ
4. Click 1D → Fetch 5-min candles, zoom vào 1 ngày
5. Click ALL → Fetch daily candles, xem toàn bộ

Đúng như TradingView! 🎯
