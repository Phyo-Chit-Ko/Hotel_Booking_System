<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    // Paths that are accessible from React frontend
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'login',
        'logout',
    ],

    // Allow all HTTP methods (GET, POST, PUT, DELETE, PATCH)
    'allowed_methods' => ['*'],

    // React development servers
    'allowed_origins' => [
        'http://localhost:5173',
        'http://localhost:5174',
    ],

    'allowed_origins_patterns' => [],

    // Allow all headers
    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    // Cache duration for preflight requests
    'max_age' => 0,

    // Required for cookies / Sanctum authentication
    'supports_credentials' => true,

];