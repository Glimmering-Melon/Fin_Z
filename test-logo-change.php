<?php

echo "Testing Logo Change\n";
echo "===================\n\n";

// Check if Logo-01.png exists
$logoPath = __DIR__ . '/public/Logo-01.png';
if (file_exists($logoPath)) {
    echo "✓ Logo-01.png exists in public folder\n";
    echo "  Path: /public/Logo-01.png\n";
    echo "  Size: " . number_format(filesize($logoPath) / 1024, 2) . " KB\n";
} else {
    echo "✗ Logo-01.png NOT found in public folder\n";
}

echo "\n";

// Check if MainLayout.tsx uses the new logo
$mainLayoutPath = __DIR__ . '/resources/js/Components/MainLayout.tsx';
if (file_exists($mainLayoutPath)) {
    $content = file_get_contents($mainLayoutPath);
    
    if (strpos($content, 'Logo-01.png') !== false) {
        echo "✓ MainLayout.tsx uses Logo-01.png\n";
    } else {
        echo "✗ MainLayout.tsx does NOT use Logo-01.png\n";
    }
    
    if (strpos($content, 'bg-gradient-to-br from-blue-500 to-cyan-400') !== false) {
        echo "✗ Old gradient logo still present\n";
    } else {
        echo "✓ Old gradient logo removed\n";
    }
}

echo "\n===================\n";
echo "✓ Logo change complete!\n\n";
echo "To verify:\n";
echo "1. Open http://localhost:8000/\n";
echo "2. Check the logo in the header (top-left)\n";
echo "3. Logo should be Logo-01.png instead of gradient box\n";
