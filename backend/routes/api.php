<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\RoomTypeController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\ReservationController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::get('/customer/{id}', [CustomerController::class, 'getCustomer']);
Route::post('/room-types', [RoomTypeController::class, 'store']);
Route::get('/room-types', [RoomTypeController::class, 'index']);
Route::patch('/room-types/{id}/toggle-status', [RoomTypeController::class, 'toggleStatus']);
Route::put('/room-types/{id}', [RoomTypeController::class, 'update']);
Route::delete('/room-types/{id}', [RoomTypeController::class, 'destroy']);
Route::apiResource('room-types', RoomTypeController::class);
Route::patch('rooms/{room_number}/toggle-status', [RoomController::class, 'toggleStatus']);
Route::apiResource('rooms', RoomController::class);


Route::prefix('reservations')->group(function () {
    Route::post('/walk-in', [ReservationController::class, 'storeWalkIn']);
});