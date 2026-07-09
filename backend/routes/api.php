<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ExtraServiceController;
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
use App\Http\Controllers\Api\FloorLayoutController;
use App\Http\Controllers\Api\ReservationGuestController;
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

Route::get('/bookings', [BookingController::class, 'index']);
Route::post('/bookings', [BookingController::class, 'store']);

Route::get('/guests/search', [GuestController::class, 'search']);
Route::post('/guests', [GuestController::class, 'store']);
Route::delete('/guests/{id}', [GuestController::class, 'destroy']);
Route::get('/guests', [GuestController::class, 'index']);

Route::get('/reservations', [ReservationController::class, 'index']);
Route::post('/reservations', [ReservationController::class, 'store']);
Route::delete('/reservations/{id}', [ReservationController::class, 'destroy']);
Route::get('/reservations/{id}/detail', [ReservationController::class, 'detail']);
Route::post('/reservations/{id}/check-in', [ReservationController::class, 'checkIn']);
Route::patch('/reservations/{id}/check-out', [ReservationController::class, 'checkOut']);
Route::patch('/reservations/{id}/extend', [ReservationController::class, 'extend']);
Route::patch('/reservations/{id}/move-room', [ReservationController::class, 'moveRoom']);

Route::post('/payments', [PaymentController::class, 'store']);

Route::get('/floor-layout',       [FloorLayoutController::class, 'index']);
Route::post('/floor-layout',      [FloorLayoutController::class, 'store']);
Route::patch('/floor-layout/{id}',[FloorLayoutController::class, 'update']);
Route::delete('/floor-layout/{id}',[FloorLayoutController::class, 'destroy']);

Route::get('/reservations/{reservation}/guests', [ReservationGuestController::class, 'index']);
Route::post('/reservations/{reservation}/guests', [ReservationGuestController::class, 'store']);
Route::delete('/reservations/{reservation}/guests/{guest}', [ReservationGuestController::class, 'destroy']);

Route::get('/services', [ExtraServiceController::class, 'index']);
Route::post('/services', [ExtraServiceController::class, 'store']);
Route::put('/services/{id}', [ExtraServiceController::class, 'update']);
Route::delete('/services/{id}', [ExtraServiceController::class, 'destroy']);

Route::get('/restaurant-items', [RestaurantItemController::class, 'index']);
Route::post('/restaurant-items', [RestaurantItemController::class, 'store']);
Route::put('/restaurant-items/{id}', [RestaurantItemController::class, 'update']);
Route::patch('/restaurant-items/{id}/toggle-status', [RestaurantItemController::class, 'toggleStatus']);
Route::delete('/restaurant-items/{id}', [RestaurantItemController::class, 'destroy']);