<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RoomType;

class RoomTypeController extends Controller
{
    public function index()
    {
        $roomTypes = RoomType::all();
        return response()->json($roomTypes, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'       => 'required|string|max:255',
            'numOfRooms' => 'required|integer|min:1',
            'base_price' => 'required|numeric|min:0',
            'capacity'   => 'required|integer|min:1',
            'breakfast'  => 'required|boolean',
            'bathtub'    => 'required|boolean',
        ]);

        // Map frontend field names → database column names
        $roomType = RoomType::create([
            'name'         => $request->name,
            'num_of_rooms' => $request->numOfRooms,  
            'base_price'   => $request->base_price,
            'capacity'     => $request->capacity,
            'breakfast'    => $request->breakfast,
            'bathtub'      => $request->bathtub,
            'status'       => 'Active',
            'code'         => 'SUP'
        ]);

        return response()->json([
            'message' => 'Room Type created successfully!',
            'data'    => $roomType,
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $roomType = RoomType::findOrFail($id);

        $request->validate([
            'name'       => 'required|string|max:255',
            'numOfRooms' => 'required|integer|min:1',
            'base_price' => 'required|numeric|min:0',
            'capacity'   => 'required|integer|min:1',
            'breakfast'  => 'required|boolean',
            'bathtub'    => 'required|boolean',
        ]);

        // Map frontend field names → database column names
        $roomType->update([
            'name'         => $request->name,
            'num_of_rooms' => $request->numOfRooms,  // numOfRooms → num_of_rooms
            'base_price'   => $request->base_price,
            'capacity'     => $request->capacity,
            'breakfast'    => $request->breakfast,
            'bathtub'      => $request->bathtub,
        ]);

        return response()->json([
            'message' => 'Room Type updated successfully!',
            'data'    => $roomType,
        ], 200);
    }

    public function toggleStatus(Request $request, int $id)
    {
        $roomType = RoomType::findOrFail($id);
        $roomType->update(['status' => $request->input('status')]);

        return response()->json([
            'message' => 'Status updated successfully!',
            'status'  => $roomType->status,
        ], 200);
    }

    public function destroy(int $id)
    {
        $roomType = RoomType::findOrFail($id);
        $roomType->delete();

        return response()->json([
            'message' => 'Room Type deleted successfully.',
        ], 200);
    }
}
