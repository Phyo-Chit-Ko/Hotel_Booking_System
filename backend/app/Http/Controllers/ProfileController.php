<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use App\Models\User;

class ProfileController extends Controller
{
    public function update(Request $request)
    {

        // Debugging line:
        if (!$request->user()) {
            return response()->json(['message' => 'User is not authenticated!'], 401);
        }
        // 1. Validate only the profile fields.
        // NOTE: this model's primary key is `user_id`, not the Eloquent
        // default `id` — using ->id here silently produced a blank "ignore"
        // value, making the uniqueness check fragile. Use Rule::unique()
        // ->ignore() with the real key, matching RoomController::update.
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($request->user()->user_id, 'user_id')],
            'old_password' => 'nullable',
            'new_password' => ['nullable', Password::min(8)->mixedCase()->numbers()->symbols()],
        ]);

        // 2. Get the authenticated user directly
        $user = $request->user();

        // 3. Handle password change
        if ($request->old_password) {
            if (!Hash::check($request->old_password, $user->password)) {
                return response()->json(['message' => 'Old password incorrect'], 400);
            }
            $user->password = Hash::make($request->new_password);
            // Whether this is the forced first-login change or a voluntary
            // Settings-page change, once a user sets their own password
            // they're no longer in a "must change" state.
            $user->must_change_password = false;
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
