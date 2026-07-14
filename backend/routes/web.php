<?php

use App\Http\Controllers\Api\GoogleController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;



Route::get('/api/auth/google/redirect', [GoogleController::class, 'redirect']);

Route::get('/api/auth/google/callback', [GoogleController::class, 'callback']);


Route::get('/api/google/user', function (Request $request) {

    if (!Auth::check()) {
        return response()->json([
            'success' => false,
            'message' => 'Not logged in'
        ], 401);
    }


    return response()->json([
        'success' => true,
        'user' => Auth::user()
    ]);
});
