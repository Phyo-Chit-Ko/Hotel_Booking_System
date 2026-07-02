<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        
        // 1. validate first
        $request->validate([
            'user_id' => 'required',
            'name' => 'required',
            'email' => 'required|email',
        ]);

        // 2. correct query (ONLY ONCE)
        $user = User::where('user_id', $request->user_id)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        // 3. password check (optional)
        if ($request->old_password) {
            if (!Hash::check($request->old_password, $user->password)) {
                return response()->json([
                    'message' => 'Old password incorrect'
                ], 400);
            }

            $user->password = Hash::make($request->new_password);
        }

        // 4. update fields
        $user->name = $request->name;
        $user->email = $request->email;

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }
}
