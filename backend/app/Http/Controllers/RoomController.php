<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoomController extends Controller
{
    public function index()
    {
        return response()->json(Room::orderBy('room_number', 'asc')->get(), 200);
    }

    /**
     * GET /api/rooms/{roomNumber}
     * Used by the reservation form to pull room type, floor, bed type, and rate.
     */
    public function show(string $roomNumber)
    {
        $room = Room::with('roomType')->where('room_number', $roomNumber)->first();

        if (!$room) {
            return response()->json(['message' => 'Room not found'], 404);
        }

        return response()->json(['room' => $room]);
    }

    /**
     * GET /api/rooms/available?check_in=YYYY-MM-DD&check_out=YYYY-MM-DD
     * Returns rooms with no overlapping reservation in that date range.
     */
    public function available(Request $request)
    {
        $request->validate([
            'check_in'  => 'required|date',
            'check_out' => 'required|date|after:check_in',
        ]);

        $checkIn  = $request->query('check_in');
        $checkOut = $request->query('check_out');

        $bookedRoomNumbers = Reservation::where(function ($q) use ($checkIn, $checkOut) {
                $q->where('check_in_date', '<', $checkOut)
                  ->where('check_out_date', '>', $checkIn);
            })
            ->whereIn('reservation_status', ['Reserved', 'Confirmed', 'Checked-In'])
            ->pluck('room_number');

        $rooms = Room::with('roomType')
            ->whereNotIn('room_number', $bookedRoomNumbers)
            ->where('status', '!=', 'maintenance') // adjust to match your actual status values
            ->get();

        return response()->json(['rooms' => $rooms]);
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
            // ignore this room's own current number so updating without changing it doesn't fail "unique"
            'room_number'       => ['required', 'string', 'max:10', Rule::unique('rooms', 'room_number')->ignore($room->room_number, 'room_number')],
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