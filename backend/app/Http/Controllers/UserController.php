<?php

namespace App\Http\Controllers;

use App\Models\User; // User Model ကို သုံးနိုင်ဖို့ import လုပ်ထားတာပါ
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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
    public function store(Request $request)
    {
        // ၁။ React ကနေ ပို့လိုက်တဲ့ data တွေကို စစ်ဆေး (Validate) ပါမယ်
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users', // email မတူအောင် စစ်ထားပါတယ်
            'phone' => 'nullable|string|max:20',
            'role' => 'required|string',
            'status' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // ၂။ Database ထဲကို Insert (Create) လုပ်ပါမယ်
        // မှတ်ချက် - password ကို password_hash() သို့မဟုတ် ဒီတိုင်း default တစ်ခုခု သတ်မှတ်ပေးရပါမယ်
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => $request->role,
            'status' => $request->status,
            'password' => bcrypt('password123') // Default password တစ်ခု သတ်မှတ်ပေးထားခြင်း
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
    public function update(Request $request, string $id)
    {
        // 1. ဒေတာဘေ့စ်ထဲမှာ အသုံးပြုသူ ရှိမရှိ အရင်ရှာမယ်
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // 2. Data တွေကို စစ်ဆေးပါမယ်
        // ပြင်ဆင်ချက် - unique rule ရဲ့ နောက်ဆုံးမှာ ဒေတာဘေ့စ် primary key ဖြစ်တဲ့ 'user_id' ကို အတိအကျ ထည့်ပေးလိုက်တာပါ
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id . ',user_id',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|string',
            'status' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 3. Database မှာ Update လုပ်ခြင်း
        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => $request->role,
            'status' => $request->status,
        ]);

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

        // Database ကနေ Delete လုပ်ခြင်း
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ], 200);
    }
}