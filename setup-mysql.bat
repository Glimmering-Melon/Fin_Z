@echo off
REM Stock Dashboard - MySQL Setup Script for Windows
REM This script helps you set up MySQL database for the project

echo =========================================
echo Stock Dashboard - MySQL Setup
echo =========================================
echo.

REM Check if MySQL is installed
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X MySQL is not installed. Please install MySQL first.
    echo Visit: https://dev.mysql.com/downloads/
    pause
    exit /b 1
)

echo √ MySQL is installed
echo.

REM Get MySQL credentials
set /p DB_USER="Enter MySQL root username [root]: "
if "%DB_USER%"=="" set DB_USER=root

set /p DB_PASS="Enter MySQL password: "
echo.

REM Database names
set DB_NAME=stock_dashboard
set DB_TEST=stock_dashboard_test

echo Creating databases...
echo.

REM Create databases
mysql -u %DB_USER% -p%DB_PASS% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE DATABASE IF NOT EXISTS %DB_TEST% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if %ERRORLEVEL% EQU 0 (
    echo √ Databases created successfully
    echo   - %DB_NAME%
    echo   - %DB_TEST%
) else (
    echo X Failed to create databases
    pause
    exit /b 1
)

echo.
echo Updating .env file...

REM Update .env file
if exist .env (
    powershell -Command "(gc .env) -replace 'DB_DATABASE=.*', 'DB_DATABASE=%DB_NAME%' | Out-File -encoding ASCII .env"
    powershell -Command "(gc .env) -replace 'DB_USERNAME=.*', 'DB_USERNAME=%DB_USER%' | Out-File -encoding ASCII .env"
    powershell -Command "(gc .env) -replace 'DB_PASSWORD=.*', 'DB_PASSWORD=%DB_PASS%' | Out-File -encoding ASCII .env"
    echo √ .env file updated
) else (
    echo ! .env file not found. Please copy .env.example to .env first
    pause
    exit /b 1
)

echo.
echo Running migrations...
php artisan migrate

if %ERRORLEVEL% EQU 0 (
    echo √ Migrations completed
) else (
    echo X Migration failed
    pause
    exit /b 1
)

echo.
set /p SEED="Do you want to seed sample data? (y/n): "
if /i "%SEED%"=="y" (
    php artisan db:seed --class=StockSeeder
    echo √ Sample data seeded
)

echo.
echo =========================================
echo √ Setup completed successfully!
echo =========================================
echo.
echo Database: %DB_NAME%
echo Test Database: %DB_TEST%
echo.
echo Next steps:
echo 1. Update your API keys in .env
echo 2. Run: composer dev
echo.
pause
