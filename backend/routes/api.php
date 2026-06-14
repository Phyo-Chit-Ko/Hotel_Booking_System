<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\RoomTypeController;
use App\Http\Controllers\RoomController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::get('/customer/{id}', [CustomerController::class, 'getCustomer']);

// When React hits /api/room-types, execute the store method inside RoomTypeController
Route::post('/room-types', [RoomTypeController::class, 'store']);
// Add this line to map the index read capability
Route::get('/room-types', [RoomTypeController::class, 'index']);
Route::patch('/room-types/{id}/toggle-status', [RoomTypeController::class, 'toggleStatus']);


// Update existing row entry values pattern mapping
Route::put('/room-types/{id}', [RoomTypeController::class, 'update']);

// Delete/Destroy a specific database row configuration pattern mapping
Route::delete('/room-types/{id}', [RoomTypeController::class, 'destroy']);


// Your existing working route
Route::apiResource('room-types', RoomTypeController::class);



// 1. Register the unique custom patch endpoint BEFORE the API resource tracker block
Route::patch('rooms/{room_number}/toggle-status', [RoomController::class, 'toggleStatus']);

// 2. Maps standard index, store, update, destroy requests seamlessly
Route::apiResource('rooms', RoomController::class);