<?php

namespace App\Http\Controllers;

use App\Models\User; 
use Illuminate\Http\Request; // Standard Request class ကို ပြောင်းသုံးထားပါတယ်

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::all();
        return response()->json($users, 200);
    }

    /**
     * Store a newly created resource in storage.
     * (Create Mode: အကောင့်အသစ်ဆောက်ချိန်)
     */
    public function store(Request $request)
    {
        // ဖိုင်တစ်ခုတည်းနဲ့ ပြီးအောင် Validation ကို ဒီမှာပဲ တန်းစစ်လိုက်ပါတယ်
        // password_confirmation စစ်တဲ့ 'confirmed' ကို ဖြုတ်ထားပြီးသားဖြစ်လို့ password တစ်ခုပဲ လိုပါတော့တယ်
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'phone'    => 'nullable|string|max:20',
            'role'     => 'required|string',
            'status'   => 'required|string',
            'password' => 'required|string|min:8', 
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => $request->role,
            'status' => $request->status,
            'password' => $request->password, // Model Cast ကနေ auto hash လုပ်ပေးမှာပါ
            'must_change_password' => true,
        ]);

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
     * Update the specified resource in storage.
     * (Edit Mode: အကောင့်အချက်အလက် ပြင်ချိန်)
     */
    public function update(Request $request, string $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Edit Mode အတွက် Validation ကိုလည်း ဒီမှာပဲ တစ်ခါတည်း စစ်ပါတယ်
        // password ကို 'nullable' ပေးထားလို့ အလွတ်ထားခဲ့ရင် error မတက်ပါဘူး (ထည့်ရင်တော့ ၈ လုံးပြည့်ရပါမယ်)
        $request->validate([
            'name'     => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id . ',user_id',
            'phone'    => 'nullable|string|max:20',
            'role'     => 'required|string',
            'status'   => 'required|string',
            'password' => 'nullable|string|min:8', 
        ]);

        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => $request->role,
            'status' => $request->status,
        ];

        // Frontend ကနေ Password အသစ် အမှန်တကယ် ရိုက်ထည့်ပြီး ပို့လာမှသာ Update လုပ်ပေးမှာပါ
        if ($request->filled('password')) {
            $updateData['password'] = $request->password; 
            $updateData['must_change_password'] = true;
        }

        $user->update($updateData);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user
        ], 200);
    }

    /**
     * Deactivate the specified staff account (kept for hotel record-keeping
     * constraints — never a hard delete). Admin accounts and registered
     * public "user" accounts can never be deactivated from this endpoint.
     */
    public function destroy(string $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $role = strtolower((string) $user->role);

        if ($role === 'admin') {
            return response()->json([
                'message' => 'Admin accounts cannot be deactivated.',
            ], 403);
        }

        if ($role === 'user') {
            return response()->json([
                'message' => 'Registered user accounts cannot be modified here.',
            ], 403);
        }

        $user->status = 'Inactive';
        $user->save();

        return response()->json([
            'message' => 'User deactivated successfully',
            'user' => $user,
        ], 200);
    }
}