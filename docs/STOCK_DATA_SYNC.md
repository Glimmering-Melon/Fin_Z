# Stock Data Synchronization

Hệ thống tự động fetch và lưu stock data vào database để tiết kiệm API calls và tăng performance.

## Architecture

```
┌─────────────────┐
│  Alpha Vantage  │ (External API - 25 calls/day limit)
└────────┬────────┘
         │ Fetch daily (6 AM)
         ▼
┌─────────────────┐
│   Laravel CMD   │ (stock:fetch-daily)
└────────┬────────┘
         │ Save
         ▼
┌─────────────────┐
│    Database     │ (stock_prices table)
└────────┬────────┘
         │ Read (unlimited)
         ▼
┌─────────────────┐
│   Frontend      │ (React Dashboard)
└─────────────────┘
```

## Commands

### Fetch Daily Data

```bash
# Fetch default stocks (AAPL, MSFT, GOOGL, etc.)
php artisan stock:fetch-daily

# Fetch specific stocks
php artisan stock:fetch-daily --symbol=AAPL --symbol=TSLA

# Fetch all stocks in database
php artisan stock:fetch-daily --all
```

### Initial Setup (First Time)

```bash
# Fetch historical data for popular stocks
php artisan stock:fetch-daily
```

This will:
- Create stocks if they don't exist
- Fetch last 100 days of data
- Save to database
- Takes ~2 minutes (rate limited to avoid API limits)

## Scheduler

Tự động chạy mỗi ngày lúc 6:00 AM (sau khi thị trường US đóng cửa):

```php
// app/Console/Kernel.php
$schedule->command('stock:fetch-daily')
    ->dailyAt('06:00')
    ->timezone('Asia/Ho_Chi_Minh');
```

### Start Scheduler

**Development:**
```bash
php artisan schedule:work
```

**Production (Linux):**
```bash
# Add to crontab
* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```

**Production (Windows):**
- Use Task Scheduler
- Run: `php artisan schedule:run`
- Trigger: Every minute

## API Endpoints

### Database Endpoints (Fast, No Limits)

```bash
# Get historical data
GET /api/stockdata/history/{symbol}?days=100

# Get latest price
GET /api/stockdata/latest/{symbol}

# Get top gainers
GET /api/stockdata/top-gainers?limit=10

# Get top losers
GET /api/stockdata/top-losers?limit=10
```

### Alpha Vantage Endpoints (Fallback)

```bash
# Intraday (for 1D chart)
GET /api/alphavantage/intraday/{symbol}?interval=5min

# Daily (if not in database)
GET /api/alphavantage/daily/{symbol}
```

## Data Flow

### Historical Data (1M, 3M, 1Y)
1. Frontend requests `/api/stockdata/history/{symbol}`
2. Backend checks database
3. If data exists and fresh → Return from DB ✅
4. If data missing/stale → Fetch from Alpha Vantage → Save to DB → Return
5. Frontend displays chart

### Intraday Data (1D)
1. Frontend requests `/api/alphavantage/intraday/{symbol}`
2. Backend fetches from Alpha Vantage (cached 5 min)
3. Return real-time data
4. Frontend displays chart

## Database Schema

### stocks table
```sql
- id
- symbol (unique)
- name
- exchange
- sector
- timestamps
```

### stock_prices table
```sql
- id
- stock_id (foreign key)
- date (unique with stock_id)
- open
- high
- low
- close
- volume
- timestamps
```

## Benefits

✅ **Fast** - Read from database (< 10ms vs 1-2s API call)
✅ **Unlimited** - No API rate limits for historical data
✅ **Reliable** - Not dependent on external API uptime
✅ **Cost-effective** - Only 1 API call/day/stock
✅ **Scalable** - Can handle many users simultaneously

## Monitoring

### Check Last Sync

```bash
# View logs
tail -f storage/logs/stock-fetch.log

# Check database
php artisan tinker
>>> StockPrice::latest()->first()
>>> StockPrice::where('date', today())->count()
```

### Manual Sync

```bash
# Force sync specific stock
php artisan stock:fetch-daily --symbol=AAPL

# Sync all
php artisan stock:fetch-daily --all
```

## Troubleshooting

### Issue: No data in database

**Solution:**
```bash
# Run initial fetch
php artisan stock:fetch-daily

# Check if stocks exist
php artisan tinker
>>> Stock::count()
>>> StockPrice::count()
```

### Issue: Data is stale

**Solution:**
```bash
# Manual fetch
php artisan stock:fetch-daily

# Check scheduler is running
php artisan schedule:list
```

### Issue: API rate limit exceeded

**Solution:**
- Wait 24 hours for limit reset
- Use database endpoints (no limits)
- Reduce number of stocks being fetched

### Issue: Scheduler not running

**Development:**
```bash
php artisan schedule:work
```

**Production:**
```bash
# Check cron
crontab -l

# Add if missing
* * * * * cd /path && php artisan schedule:run >> /dev/null 2>&1
```

## Performance Comparison

| Metric | Alpha Vantage API | Database |
|--------|------------------|----------|
| Response Time | 1-2 seconds | < 10ms |
| Rate Limit | 25 calls/day | Unlimited |
| Concurrent Users | Limited | Unlimited |
| Data Freshness | Real-time | Daily |
| Cost | Free tier | Storage only |

## Best Practices

1. **Run initial fetch** before going live
2. **Monitor logs** for fetch errors
3. **Set up scheduler** in production
4. **Use database endpoints** for historical data
5. **Use Alpha Vantage** only for intraday/real-time
6. **Cache aggressively** to reduce API calls
7. **Add more stocks** gradually to avoid rate limits

## Adding New Stocks

```bash
# Method 1: Via command
php artisan stock:fetch-daily --symbol=NVDA

# Method 2: Via tinker
php artisan tinker
>>> Stock::create(['symbol' => 'NVDA', 'name' => 'NVIDIA', 'exchange' => 'US'])
>>> exit
php artisan stock:fetch-daily --symbol=NVDA

# Method 3: Automatic (when user searches)
# Stock will be created and fetched automatically on first request
```

## Maintenance

### Clean Old Data

```bash
# Delete data older than 2 years
php artisan tinker
>>> StockPrice::where('date', '<', now()->subYears(2))->delete()
```

### Backup Database

```bash
# MySQL dump
mysqldump -u root -p stock_dashboard stock_prices > backup.sql

# Restore
mysql -u root -p stock_dashboard < backup.sql
```

## Future Enhancements

- [ ] Add queue jobs for parallel fetching
- [ ] Implement webhook for real-time updates
- [ ] Add data validation and anomaly detection
- [ ] Create admin panel for managing stocks
- [ ] Add support for multiple exchanges (Vietnam, etc.)
- [ ] Implement data compression for old records
- [ ] Add metrics and monitoring dashboard
