# SimulatorService - Quick Start Guide

## 🚀 Cài đặt

```bash
# 1. Cài đặt dependencies
composer install

# 2. Setup database
php artisan migrate
php artisan db:seed --class=StockSeeder

# 3. Chạy tests
php artisan test --filter=SimulatorServiceTest
```

## 📡 API Endpoints

### 1. Mô phỏng đầu tư đơn lẻ

**POST** `/api/simulator/simulate`

```json
{
  "amount": 10000000,
  "symbol": "VNM",
  "start_date": "2024-01-01"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stock": {
      "symbol": "VNM",
      "name": "Vinamilk"
    },
    "investment": {
      "actual_amount": 9600000,
      "days_held": 100
    },
    "returns": {
      "profit_loss": 990000,
      "profit_loss_percentage": 10.31,
      "annualized_return": 42.5
    }
  }
}
```

### 2. So sánh nhiều mã

**POST** `/api/simulator/compare`

```json
{
  "amount": 10000000,
  "symbols": ["VNM", "VCB", "HPG"],
  "start_date": "2024-01-01"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "comparison": [...],
    "summary": {
      "total_investment": 30000000,
      "total_profit_loss": 2500000,
      "best_performer": {
        "symbol": "VCB",
        "return_percentage": 15.2
      }
    }
  }
}
```

### 3. Lấy dữ liệu biểu đồ

**POST** `/api/simulator/performance`

```json
{
  "amount": 10000000,
  "symbol": "VNM",
  "start_date": "2024-01-01"
}
```

## 💻 Sử dụng trong Code

```php
use App\Services\SimulatorService;

$simulator = app(SimulatorService::class);

// Mô phỏng đơn lẻ
$result = $simulator->simulate(
    amount: 10000000,
    symbol: 'VNM',
    startDate: '2024-01-01'
);

// So sánh nhiều mã
$comparison = $simulator->compareMultiple(
    amount: 10000000,
    symbols: ['VNM', 'VCB', 'HPG'],
    startDate: '2024-01-01'
);

// Lấy dữ liệu lịch sử
$performance = $simulator->getHistoricalPerformance(
    symbol: 'VNM',
    startDate: '2024-01-01',
    shares: 100
);
```

## ✅ Validation Rules

| Field | Rules | Description |
|-------|-------|-------------|
| amount | required, numeric, min:1000000 | Số tiền đầu tư (VND) |
| symbol | required, string, uppercase | Mã cổ phiếu |
| symbols | array, min:2, max:5 | Danh sách mã (so sánh) |
| start_date | required, date, ≤ today | Ngày bắt đầu |

## 🧪 Test với cURL

```bash
# Simulate
curl -X POST http://localhost:8000/api/simulator/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000000,
    "symbol": "VNM",
    "start_date": "2024-01-01"
  }'

# Compare
curl -X POST http://localhost:8000/api/simulator/compare \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000000,
    "symbols": ["VNM", "VCB"],
    "start_date": "2024-01-01"
  }'
```

## 📊 Kết quả trả về

### Thông tin chính:
- ✅ **Số cổ phiếu mua được** (làm tròn theo lô 100)
- ✅ **Giá mua vào** vs **Giá hiện tại**
- ✅ **Lãi/lỗ** (VND và %)
- ✅ **Lợi nhuận hàng năm** (Annualized Return)
- ✅ **Số ngày nắm giữ**

### So sánh nhiều mã:
- ✅ Tổng đầu tư & giá trị hiện tại
- ✅ Mã tốt nhất / tệ nhất
- ✅ % lãi/lỗ trung bình
- ✅ Sắp xếp theo hiệu suất

## 🔧 Troubleshooting

### Lỗi: "Stock symbol not found"
→ Kiểm tra mã cổ phiếu có trong database chưa

### Lỗi: "No price data available"
→ Chạy seeder hoặc fetch prices từ API

### Lỗi: "Investment amount too small"
→ Tăng số tiền đầu tư (tối thiểu 1 triệu VND)

## 📚 Tài liệu đầy đủ

Xem file `SimulatorService.md` để biết chi tiết đầy đủ về:
- Công thức tính toán
- Xử lý lot size
- Annualized return
- Performance optimization
- Integration examples
