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
        'base_url' => env('GEMINI_API_URL', 'https://generativelanguage.googleapis.com/v1beta'),
        'generation_model' => env('GEMINI_GENERATION_MODEL', 'gemini-3.8-flash'),
        'embedding_model' => env('GEMINI_EMBEDDING_MODEL', 'gemini-embedding-001'),
        'max_chunks' => (int) env('RAG_MAX_CHUNKS', 5),
        'chunk_size' => (int) env('RAG_CHUNK_SIZE', 500),
    ],

    'cfrouter' => [
        'base_url' => env('CFROUTER_API_URL', 'https://api.cfrouter.my.id/v1'),
        'api_key' => env('CFROUTER_API_KEY', ''),
        'embedding_model' => env('CFROUTER_EMBEDDING_MODEL', 'agnes-2.5-flash'),
        'generation_model' => env('CFROUTER_GENERATION_MODEL', 'deepseek-v4-pro-0813'),
        'max_chunks' => (int) env('RAG_MAX_CHUNKS', 5),
        'chunk_size' => (int) env('RAG_CHUNK_SIZE', 500),
    ],

];
