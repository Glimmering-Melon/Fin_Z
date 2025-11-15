# Stock Market Dashboard

Web dashboard cho phân tích thị trường chứng khoán Việt Nam với các tính năng:

## Tính năng chính

### 1. Authentication & User Management
- Đăng nhập/đăng xuất
- Quên mật khẩu (email)
- Quản lý người dùng

### 2. Dashboard Tổng quan
- VN-Index, HNX-Index, UPCOM
- Top tăng/giảm
- Khối lượng giao dịch
- Watchlist cá nhân

### 3. Biểu đồ (Chart.js)
- Time-series chart giá/volume
- Multi-series comparison
- Khung thời gian linh hoạt

### 4. Heatmap (D3.js)
- Hiển thị theo ngành
- Gradient màu sắc
- Filter và zoom

### 5. Anomaly Detection
- Z-score analysis
- Cảnh báo bất thường
- Alert system

### 6. News Feed + Sentiment
- RSS feed tích hợp
- Sentiment analysis
- Filter theo keyword/symbol

### 7. Investment Simulator
- What-if analysis
- So sánh đầu tư
- P/L calculation

### 8. Job Scheduler
- Fetch stock prices
- Fetch news
- Detect anomalies
- Cleanup logs

## Cấu trúc dự án

```
backend/          # PHP backend API
  config/         # Configuration files
  src/            # Source code
    Controllers/  # API controllers
    Models/       # Data models
    Services/     # Business logic
    Middleware/   # Request middleware
    Jobs/         # Cron jobs
  routes/         # Route definitions
  database/       # Migrations
  public/         # Public entry point

frontend/         # Frontend application
  src/
    pages/        # Page components
    components/   # Reusable components
    services/     # API services
    utils/        # Utilities
    styles/       # CSS styles
```

## Cài đặt

### Backend
```bash
cd backend
composer install
cp .env.example .env
# Configure .env file
php -S localhost:8000 -t public
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## API Endpoints

- `/api/auth/login` - Authentication
- `/api/stocks/{symbol}` - Stock data
- `/api/stocks/{symbol}/history` - Historical data
- `/api/heatmap` - Heatmap data
- `/api/news` - News feed
- `/api/news/sentiment` - Sentiment analysis
- `/api/simulator` - Investment simulator
- `/api/alerts` - Anomaly alerts
- `/api/user/watchlist` - User watchlist

## Bảo mật

- JWT/Session authentication
- Rate limiting
- Input validation
- CSRF protection
- SQL injection protection
- HTTPS required
