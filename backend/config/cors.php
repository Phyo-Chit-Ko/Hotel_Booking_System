<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers.
    |
    */

    // Paths that are accessible from other origins (React)
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout'],

    // Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    'allowed_methods' => ['*'],

    // Specific origin for your React development server
    // Change this if your React app uses a different port
    'allowed_origins' => ['http://localhost:5173'],

    'allowed_origins_patterns' => [],

    // Allow all headers (Content-Type, Authorization, etc.)
    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    // Cache duration for preflight requests
    'max_age' => 0,

    // IMPORTANT: Required to allow cookies/authentication sessions
    'supports_credentials' => true,

];
