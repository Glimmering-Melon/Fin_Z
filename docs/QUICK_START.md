# Quick Start Guide

Hướng dẫn nhanh để chạy Stock Dashboard.

## Prerequisites

- PHP 8.2+
- MySQL 8.0+
- Node.js 18+
- Composer
- npm

## Installation

### 1. Clone & Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install Node dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy .env file (đã có sẵn)
# Kiểm tra cấu hình database trong .env

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=stock_dashboard
DB_USERNAME=root
DB_PASSWORD=05102005
```

### 3. Database Setup

```bash
# Chạy migrations
php artisan migrate

# Seed database với sample data
php artisan db:seed
```

### 4. Start Development Servers

```bash
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: Vite dev server
npm run dev
```

### 5. Access Application

```
http://localhost:8000
```

## Test Accounts

### Admin Account
```
Email: admin@stockdashboard.com
Password: Admin@123
```

### Demo Account
```
Email: demo@stockdashboard.com
Password: Demo@123
```

### Regular Users
```
Email: john@example.com
Password: Password@123

Email: jane@example.com
Password: Password@123
```

Xem thêm: [docs/USERS.md](./USERS.md)

## Features Overview

### ✅ Authentication
- Login / Register
- Forgot Password / Reset Password
- Session management
- Logout

Xem thêm: [docs/AUTHENTICATION.md](./AUTHENTICATION.md)

### ✅ Dashboard
- Market Overview (VN-INDEX, HNX-INDEX, UPCOM-INDEX)
- Top Gainers / Losers
- Search Stocks
- Watchlist Management
- Auto-refresh every 30s

Xem thêm: [docs/DASHBOARD.md](./DASHBOARD.md)

### ✅ Main Layout
- Responsive sidebar navigation
- User menu dropdown
- Mobile-friendly
- Active state highlighting

### 🚧 Coming Soon
- Chart page (stock price charts)
- Heatmap visualization
- News feed with sentiment analysis
- Investment simulator
- Settings page

## Project Structure

```
Fin_Z/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── WatchlistController.php
│   │   │   ├── ForgotPasswordController.php
│   │   │   ├── ResetPasswordController.php
│   │   │   └── Api/
│   │   │       ├── MarketDataController.php
│   │   │       └── SearchController.php
│   │   └── Middleware/
│   │       └── HandleInertiaRequests.php
│   └── Models/
│       ├── User.php
│       ├── Stock.php
│       ├── StockPrice.php
│       └── Watchlist.php
├── database/
│   ├── migrations/
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── UserSeeder.php
│       └── StockSeeder.php
├── resources/
│   ├── js/
│   │   ├── Components/
│   │   │   ├── MainLayout.tsx
│   │   │   ├── Auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   └── Dashboard/
│   │   │       ├── MarketOverviewWidget.tsx
│   │   │       ├── TopStocksWidget.tsx
│   │   │       └── SearchBar.tsx
│   │   └── pages/
│   │       ├── Auth/
│   │       │   ├── Login.tsx
│   │       │   ├── Register.tsx
│   │       │   ├── ForgotPassword.tsx
│   │       │   └── ResetPassword.tsx
│   │       └── Dashboard/
│   │           └── Index.tsx
│   └── views/
│       └── emails/
│           └── reset-password.blade.php
├── routes/
│   ├── web.php
│   └── api.php
└── docs/
    ├── AUTHENTICATION.md
    ├── DASHBOARD.md
    ├── USERS.md
    ├── MYSQL_SETUP.md
    └── QUICK_START.md
```

## API Endpoints

### Public Endpoints
```
GET  /api/market/overview        - Market indices data
GET  /api/market/top-gainers     - Top 10 gainers
GET  /api/market/top-losers      - Top 10 losers
GET  /api/search?q={query}       - Search stocks
```

### Authenticated Endpoints
```
GET    /api/user/watchlist       - Get user's watchlist
POST   /api/user/watchlist       - Add stock to watchlist
DELETE /api/user/watchlist/{id}  - Remove from watchlist
```

## Common Commands

### Development
```bash
# Start dev servers
php artisan serve
npm run dev

# Watch for changes
npm run dev

# Build for production
npm run build
```

### Database
```bash
# Run migrations
php artisan migrate

# Rollback migrations
php artisan migrate:rollback

# Fresh migration + seed
php artisan migrate:fresh --seed

# Seed only
php artisan db:seed

# Seed specific seeder
php artisan db:seed --class=UserSeeder
```

### Cache
```bash
# Clear all cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Cache config (production)
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Tinker (REPL)
```bash
# Open tinker
php artisan tinker

# Examples
>>> User::count()
>>> User::where('email', 'admin@stockdashboard.com')->first()
>>> Stock::count()
>>> StockPrice::latest()->first()
```

## Testing

### Manual Testing Checklist

#### Authentication
- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should fail)
- [ ] Forgot password flow
- [ ] Reset password with token
- [ ] Logout

#### Dashboard
- [ ] View market overview
- [ ] See VN-INDEX, HNX-INDEX, UPCOM-INDEX
- [ ] Switch between Top Gainers/Losers
- [ ] Search for stocks
- [ ] Add stock to watchlist
- [ ] Remove stock from watchlist
- [ ] Sort watchlist by symbol/change%
- [ ] Wait 30s for auto-refresh

#### Navigation
- [ ] Navigate to all pages
- [ ] Active state highlighting works
- [ ] Mobile menu works
- [ ] User dropdown works

#### Responsive Design
- [ ] Test on mobile (< 768px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (> 1024px)

## Troubleshooting

### Issue: "Connection refused" khi truy cập
**Solution**: 
```bash
# Kiểm tra Laravel server đang chạy
php artisan serve

# Kiểm tra Vite dev server đang chạy
npm run dev
```

### Issue: "SQLSTATE[HY000] [1045] Access denied"
**Solution**: Kiểm tra MySQL credentials trong `.env`

### Issue: "Mix manifest not found"
**Solution**: 
```bash
npm install
npm run dev
```

### Issue: "Class not found"
**Solution**: 
```bash
composer dump-autoload
php artisan config:clear
```

### Issue: Watchlist không load
**Solution**: 
```bash
# Kiểm tra user đã login
# Kiểm tra database có data
php artisan tinker
>>> Watchlist::count()
```

### Issue: Market data không hiển thị
**Solution**: 
```bash
# Seed stock data
php artisan db:seed --class=StockSeeder

# Kiểm tra
php artisan tinker
>>> Stock::count()
>>> StockPrice::count()
```

## Production Deployment

### 1. Environment
```bash
# Update .env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Generate key
php artisan key:generate
```

### 2. Optimize
```bash
# Cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Build assets
npm run build
```

### 3. Database
```bash
# Run migrations
php artisan migrate --force

# Seed (if needed)
php artisan db:seed --force
```

### 4. Permissions
```bash
# Set proper permissions
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### 5. Web Server
Configure Nginx/Apache to point to `public/` directory

## Support

### Documentation
- [Authentication](./AUTHENTICATION.md)
- [Dashboard](./DASHBOARD.md)
- [Users](./USERS.md)
- [MySQL Setup](./MYSQL_SETUP.md)

### Laravel Resources
- [Laravel Documentation](https://laravel.com/docs)
- [Inertia.js Documentation](https://inertiajs.com)
- [React Documentation](https://react.dev)

### Common Issues
Check the Troubleshooting section above or search in:
- Laravel GitHub Issues
- Stack Overflow
- Laravel Discord

## Next Steps

1. **Add Stock Data**
   - Import real stock data
   - Setup data fetching from API
   - Schedule daily updates

2. **Implement Chart Page**
   - Install Chart.js
   - Create interactive charts
   - Add technical indicators

3. **Build Heatmap**
   - Install D3.js
   - Create treemap visualization
   - Add sector filtering

4. **News Feed**
   - Integrate news API
   - Implement sentiment analysis
   - Add filtering and search

5. **Investment Simulator**
   - Calculate historical returns
   - Compare multiple stocks
   - Show growth charts

Happy coding! 🚀
