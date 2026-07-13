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
     * Used by the reservation form to pull room type, floor, bed type, and rate,
     * and by the Room Management "eye" icon detail modal — which additionally
     * needs to know who's currently staying in the room when it's occupied.
     */
    public function show(string $roomNumber)
    {
        $room = Room::with('roomType')->where('room_number', $roomNumber)->first();

        if (!$room) {
            return response()->json(['message' => 'Room not found'], 404);
        }

        $currentStay = null;
        if ($room->status === 'Occupied') {
            $reservation = Reservation::with('guest')
                ->where('room_number', $roomNumber)
                ->where('reservation_status', 'Checked-In')
                ->latest('check_in_date')
                ->first();

            if ($reservation) {
                $currentStay = [
                    'reservation_id' => $reservation->reservation_id,
                    'guest_name'     => $reservation->guest?->full_name ?? $reservation->guest_name,
                    'check_in_date'  => $reservation->check_in_date,
                    'check_out_date' => $reservation->check_out_date,
                ];
            }
        }

        return response()->json(['room' => $room, 'current_stay' => $currentStay]);
    }

    /**
     * GET /api/rooms/{roomNumber}/active-reservation
     * Used by the Extra Charges form to resolve a room number to the guest
     * currently checked into it, so staff no longer need to type a raw
     * reservation ID by hand.
     */
    public function activeReservation(string $roomNumber)
    {
        $reservation = Reservation::with('guest')
            ->where('room_number', $roomNumber)
            ->where('reservation_status', 'Checked-In')
            ->latest('reservation_id')
            ->first();

        if (!$reservation) {
            return response()->json(['message' => 'No in-house guest found for this room.'], 404);
        }

        return response()->json([
            'reservation_id' => $reservation->reservation_id,
            'guest_name'     => $reservation->guest?->full_name ?? $reservation->guest_name,
            'room_number'    => $roomNumber,
        ]);
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
            'room_type_id'      => 'required|integer|exists:room_types,room_type_id',
            'floor'             => 'required|string',
            'capacity'          => 'required|integer|min:1',
            'bed_type'          => 'required|string',
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
            'room_type_id'      => 'required|integer|exists:room_types,room_type_id',
            'floor'             => 'required|string',
            'capacity'          => 'required|integer|min:1',
            'bed_type'          => 'required|string',
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