<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerifyEmailMail;
use Illuminate\Support\Facades\Log; // Add this line

class AuthController extends Controller
{
    // Handle Login
    public function login(Request $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 401);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password is incorrect'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => [
                'user_id' => $user->user_id,
                'name'    => $user->name,
                'email'   => $user->email,
                'role'    => $user->role,
                'must_change_password' => (bool) $user->must_change_password,
            ]
        ]);
    }

    // Revoke the current Sanctum token so a logout actually invalidates it
    // server-side, not just clears local state on the frontend.
    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()->delete();

        return response()->json(['success' => true, 'message' => 'Logged out.']);
    }

    

    // Handle Registration
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email', // Remove 'unique:users' here, we check it later
            'password' => 'required|min:8',
            'phone' => 'required',
        ]);

        // Check if user already exists in the real database
        if (User::where('email', $request->email)->exists()) {
            return response()->json(['message' => 'Email already registered.'], 422);
        }

        $code = (string) rand(100000, 999999);

        // STORE IN CACHE (Temporary storage, not Database)
        \Illuminate\Support\Facades\Cache::put('pending_reg_' . $request->email, [
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'verification_code' => $code
        ], now()->addMinutes(15)); // Expires in 15 mins

        Mail::to($request->email)->send(new VerifyEmailMail($code));

        return response()->json([
            'success' => true,
            'message' => 'Verification code sent to your email.'
        ]);
    }

    public function verifyEmail(Request $request)
    {
        $pendingData = \Illuminate\Support\Facades\Cache::get('pending_reg_' . $request->email);

        if (!$pendingData) {
            return response()->json(['success' => false, 'message' => 'Code expired or invalid.'], 400);
        }

        if ((string)$pendingData['verification_code'] === (string)$request->code) {
            // CODE IS CORRECT - NOW SAVE TO DB
            $user = User::create([
                'name' => $pendingData['name'],
                'email' => $pendingData['email'],
                'password' => $pendingData['password'],
                'phone' => $pendingData['phone'],
                'email_verified_at' => now(),
            ]);

            \Illuminate\Support\Facades\Cache::forget('pending_reg_' . $request->email);

            return response()->json(['success' => true, 'message' => 'Account created!'], 200);
        }

        return response()->json(['success' => false, 'message' => 'Invalid code'], 400);
    }

    public function resendCode(Request $request)
    {
        // Look in Cache, not the Database
        $pendingData = \Illuminate\Support\Facades\Cache::get('pending_reg_' . $request->email);

        if (!$pendingData) {
            return response()->json(['message' => 'No pending registration found for this email.'], 404);
        }

        // Generate new code
        $newCode = (string) rand(100000, 999999);
        $pendingData['verification_code'] = $newCode;

        // Update the Cache
        \Illuminate\Support\Facades\Cache::put('pending_reg_' . $request->email, $pendingData, now()->addMinutes(15));

        // Send the new code
        Mail::to($request->email)->send(new VerifyEmailMail($newCode));

        return response()->json(['success' => true, 'message' => 'New code sent!']);
    }
}
