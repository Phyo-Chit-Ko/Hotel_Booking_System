<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RoomType;

class RoomTypeController extends Controller
{
    // Add this method inside your RoomTypeController class
    public function index()
    {
        // Retrieve all entries from the MySQL room_types table
        $roomTypes = RoomType::all();
        
        return response()->json($roomTypes, 200);
    }

    public function store(Request $request)
    {
        
        $validatedData = $request->validate([
    'name' => 'required|string|max:255',
    'numOfRooms' => 'required|integer|min:1',
    'base_price' => 'required|numeric|min:0',
    'capacity' => 'required|integer|min:1',
    'breakfast' => 'required|boolean',
    'bathtub' => 'required|boolean',
    'status' => 'nullable|string', 
]);

if (!isset($validatedData['status'])) {
    $validatedData['status'] = 'Active';
}

        // 2. Insert the records directly into your phpMyAdmin table via the Eloquent model
        $roomType = RoomType::create($validatedData);

        // 3. Respond back to React with a 201 Created HTTP code
        return response()->json([
            'message' => 'Room Type created successfully in MySQL!',
            'data' => $roomType
        ], 201);
    }

    public function toggleStatus(Request $request, int $id)
{
    // Find the record using your newly mapped custom primary key
    $roomType = RoomType::findOrFail($id);
    
    // Perform the atomic data shift
    $roomType->update([
        'status' => $request->input('status')
    ]);

    return response()->json([
        'message' => 'Status updated successfully!',
        'status' => $roomType->status
    ], 200);
}

// Add these functions inside the RoomTypeController class body

public function update(Request $request, int $id)
{
    // Find the record using your newly mapped custom primary key
    $roomType = RoomType::findOrFail($id);

    // Validate modifications incoming streams payload integrity
    $validatedData = $request->validate([
        'name' => 'required|string|max:255',
        'numOfRooms' => 'required|integer|min:1',
        'base_price' => 'required|numeric|min:0',
        'capacity' => 'required|integer|min:1',
        'breakfast' => 'required|boolean',
        'bathtub' => 'required|boolean',
    ]);

    // Apply the fresh updates onto your model instance layout row
    $roomType->update($validatedData);

    return response()->json([
        'message' => 'Room Type modified successfully inside database repository!',
        'data' => $roomType
    ], 200);
}

public function destroy(int $id)
{
    // Target the specific row reference instance
    $roomType = RoomType::findOrFail($id);

    // Drop record execution query command safely
    $roomType->delete();

    return response()->json([
        'message' => 'Room Type successfully purged from primary database repository records.'
    ], 200);
}
}