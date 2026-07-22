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
    // 1. Define Validation Rules
    $rules = [
        'name'     => 'required|string|max:255',
        'email'    => 'required|string|email|max:255|unique:users',
        'phone'    => 'required|string|regex:/^09\d{7,9}$/',
        'role'     => 'required|string',
        'status'   => 'required|string',
        'password' => 'required|string|min:8', 
    ];

    // 2. Define Custom Messages
    $messages = [
        'name.required'     => 'Please enter the user name.',
        'email.required'    => 'Please enter an email address.',
        'email.email'       => 'Please enter a valid email address.',
        'email.unique'      => 'This email address is already registered.',
        
        // Custom message for the phone regex format error
        'phone.required'    => 'Please enter a phone number.',
        'phone.regex'       => 'Phone number must start with "09" followed by 7 to 9 digits (e.g., 09123456789).',
        
        'role.required'     => 'Please select a user role.',
        'status.required'   => 'Please select a status.',
        'password.required' => 'Please enter a password.',
        'password.min'      => 'Password must be at least 8 characters long.',
    ];

    // 3. Pass rules and custom messages into validate()
    $request->validate($rules, $messages);

    $user = User::create([
        'name'                 => $request->name,
        'email'                => $request->email,
        'phone'                => $request->phone,
        'role'                 => $request->role,
        'status'               => $request->status,
        'password'             => $request->password, // Model casting handles auto-hashing
        'must_change_password' => true,
    ]);

    return response()->json([
        'message' => 'User created successfully',
        'user'    => $user
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
            'phone' => 'required|string|regex:/^09\d{7,9}$/',
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