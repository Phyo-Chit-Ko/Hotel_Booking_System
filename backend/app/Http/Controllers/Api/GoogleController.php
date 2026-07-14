<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }


    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = User::updateOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'name' => $googleUser->getName(),
                    'google_id' => $googleUser->getId(),
                    'password' => bcrypt(uniqid()),
                    'role' => 'user',
                    // MARK AS VERIFIED IMMEDIATELY
                    'email_verified_at' => now(),
                ]
            );

            // Generate Sanctum Token
            $token = $user->createToken('auth_token')->plainTextToken;

            // Redirect to success route
            // In GoogleController.php
            return redirect("http://localhost:5173/auth/success?token=" . $token);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
