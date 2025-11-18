#!/bin/bash

# Stock Dashboard - MySQL Setup Script
# This script helps you set up MySQL database for the project

echo "========================================="
echo "Stock Dashboard - MySQL Setup"
echo "========================================="
echo ""

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    echo "Visit: https://dev.mysql.com/downloads/"
    exit 1
fi

echo "✓ MySQL is installed"
echo ""

# Get MySQL credentials
read -p "Enter MySQL root username [root]: " DB_USER
DB_USER=${DB_USER:-root}

read -sp "Enter MySQL password: " DB_PASS
echo ""
echo ""

# Database names
DB_NAME="stock_dashboard"
DB_TEST="stock_dashboard_test"

echo "Creating databases..."
echo ""

# Create databases
mysql -u "$DB_USER" -p"$DB_PASS" <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS $DB_TEST CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOF

if [ $? -eq 0 ]; then
    echo "✓ Databases created successfully"
    echo "  - $DB_NAME"
    echo "  - $DB_TEST"
else
    echo "❌ Failed to create databases"
    exit 1
fi

echo ""
echo "Updating .env file..."

# Update .env file
if [ -f .env ]; then
    sed -i.bak "s/DB_DATABASE=.*/DB_DATABASE=$DB_NAME/" .env
    sed -i.bak "s/DB_USERNAME=.*/DB_USERNAME=$DB_USER/" .env
    sed -i.bak "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASS/" .env
    echo "✓ .env file updated"
else
    echo "⚠ .env file not found. Please copy .env.example to .env first"
    exit 1
fi

echo ""
echo "Running migrations..."
php artisan migrate

if [ $? -eq 0 ]; then
    echo "✓ Migrations completed"
else
    echo "❌ Migration failed"
    exit 1
fi

echo ""
read -p "Do you want to seed sample data? (y/n): " SEED
if [ "$SEED" = "y" ] || [ "$SEED" = "Y" ]; then
    php artisan db:seed --class=StockSeeder
    echo "✓ Sample data seeded"
fi

echo ""
echo "========================================="
echo "✓ Setup completed successfully!"
echo "========================================="
echo ""
echo "Database: $DB_NAME"
echo "Test Database: $DB_TEST"
echo ""
echo "Next steps:"
echo "1. Update your API keys in .env"
echo "2. Run: composer dev"
echo ""
