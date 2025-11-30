<?php

echo "Testing All Favicon Files\n";
echo "==========================\n\n";

$requiredFiles = [
    'favicon.ico' => 'ICO format for old browsers',
    'favicon.svg' => 'SVG format for modern browsers',
    'favicon-16x16.png' => '16x16 PNG',
    'favicon-32x32.png' => '32x32 PNG',
    'apple-touch-icon.png' => 'Apple touch icon (180x180)',
    'android-chrome-192x192.png' => 'Android icon 192x192',
    'android-chrome-512x512.png' => 'Android icon 512x512',
    'site.webmanifest' => 'Web manifest for PWA',
];

echo "Checking favicon files in public/:\n\n";

$allExist = true;
foreach ($requiredFiles as $file => $description) {
    $path = __DIR__ . '/public/' . $file;
    if (file_exists($path)) {
        $size = filesize($path);
        $sizeKB = number_format($size / 1024, 2);
        echo "✓ $file ($sizeKB KB) - $description\n";
    } else {
        echo "✗ $file - MISSING\n";
        $allExist = false;
    }
}

echo "\n";

// Check app.blade.php
$bladePath = __DIR__ . '/resources/views/app.blade.php';
if (file_exists($bladePath)) {
    $bladeContent = file_get_contents($bladePath);
    
    echo "Checking app.blade.php configuration:\n\n";
    
    $checks = [
        'favicon-32x32.png' => '32x32 PNG',
        'favicon-16x16.png' => '16x16 PNG',
        'favicon.ico' => 'ICO fallback',
        'favicon.svg' => 'SVG icon',
        'apple-touch-icon.png' => 'Apple icon',
        'site.webmanifest' => 'Web manifest',
    ];
    
    foreach ($checks as $file => $desc) {
        if (strpos($bladeContent, $file) !== false) {
            echo "✓ $desc configured\n";
        } else {
            echo "✗ $desc NOT configured\n";
        }
    }
}

echo "\n";

// Check site.webmanifest content
$manifestPath = __DIR__ . '/public/site.webmanifest';
if (file_exists($manifestPath)) {
    $manifest = json_decode(file_get_contents($manifestPath), true);
    
    echo "Web Manifest Configuration:\n";
    echo "  Name: {$manifest['name']}\n";
    echo "  Short Name: {$manifest['short_name']}\n";
    echo "  Theme Color: {$manifest['theme_color']}\n";
    echo "  Icons: " . count($manifest['icons']) . " configured\n";
}

echo "\n==========================\n";
if ($allExist) {
    echo "✓ All favicon files are ready!\n";
} else {
    echo "✗ Some files are missing\n";
}

echo "\nTo verify:\n";
echo "1. Open http://localhost:8000/\n";
echo "2. Check browser tab icon\n";
echo "3. Add to home screen on mobile to test PWA icons\n";
echo "4. Press Ctrl+F5 to hard refresh if icon doesn't change\n";
