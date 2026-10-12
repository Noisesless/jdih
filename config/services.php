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
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'groq' => [
        'key' => env('GROQ_API_KEY'),
    ],

    'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),
        'api_keys' => env('GEMINI_API_KEYS'), // Pool multi-key failover (pisahkan dengan koma)
        'base_url' => env('GEMINI_API_URL', 'https://generativelanguage.googleapis.com/v1beta'),
        'generation_model' => env('GEMINI_GENERATION_MODEL', env('GEMINI_MODEL', 'gemini-3.5-flash')),
        'embedding_model' => env('GEMINI_EMBEDDING_MODEL', 'gemini-embedding-001'),
        'max_chunks' => (int) env('RAG_MAX_CHUNKS', 5),
        'chunk_size' => (int) env('RAG_CHUNK_SIZE', 500),
        'python_bin' => env('PYTHON_BIN', 'python3'),
    ],

];
