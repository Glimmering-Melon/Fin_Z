<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "Testing Authentication...\n\n";

// Test 1: Check if users exist
$userCount = User::count();
echo "Total users in database: {$userCount}\n";

if ($userCount === 0) {
    echo "❌ No users found! Run: php artisan db:seed --class=UserSeeder\n";
    exit(1);
}

// Test 2: Check admin user
$admin = User::where('email', 'admin@stockdashboard.com')->first();
if ($admin) {
    echo "✅ Admin user exists: {$admin->email}\n";
    
    // Test password
    if (Hash::check('Admin@123', $admin->password)) {
        echo "✅ Admin password is correct\n";
    } else {
        echo "❌ Admin password is incorrect\n";
    }
} else {
    echo "❌ Admin user not found\n";
}

// Test 3: Check demo user
$demo = User::where('email', 'demo@stockdashboard.com')->first();
if ($demo) {
    echo "✅ Demo user exists: {$demo->email}\n";
    
    // Test password
    if (Hash::check('Demo@123', $demo->password)) {
        echo "✅ Demo password is correct\n";
    } else {
        echo "❌ Demo password is incorrect\n";
    }
} else {
    echo "❌ Demo user not found\n";
}

// Test 4: Check sessions table
$sessionsTableExists = Illuminate\Support\Facades\Schema::hasTable('sessions');
echo $sessionsTableExists ? "✅ Sessions table exists\n" : "❌ Sessions table missing\n";

// Test 5: Check stocks table
$stocksCount = App\Models\Stock::count();
echo "Total stocks in database: {$stocksCount}\n";
if ($stocksCount === 0) {
    echo "⚠️  No stocks found. Dashboard may show empty data.\n";
    echo "   Run: php artisan db:seed --class=StockSeeder\n";
}

echo "\n✅ Authentication setup looks good!\n";
echo "\nTest login with:\n";
echo "Email: admin@stockdashboard.com\n";
echo "Password: Admin@123\n";
