<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoomController extends Controller
{
    
    public function index()
    {
        return response()->json(Room::orderBy('room_number', 'asc')->get(), 200);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
    'room_number'       => 'required|string|max:10|unique:rooms,room_number', 
    'room_type_id'      => 'required', 
    
    'floor'             => 'required|string',
    'capacity'          => 'required|integer|min:1',
    'bed_type'          => 'required|string',
    'extra_person_rate' => 'required|numeric|min:0',
    'status'            => 'required|string',
]);

        $room = Room::create($validatedData);

        return response()->json([
            'message' => 'Room asset created successfully!',
            'room'    => $room
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $room = Room::where('room_number', $id)->firstOrFail();

        $validatedData = $request->validate([

    'room_number'       => 'required|string|max:10|unique:rooms,room_number', 
    'room_type_id'      => 'required', 
    
    'floor'             => 'required|string',
    'capacity'          => 'required|integer|min:1',
    'bed_type'          => 'required|string',
    'extra_person_rate' => 'required|numeric|min:0',
    'status'            => 'required|string',
]);

        $room->update($validatedData);

        return response()->json([
            'message' => 'Room updated successfully!',
            'room'    => $room
        ], 200);
    }

    public function destroy($id)
    {
        $room = Room::where('room_number', $id)->firstOrFail();
        $room->delete();

        return response()->json([
            'message' => 'Room asset purged successfully from database inventory.'
        ], 200);
    }

    public function toggleStatus(Request $request, $room_number)
{
    $room = Room::where('room_number', $room_number)->firstOrFail();
    
    $request->validate([
        'status' => 'required|string'
    ]);

    $room->update([
        'status' => $request->status
    ]);

    return response()->json(['message' => 'Status updated successfully', 'room' => $room], 200);
}
}