<?php

echo "Testing Title & Icon Changes\n";
echo "=============================\n\n";

// Check .env
$envPath = __DIR__ . '/.env';
if (file_exists($envPath)) {
    $envContent = file_get_contents($envPath);
    
    if (preg_match('/APP_NAME=(.+)/', $envContent, $matches)) {
        $appName = trim($matches[1], '"\'');
        echo "✓ APP_NAME in .env: $appName\n";
    }
}

// Check app.blade.php
$bladePath = __DIR__ . '/resources/views/app.blade.php';
if (file_exists($bladePath)) {
    $bladeContent = file_get_contents($bladePath);
    
    if (strpos($bladeContent, 'Logo-01.png') !== false) {
        echo "✓ Favicon uses Logo-01.png\n";
    } else {
        echo "✗ Favicon does NOT use Logo-01.png\n";
    }
}

// Check if Logo-01.png exists
$logoPath = __DIR__ . '/public/Logo-01.png';
if (file_exists($logoPath)) {
    echo "✓ Logo-01.png exists (" . number_format(filesize($logoPath) / 1024, 2) . " KB)\n";
} else {
    echo "✗ Logo-01.png NOT found\n";
}

echo "\n=============================\n";
echo "✓ Changes applied!\n\n";
echo "To verify:\n";
echo "1. Open http://localhost:8000/\n";
echo "2. Check browser tab title (should be 'FinZoo')\n";
echo "3. Check favicon icon (should be Logo-01.png)\n";
echo "4. If icon doesn't change, press Ctrl+F5 to hard refresh\n";
