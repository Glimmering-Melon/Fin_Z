# SimulatorService Documentation

## Tổng quan

`SimulatorService` là service dùng để mô phỏng đầu tư chứng khoán, tính toán lợi nhuận/lỗ và so sánh hiệu suất giữa nhiều mã cổ phiếu.

## Các tính năng chính

### 1. Mô phỏng đầu tư đơn lẻ (`simulate`)
### 2. So sánh nhiều mã cổ phiếu (`compareMultiple`)
### 3. Lấy dữ liệu lịch sử hiệu suất (`getHistoricalPerformance`)

---

## 1. Mô phỏng đầu tư đơn lẻ

### Method: `simulate(float $amount, string $symbol, string $startDate): array`

Tính toán kết quả đầu tư cho một mã cổ phiếu từ ngày bắt đầu đến hiện tại.

### Parameters:
- `$amount` (float): Số tiền đầu tư (VND)
- `$symbol` (string): Mã cổ phiếu (VD: 'VNM', 'VCB')
- `$startDate` (string): Ngày bắt đầu đầu tư (format: 'Y-m-d')

### Returns:
Array chứa thông tin chi tiết về kết quả đầu tư:

```php
[
    'stock' => [
        'symbol' => 'VNM',
        'name' => 'Vinamilk',
        'exchange' => 'HOSE',
        'sector' => 'Consumer Goods'
    ],
    'investment' => [
        'requested_amount' => 10000000,      // Số tiền yêu cầu
        'actual_amount' => 9600000,          // Số tiền thực tế đầu tư (sau khi làm tròn)
        'start_date' => '2024-01-01',
        'end_date' => '2024-04-10',
        'days_held' => 100                   // Số ngày nắm giữ
    ],
    'prices' => [
        'start_price' => 80000,              // Giá mua vào
        'current_price' => 89900,            // Giá hiện tại
        'price_change' => 9900,              // Thay đổi giá
        'price_change_percentage' => 12.375  // % thay đổi giá
    ],
    'shares' => [
        'quantity' => 100,                   // Số cổ phiếu (bội số của 100)
        'lots' => 1                          // Số lô (1 lô = 100 cổ phiếu)
    ],
    'returns' => [
        'current_value' => 8990000,          // Giá trị hiện tại
        'profit_loss' => -610000,            // Lãi/lỗ (VND)
        'profit_loss_percentage' => -6.35,   // % lãi/lỗ
        'annualized_return' => -21.5         // Lợi nhuận hàng năm (%)
    ]
]
```

### Example Usage:

```php
use App\Services\SimulatorService;

$simulator = new SimulatorService();

try {
    $result = $simulator->simulate(
        amount: 10000000,        // 10 triệu VND
        symbol: 'VNM',
        startDate: '2024-01-01'
    );
    
    echo "Lãi/lỗ: " . number_format($result['returns']['profit_loss']) . " VND\n";
    echo "% Lãi/lỗ: " . round($result['returns']['profit_loss_percentage'], 2) . "%\n";
    
} catch (\Exception $e) {
    echo "Lỗi: " . $e->getMessage();
}
```

### Exceptions:
- `InvalidArgumentException`: Khi amount <= 0 hoặc start date trong tương lai
- `Exception`: Khi không tìm thấy mã cổ phiếu hoặc không có dữ liệu giá

---

## 2. So sánh nhiều mã cổ phiếu

### Method: `compareMultiple(float $amount, array $symbols, string $startDate): array`

So sánh kết quả đầu tư giữa nhiều mã cổ phiếu (tối đa 5 mã).

### Parameters:
- `$amount` (float): Số tiền đầu tư cho MỖI mã (VND)
- `$symbols` (array): Mảng các mã cổ phiếu
- `$startDate` (string): Ngày bắt đầu đầu tư

### Returns:

```php
[
    'comparison' => [
        // Mảng kết quả cho từng mã (sorted theo % lãi/lỗ giảm dần)
        [...],  // Kết quả mã 1
        [...],  // Kết quả mã 2
    ],
    'summary' => [
        'total_stocks' => 3,
        'total_investment' => 30000000,
        'total_current_value' => 32500000,
        'total_profit_loss' => 2500000,
        'total_profit_loss_percentage' => 8.33,
        'average_return_percentage' => 7.5,
        'best_performer' => [
            'symbol' => 'VCB',
            'return_percentage' => 15.2
        ],
        'worst_performer' => [
            'symbol' => 'VNM',
            'return_percentage' => 2.1
        ]
    ],
    'errors' => [
        // Mảng các mã bị lỗi (nếu có)
        [
            'symbol' => 'INVALID',
            'error' => 'Stock symbol not found'
        ]
    ]
]
```

### Example Usage:

```php
$result = $simulator->compareMultiple(
    amount: 10000000,
    symbols: ['VNM', 'VCB', 'HPG'],
    startDate: '2024-01-01'
);

echo "Tổng đầu tư: " . number_format($result['summary']['total_investment']) . " VND\n";
echo "Tổng giá trị hiện tại: " . number_format($result['summary']['total_current_value']) . " VND\n";
echo "Tổng lãi/lỗ: " . number_format($result['summary']['total_profit_loss']) . " VND\n";
echo "% Lãi/lỗ trung bình: " . round($result['summary']['average_return_percentage'], 2) . "%\n";

if ($result['summary']['best_performer']) {
    echo "\nMã tốt nhất: " . $result['summary']['best_performer']['symbol'];
    echo " (+" . round($result['summary']['best_performer']['return_percentage'], 2) . "%)\n";
}

// Hiển thị chi tiết từng mã
foreach ($result['comparison'] as $stock) {
    echo "\n{$stock['stock']['symbol']}: ";
    echo number_format($stock['returns']['profit_loss']) . " VND ";
    echo "(" . round($stock['returns']['profit_loss_percentage'], 2) . "%)\n";
}
```

### Exceptions:
- `InvalidArgumentException`: Khi symbols rỗng hoặc > 5 mã

---

## 3. Lấy dữ liệu lịch sử hiệu suất

### Method: `getHistoricalPerformance(string $symbol, string $startDate, float $shares): array`

Lấy dữ liệu lịch sử giá trị đầu tư theo từng ngày (dùng để vẽ biểu đồ).

### Parameters:
- `$symbol` (string): Mã cổ phiếu
- `$startDate` (string): Ngày bắt đầu
- `$shares` (float): Số lượng cổ phiếu

### Returns:

```php
[
    [
        'date' => '2024-01-01',
        'price' => 80000,
        'value' => 8000000,
        'profit_loss' => 0,
        'profit_loss_percentage' => 0
    ],
    [
        'date' => '2024-01-02',
        'price' => 80500,
        'value' => 8050000,
        'profit_loss' => 50000,
        'profit_loss_percentage' => 0.625
    ],
    // ... các ngày tiếp theo
]
```

### Example Usage:

```php
$performance = $simulator->getHistoricalPerformance(
    symbol: 'VNM',
    startDate: '2024-01-01',
    shares: 100
);

// Dùng để vẽ biểu đồ với Chart.js
$dates = array_column($performance, 'date');
$values = array_column($performance, 'value');
$profitLoss = array_column($performance, 'profit_loss_percentage');
```

---

## Lưu ý quan trọng

### 1. Lot Size (Khối lượng giao dịch tối thiểu)
- Tại Việt Nam, cổ phiếu được giao dịch theo lô (100 cổ phiếu/lô)
- Service tự động làm tròn xuống số cổ phiếu gần nhất chia hết cho 100
- Ví dụ: Nếu tính ra 125 cổ phiếu → làm tròn thành 100 cổ phiếu

### 2. Số tiền đầu tư thực tế
- `requested_amount`: Số tiền bạn muốn đầu tư
- `actual_amount`: Số tiền thực tế đầu tư (sau khi làm tròn số cổ phiếu)
- Có thể khác nhau do lot size

### 3. Annualized Return (Lợi nhuận hàng năm)
- Được tính theo công thức: `((Current Value / Initial Value) ^ (1 / Years)) - 1`
- Giúp so sánh hiệu suất đầu tư giữa các khoảng thời gian khác nhau

### 4. Xử lý ngày không có dữ liệu
- Service tự động lấy giá gần nhất SAU ngày bắt đầu
- Ví dụ: Nếu chọn ngày 01/01 (Chủ nhật), sẽ lấy giá ngày 02/01 (Thứ Hai)

### 5. Giới hạn so sánh
- Tối đa 5 mã cổ phiếu cùng lúc để tránh quá tải
- Nếu cần so sánh nhiều hơn, gọi nhiều lần

---

## Testing

Chạy unit tests:

```bash
php artisan test --filter=SimulatorServiceTest
```

Hoặc chạy tất cả tests:

```bash
php artisan test
```

---

## Integration với Controller

Ví dụ sử dụng trong Controller:

```php
namespace App\Http\Controllers\Api;

use App\Services\SimulatorService;
use Illuminate\Http\Request;

class SimulatorController extends Controller
{
    public function __construct(
        private SimulatorService $simulator
    ) {}

    public function simulate(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1000000',
            'symbol' => 'required|string|max:10',
            'start_date' => 'required|date|before_or_equal:today',
        ]);

        try {
            $result = $this->simulator->simulate(
                amount: $validated['amount'],
                symbol: $validated['symbol'],
                startDate: $validated['start_date']
            );

            return response()->json([
                'success' => true,
                'data' => $result
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function compare(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1000000',
            'symbols' => 'required|array|min:2|max:5',
            'symbols.*' => 'required|string|max:10',
            'start_date' => 'required|date|before_or_equal:today',
        ]);

        try {
            $result = $this->simulator->compareMultiple(
                amount: $validated['amount'],
                symbols: $validated['symbols'],
                startDate: $validated['start_date']
            );

            return response()->json([
                'success' => true,
                'data' => $result
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
```

---

## Performance Tips

1. **Cache kết quả**: Với cùng parameters, kết quả không thay đổi trong ngày
2. **Eager loading**: Sử dụng `with('prices')` khi query Stock
3. **Index database**: Đảm bảo có index trên `stock_id` và `date` trong bảng `stock_prices`
4. **Limit date range**: Không nên query quá nhiều năm dữ liệu cùng lúc

---

## Changelog

### Version 1.0.0 (2024-04-10)
- ✅ Implement simulate() method
- ✅ Implement compareMultiple() method
- ✅ Implement getHistoricalPerformance() method
- ✅ Handle lot size (100 shares)
- ✅ Calculate annualized return
- ✅ Comprehensive error handling
- ✅ Unit tests coverage > 90%
