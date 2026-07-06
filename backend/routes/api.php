<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\RoomTypeController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\Api\GuestController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\RoomLayoutController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BookingController;

Route::middleware('api')->post('/login', [AuthController::class, 'login']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']);

Route::get('/customer/{id}', [CustomerController::class, 'getCustomer']);

// ── Room Types ────────────────────────────────────────────────────────────────
Route::post('/room-types', [RoomTypeController::class, 'store']);
Route::get('/room-types', [RoomTypeController::class, 'index']);
Route::patch('/room-types/{id}/toggle-status', [RoomTypeController::class, 'toggleStatus']);
Route::put('/room-types/{id}', [RoomTypeController::class, 'update']);
Route::delete('/room-types/{id}', [RoomTypeController::class, 'destroy']);
Route::apiResource('room-types', RoomTypeController::class);

// ── Rooms — layout routes MUST come before apiResource ────────────────────────
// apiResource creates GET /rooms/{room} which would intercept /rooms/layout
// treating "layout" as a room ID → must define specific routes first
Route::get('/rooms/layout',  [RoomLayoutController::class, 'getLayout']);
Route::post('/rooms/layout', [RoomLayoutController::class, 'saveLayout']);
Route::get('/rooms/available', [RoomController::class, 'available']); // must be BEFORE the next line
Route::get('/rooms/{roomNumber}', [RoomController::class, 'show']);
Route::patch('rooms/{room_number}/toggle-status', [RoomController::class, 'toggleStatus']);
Route::apiResource('rooms', RoomController::class);

// ── Reservations ──────────────────────────────────────────────────────────────
Route::prefix('reservations')->group(function () {
    // Route::post('/walk-in', [ReservationController::class, 'storeWalkIn']);
});
Route::get('/bookings', [BookingController::class, 'index']);
Route::post('/bookings', [BookingController::class, 'store']);

// Secured — was previously unprotected, now requires an authenticated user
Route::middleware('auth:sanctum')->put('/profile/update', [ProfileController::class, 'update']);

Route::get('/guests/search', [GuestController::class, 'search']);
Route::post('/guests', [GuestController::class, 'store']);
Route::delete('/guests/{id}', [GuestController::class, 'destroy']);

Route::get('/reservations', [ReservationController::class, 'index']);
Route::post('/reservations', [ReservationController::class, 'store']);
Route::delete('/reservations/{id}', [ReservationController::class, 'destroy']);

Route::post('/payments', [PaymentController::class, 'store']);