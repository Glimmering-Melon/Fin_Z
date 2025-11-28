@echo off
echo ========================================
echo Setup Watchlist Test Environment
echo ========================================
echo.

echo [1/4] Running migrations...
php artisan migrate --force
if %errorlevel% neq 0 (
    echo Error: Migration failed!
    pause
    exit /b 1
)

echo.
echo [2/4] Seeding test data...
php artisan db:seed --class=WatchlistTestSeeder
if %errorlevel% neq 0 (
    echo Error: Seeding failed!
    pause
    exit /b 1
)

echo.
echo [3/4] Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo Warning: Build failed, trying dev mode...
)

echo.
echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo Test data created:
echo - Email: test@example.com
echo - Password: password
echo - Sample stocks: VNM, VIC, HPG, VHM, FPT
echo.
echo [4/4] Starting server...
echo Open browser: http://localhost:8000/test/watchlist
echo.
php artisan serve
