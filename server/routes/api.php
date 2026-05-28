<?php

use App\Http\Controllers\AddressController;
use App\Http\Controllers\ApiRequestController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductQuestionController;
use App\Http\Controllers\RatingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Auth
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

// Public product catalog
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'getProduct']);
Route::get('/products/{id}/ratings', [RatingController::class, 'index']);
Route::get('/products/{id}/questions', [ProductQuestionController::class, 'index']);

// Authenticated customer routes
Route::middleware('auth:sanctum')->group(function () {
    // Addresses
    Route::get('/address', [AddressController::class, 'index']);
    Route::post('/address', [AddressController::class, 'store']);
    Route::delete('/address/{id}', [AddressController::class, 'destroy']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);

    // Ratings (write)
    Route::post('/products/{id}/ratings', [RatingController::class, 'store']);

    // Q&A — customer asks a question against a product
    Route::post('/products/{id}/questions', [ProductQuestionController::class, 'store']);

    // Coupons — preview/validate a code against a tentative subtotal
    Route::post('/coupons/preview', [CouponController::class, 'preview']);

    // Internal
    Route::get('/request-counts', [ApiRequestController::class, 'getRequestCounts']);
});

// Admin (auth + log middleware preserved from existing setup)
Route::middleware(['auth:sanctum', 'admin', 'log.api.request'])->group(function () {
    // Products
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Orders — full-shop view + status mutations
    Route::get('/admin/orders', [OrderController::class, 'adminIndex']);
    Route::patch('/admin/orders/{id}/status', [OrderController::class, 'updateStatus']);

    // Customers
    Route::get('/admin/customers', [CustomerController::class, 'index']);
    Route::get('/admin/customers/{id}', [CustomerController::class, 'show']);

    // Coupons CRUD
    Route::get('/admin/coupons', [CouponController::class, 'index']);
    Route::post('/admin/coupons', [CouponController::class, 'store']);
    Route::delete('/admin/coupons/{id}', [CouponController::class, 'destroy']);

    // Q&A: admin posts an answer
    Route::patch('/admin/questions/{id}/answer', [ProductQuestionController::class, 'answer']);
});
