# DASH-2: Market Overview Widget

## Mô tả
Widget hiển thị tổng quan thị trường chứng khoán Việt Nam với 3 chỉ số chính: VN-Index, HNX-Index, và UPCOM.

## Các file đã tạo/sửa

### Backend

#### 1. StockApiService (`app/Services/StockApiService.php`)
Service xử lý việc lấy dữ liệu thị trường từ API.

**Features:**
- `fetchMarketOverview()`: Lấy dữ liệu 3 chỉ số chính
- Cache 30 giây để giảm API calls
- Mock data cho development
- Error handling với fallback

**Mock Data Structure:**
```php
[
    'index' => 'VN-Index',
    'value' => 1234.56,
    'change' => 12.34,
    'percentChange' => 1.01,
    'volume' => 456789000,
    'lastUpdated' => '2024-11-29T12:00:00+07:00',
]
```

#### 2. DashboardController (`app/Http/Controllers/DashboardController.php`)
Controller inject StockApiService và pass data xuống view.

**Changes:**
- Inject `StockApiService` vào constructor
- Gọi `fetchMarketOverview()` trong `index()`
- Pass `marketOverview` data xuống Inertia

### Frontend

#### 3. MarketOverviewWidget (`resources/js/Components/MarketOverviewWidget.tsx`)
Component hiển thị market overview với auto-refresh.

**Features:**
- Hiển thị 3 chỉ số trong grid responsive (1 col mobile, 3 cols desktop)
- Color coding:
  - Green: Tăng giá
  - Red: Giảm giá
  - Yellow: Không đổi
- Icons mũi tên lên/xuống theo biến động
- Format volume (B/M/K)
- Auto refresh mỗi 30 giây
- Countdown timer hiển thị thời gian còn lại đến lần refresh tiếp theo

**Props:**
```typescript
interface MarketOverviewWidgetProps {
  data: MarketIndex[];
  autoRefresh?: boolean;        // Default: true
  refreshInterval?: number;     // Default: 30000ms (30s)
}
```

#### 4. Dashboard Page (`resources/js/pages/Dashboard/index.tsx`)
Trang Dashboard hiển thị MarketOverviewWidget.

**Changes:**
- Import `MarketOverviewWidget`
- Nhận `marketOverview` prop từ controller
- Render widget với auto-refresh enabled

## Cách sử dụng

### Tích hợp API thật

Khi có API thật, update `StockApiService.php`:

```php
public function fetchMarketOverview(): array
{
    return Cache::remember('market_overview', 30, function () {
        $response = Http::get("{$this->baseUrl}/market/overview");
        
        if ($response->successful()) {
            return $response->json();
        }
        
        throw new \Exception('API request failed');
    });
}
```

### Cấu hình API URL

Update file `.env`:
```env
STOCK_API_URL=https://your-api-url.com
STOCK_API_KEY=your-api-key
```

### Tắt auto-refresh

```tsx
<MarketOverviewWidget 
  data={marketOverview} 
  autoRefresh={false} 
/>
```

### Thay đổi refresh interval

```tsx
<MarketOverviewWidget 
  data={marketOverview} 
  refreshInterval={60000}  // 60 seconds
/>
```

## Testing

1. Mở trang Dashboard: http://127.0.0.1:8000/dashboard
2. Kiểm tra 3 chỉ số hiển thị đúng
3. Kiểm tra màu sắc (green/red/yellow) theo change
4. Kiểm tra countdown timer (30s)
5. Đợi 30s để xem auto-refresh hoạt động
6. Resize browser để test responsive

## TODO

- [ ] Tích hợp API thật thay mock data
- [ ] Add loading state khi refresh
- [ ] Add error handling UI
- [ ] Add manual refresh button
- [ ] Add last updated timestamp display
