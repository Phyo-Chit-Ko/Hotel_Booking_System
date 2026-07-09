<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ExtraServiceController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\RoomTypeController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\RestaurantOrderController;
use App\Http\Controllers\Api\GuestController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\RoomLayoutController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\Api\FloorLayoutController;
use App\Http\Controllers\Api\ReservationGuestController;
// <<<<<<< HEAD

// <<<<<<< HEAD
 
// <<<<<<< Updated upstream
// =======
// use App\Http\Controllers\Api\RestaurantItemController;
 
 
// >>>>>>> origin/restaurant_backend
// =======
 
//new edit ppsp
Route::apiResource('users', UserController::class);
//new edit ppsp
 
// >>>>>>> Stashed changes
Route::middleware('api')->post('/login', [AuthController::class, 'login']);
 
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
 
Route::post('/register', [AuthController::class, 'register']);
 
// =======
use App\Http\Controllers\Api\RestaurantItemController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/


Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::apiResource('users', UserController::class);

Route::middleware('auth:sanctum')->group(function () {
    
    // update settings //
    Route::get('/user/profile', [UserController::class, 'getCurrentUser']);
    Route::put('/user/profile', [UserController::class, 'updateOwnProfile']);
    Route::put('/user/password', [UserController::class, 'changeOwnPassword']);
    // update settings ///

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::put('/bookings/{id}', [BookingController::class, 'update']);
    Route::put('/profile/update', [ProfileController::class, 'update']);
});


// 🌐 OTHER HOTEL SYSTEM ROUTES
// >>>>>>> origin/function/settings
Route::get('/customer/{id}', [CustomerController::class, 'getCustomer']);
Route::get('/room-types', [RoomTypeController::class, 'index']);
Route::post('/room-types', [RoomTypeController::class, 'store']);
Route::patch('/room-types/{id}/toggle-status', [RoomTypeController::class, 'toggleStatus']);
Route::put('/room-types/{id}', [RoomTypeController::class, 'update']);
Route::delete('/room-types/{id}', [RoomTypeController::class, 'destroy']);
Route::apiResource('room-types', RoomTypeController::class);
 
Route::get('/rooms/layout',  [RoomLayoutController::class, 'getLayout']);
Route::post('/rooms/layout', [RoomLayoutController::class, 'saveLayout']);
Route::get('/rooms/available', [RoomController::class, 'available']); 
Route::get('/rooms/{roomNumber}', [RoomController::class, 'show']);
Route::patch('rooms/{room_number}/toggle-status', [RoomController::class, 'toggleStatus']);
Route::apiResource('rooms', RoomController::class);
// <<<<<<< HEAD
 
// ── Reservations ──────────────────────────────────────────────────────────────
Route::prefix('reservations')->group(function () {
    // Route::post('/walk-in', [ReservationController::class, 'storeWalkIn']);
});
Route::get('/bookings', [BookingController::class, 'index']);
Route::post('/bookings', [BookingController::class, 'store']);
// <<<<<<< Updated upstream
Route::middleware('auth:sanctum')->put('/bookings/{id}', [BookingController::class, 'update']);

// =======
Route::put('/bookings/{id}', [BookingController::class, 'update']);
 
// >>>>>>> Stashed changes
// Secured — was previously unprotected, now requires an authenticated user
Route::middleware('auth:sanctum')->put('/profile/update', [ProfileController::class, 'update']);
 
// =======

Route::get('/bookings', [BookingController::class, 'index']);
Route::post('/bookings', [BookingController::class, 'store']);

// >>>>>>> origin/function/settings
Route::get('/guests/search', [GuestController::class, 'search']);
Route::post('/guests', [GuestController::class, 'store']);
Route::delete('/guests/{id}', [GuestController::class, 'destroy']);
Route::get('/guests', [GuestController::class, 'index']);

Route::get('/reservations', [ReservationController::class, 'index']);
Route::post('/reservations', [ReservationController::class, 'store']);
Route::delete('/reservations/{id}', [ReservationController::class, 'destroy']);
// <<<<<<< HEAD
 
Route::post('/payments', [PaymentController::class, 'store']);
 
 
 
// =======
Route::get('/reservations/{id}/detail', [ReservationController::class, 'detail']);
Route::post('/reservations/{id}/check-in', [ReservationController::class, 'checkIn']);
Route::patch('/reservations/{id}/check-out', [ReservationController::class, 'checkOut']);
Route::patch('/reservations/{id}/extend', [ReservationController::class, 'extend']);
Route::patch('/reservations/{id}/move-room', [ReservationController::class, 'moveRoom']);

Route::post('/payments', [PaymentController::class, 'store']);

// >>>>>>> origin/function/settings
Route::get('/floor-layout',       [FloorLayoutController::class, 'index']);
Route::post('/floor-layout',      [FloorLayoutController::class, 'store']);
Route::patch('/floor-layout/{id}',[FloorLayoutController::class, 'update']);
Route::delete('/floor-layout/{id}',[FloorLayoutController::class, 'destroy']);
// <<<<<<< HEAD
 
 
 
// =======

// >>>>>>> origin/function/settings
Route::get('/reservations/{reservation}/guests', [ReservationGuestController::class, 'index']);
Route::post('/reservations/{reservation}/guests', [ReservationGuestController::class, 'store']);
Route::delete('/reservations/{reservation}/guests/{guest}', [ReservationGuestController::class, 'destroy']);
 
Route::get('/services', [ExtraServiceController::class, 'index']);
Route::post('/services', [ExtraServiceController::class, 'store']);
Route::put('/services/{id}', [ExtraServiceController::class, 'update']);
Route::delete('/services/{id}', [ExtraServiceController::class, 'destroy']);
// <<<<<<< HEAD
 
// <<<<<<< HEAD
 
Route::get('/reservations/{id}/detail', [ReservationController::class, 'detail']);
Route::post('/reservations/{id}/check-in', [ReservationController::class, 'checkIn']);
Route::patch('/reservations/{id}/check-out', [ReservationController::class, 'checkOut']);
// <<<<<<< Updated upstream
Route::patch('/reservations/{id}/extend', [ReservationController::class, 'extend']);
Route::patch('/reservations/{id}/move-room', [ReservationController::class, 'moveRoom']);
// =======
 
// >>>>>>> Stashed changes
// =======
Route::get('/restaurant-items', [RestaurantItemController::class, 'index']);
 
Route::post('/restaurant-items', [RestaurantItemController::class, 'store']);
 
Route::put('/restaurant-items/{id}', [RestaurantItemController::class, 'update']);
 
Route::patch('/restaurant-items/{id}/toggle-status', [RestaurantItemController::class, 'toggleStatus']);
 
Route::delete('/restaurant-items/{id}', [RestaurantItemController::class, 'destroy']);
Route::get('/restaurant/dashboard-stats', [RestaurantOrderController::class, 'getDashboardStats']);
// >>>>>>> origin/restaurant_backend
 
 
// =======

Route::get('/restaurant-items', [RestaurantItemController::class, 'index']);
Route::post('/restaurant-items', [RestaurantItemController::class, 'store']);
Route::put('/restaurant-items/{id}', [RestaurantItemController::class, 'update']);
Route::patch('/restaurant-items/{id}/toggle-status', [RestaurantItemController::class, 'toggleStatus']);
Route::delete('/restaurant-items/{id}', [RestaurantItemController::class, 'destroy']);
// >>>>>>> origin/function/settings
