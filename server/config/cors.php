<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'register'],

    'allowed_methods' => ['*'],

    /*
     | When `supports_credentials` is true, browsers reject `*` here. Drive the
     | list from FRONTEND_URL (comma-separated for multi-environment setups).
     | Falls back to common local development origins.
     */
    'allowed_origins' => array_filter(array_map('trim', explode(',', env(
        'FRONTEND_URL',
        'http://localhost:3000,http://127.0.0.1:3000'
    )))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
