<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class ProfileController extends Controller
{
    public function update(Request $request)
    {

        // Debugging line:
        if (!$request->user()) {
            return response()->json(['message' => 'User is not authenticated!'], 401);
        }
        // 1. Validate only the profile fields
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $request->user()->id,
            'old_password' => 'nullable',
            'new_password' => 'nullable|min:8',
        ]);

        // 2. Get the authenticated user directly
        $user = $request->user();

        // 3. Handle password change
        if ($request->old_password) {
            if (!Hash::check($request->old_password, $user->password)) {
                return response()->json(['message' => 'Old password incorrect'], 400);
            }
            $user->password = Hash::make($request->new_password);
        }

        // 4. Update fields
        $user->name = $request->name;
        $user->email = $request->email;
        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }
}
