<?php

namespace App\Http\Controllers;

use App\Models\User; // User Model ကို သုံးနိုင်ဖို့ import လုပ်ထားတာပါ
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // User အားလုံးကို list ပြန်ထုတ်ပေးဖို့ (React ဘက်က table မှာ ပြချင်ရင် သုံးနိုင်ပါတယ်)
        $users = User::all();
        return response()->json($users, 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // API အတွက်မို့လို့ ဒါက သုံးစရာမလိုပါဘူး (React ဘက်က component က ကိုင်တွယ်တာမို့လို့ပါ)
    }

    /**
     * Store a newly created resource in storage.
     * (React UI ကနေ Save User နှိပ်လိုက်ရင် ဒီနေရာကို ရောက်လာမှာပါ)
     */
    public function store(StoreUserRequest $request)
    {
        // Assign the real password chosen by the admin/manager — the User
        // model's 'password' => 'hashed' cast hashes it automatically on
        // save, so no manual bcrypt()/Hash::make() call is needed.
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => $request->role,
            'status' => $request->status,
            'password' => $request->password,
            // The admin/manager chose this password on the new user's
            // behalf — force them to set their own on first login.
            'must_change_password' => true,
        ]);

        // ၃။ အောင်မြင်ကြောင်း React ဘက်ကို json ပြန်ပို့ပေးပါမယ်
        return response()->json([
            'message' => 'User created successfully',
            'user' => $user
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user, 200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        // API အတွက်မို့လို့ ဒါလည်း သုံးစရာမလိုပါဘူး
    }

    /**
     * Update the specified resource in storage.
     * (User Data ကို ပြန်ပြင်ချင်တဲ့အခါ သုံးဖို့ပါ)
     */
    public function update(UpdateUserRequest $request, string $id)
    {
        // 1. ဒေတာဘေ့စ်ထဲမှာ အသုံးပြုသူ ရှိမရှိ အရင်ရှာမယ်
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // 2. Database မှာ Update လုပ်ခြင်း
        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => $request->role,
            'status' => $request->status,
        ];

        if ($request->filled('password')) {
            $updateData['password'] = $request->password; // hashed automatically by the model cast
            // Admin/manager set this password on the user's behalf, not the
            // user themselves — force a change again.
            $updateData['must_change_password'] = true;
        }

        $user->update($updateData);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user
        ], 200);
    }
    /**
     * Remove the specified resource from storage.
     * (User ကို ဖျက်ချင်တဲ့အခါ သုံးဖို့ပါ)
     */
    public function destroy(string $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Universal rule: admin accounts can never be deleted, by anyone —
        // not by another admin, not by a manager. Checked against the
        // TARGET row's role, independent of who's making the request.
        if (strtolower((string) $user->role) === 'admin') {
            return response()->json([
                'message' => 'Admin accounts cannot be deleted.',
            ], 403);
        }

        // Database ကနေ Delete လုပ်ခြင်း
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ], 200);
    }
}