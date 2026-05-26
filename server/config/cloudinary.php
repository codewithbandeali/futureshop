<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cloudinary Configuration
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for Cloudinary, the
    | recommended provider for image / video / file hosting in FutureShop.
    |
    | Set CLOUDINARY_URL in your .env. The cloudinary-labs/cloudinary-laravel
    | package picks it up automatically; the rest is provided here so the
    | service container can be type-hinted and we can keep upload defaults
    | in one place.
    |
    */

    'cloud_url' => env('CLOUDINARY_URL'),

    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),

    'api_key' => env('CLOUDINARY_API_KEY'),

    'api_secret' => env('CLOUDINARY_API_SECRET'),

    /*
    | Folder uploaded assets will be stored under. Keep it stable —
    | changing it doesn't move existing assets, it only affects new uploads.
    */
    'upload_folder' => env('CLOUDINARY_UPLOAD_FOLDER', 'futureshop/products'),

    /*
    | Default transformation flags appended to delivered URLs by our helper.
    | f_auto picks the best modern format per browser (WebP / AVIF / JPEG).
    | q_auto picks the right quality for the bandwidth situation.
    */
    'default_transformations' => 'f_auto,q_auto',

    /*
    | Notification URL Cloudinary calls after a long-running async job
    | (eligible video processing, etc.). Leave blank for simple image uploads.
    */
    'notification_url' => env('CLOUDINARY_NOTIFICATION_URL'),

];
