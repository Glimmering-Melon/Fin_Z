<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // Finnhub Stock API Configuration
    'finnhub' => [
        'base_url' => env('FINNHUB_API_BASE_URL', 'https://finnhub.io/api/v1'),
        'key' => env('FINNHUB_API_KEY'),
        'timeout' => env('FINNHUB_API_TIMEOUT', 10),
    ],

    // Alpha Vantage API Configuration
    'alpha_vantage' => [
        'base_url' => env('ALPHA_VANTAGE_BASE_URL', 'https://www.alphavantage.co/query'),
        'key' => env('ALPHA_VANTAGE_API_KEY'),
        'timeout' => env('ALPHA_VANTAGE_TIMEOUT', 15),
    ],

    // News API Configuration
    'news_api' => [
        'base_url' => env('NEWS_API_BASE_URL', 'https://newsapi.org/v2'),
        'key' => env('NEWS_API_KEY'),
        'timeout' => env('NEWS_API_TIMEOUT', 10),
    ],

    // Vietnam Stock Market API (example)
    'vn_stock_api' => [
        'base_url' => env('VN_STOCK_API_BASE_URL', 'https://api.vietstock.vn'),
        'key' => env('VN_STOCK_API_KEY'),
    ],

];
