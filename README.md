# Stock Market Dashboard

Dashboard phân tích thị trường chứng khoán Việt Nam với các tính năng nâng cao.

## Tính năng chính

### 1. Authentication & User Management
- Đăng nhập/đăng ký
- Quên mật khẩu
- Quản lý người dùng

### 2. Dashboard Tổng quan
- VN-Index, HNX-Index, UPCOM
- Top gainers/losers
- Khối lượng giao dịch
- Watchlist cá nhân

### 3. Biểu đồ (Chart.js)
- Time-series chart giá & volume
- So sánh nhiều mã cổ phiếu
- Nhiều khung thời gian

### 4. Heatmap (D3.js)
- Hiển thị theo ngành
- Gradient màu sắc
- Filter và zoom

### 5. Anomaly Detection
- Phát hiện bất thường volume/price
- Z-score calculation
- Cảnh báo tự động

### 6. News Feed + Sentiment Analysis
- Tin tức tài chính
- Phân tích sentiment
- Filter theo sentiment/symbol

### 7. Investment Simulator
- Mô phỏng đầu tư
- So sánh nhiều mã
- Tính P/L và lợi nhuận

### 8. Job Scheduler
- Fetch stock prices
- Fetch news
- Detect anomalies
- Cleanup logs

## Cài đặt

```bash
# Clone repository
git clone <repo-url>

# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Create MySQL database
mysql -u root -p -e "CREATE DATABASE stock_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Optional: Create test database
mysql -u root -p -e "CREATE DATABASE stock_dashboard_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Update .env with your MySQL credentials
# DB_DATABASE=stock_dashboard
# DB_USERNAME=root
# DB_PASSWORD=your_password

# Run migrations
php artisan migrate

# Seed data
php artisan db:seed --class=StockSeeder

# Build assets
npm run build

# Start development server
composer dev
```

## Cấu trúc Database

- `stocks` - Danh sách cổ phiếu
- `stock_prices` - Giá lịch sử
- `alerts` - Cảnh báo bất thường
- `news` - Tin tức
- `watchlists` - Danh sách theo dõi
- `user_settings` - Cài đặt người dùng
- `system_logs` - Logs hệ thống

## API Endpoints

- `GET /api/stocks` - Danh sách cổ phiếu
- `GET /api/stocks/{symbol}` - Chi tiết cổ phiếu
- `GET /api/stocks/{symbol}/history` - Lịch sử giá
- `GET /api/heatmap` - Dữ liệu heatmap
- `GET /api/news` - Tin tức
- `GET /api/alerts` - Cảnh báo
- `POST /api/simulator` - Mô phỏng đầu tư
- `GET /api/user/watchlist` - Watchlist

## Scheduled Jobs

```bash
# Fetch stock prices every hour
php artisan stocks:fetch-prices

# Fetch news every hour
php artisan stocks:fetch-news

# Detect anomalies daily
php artisan stocks:detect-anomalies

# Cleanup logs weekly
php artisan logs:cleanup
```


## TODO

Tất cả các file đã được tạo với placeholder comments. Cần implement logic cho từng tính năng.
