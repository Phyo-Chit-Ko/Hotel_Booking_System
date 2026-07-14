<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RoomType;
use Illuminate\Support\Facades\Storage;

class RoomTypeController extends Controller
{
    public function index()
    {
        // num_of_rooms is computed live from the actual `rooms` table (via
        // withCount) rather than trusted as a stored/synced column, so it can
        // never drift stale no matter which controller creates/edits/deletes
        // a room.
        $roomTypes = RoomType::withCount(['rooms as num_of_rooms'])->get();
        return response()->json($roomTypes, 200);
    }

    public function show(int $id)
    {
        $roomType = RoomType::withCount(['rooms as num_of_rooms'])->findOrFail($id);
        return response()->json($roomType, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'              => 'required|string|max:255',
            'base_price'        => 'required|numeric|min:0',
            'extra_person_rate' => 'required|numeric|min:0',
            'capacity'          => 'required|integer|min:1',
            'breakfast'         => 'required|boolean',
            'bathtub'           => 'required|boolean',
            'image'             => 'nullable|file|image|max:5120',
        ]);

        // num_of_rooms is never set/synced here — RoomTypeController::index/show
        // always compute it live via withCount(), so it can't go stale.
        $roomType = RoomType::create([
            'name'              => $request->name,
            'base_price'        => $request->base_price,
            'extra_person_rate' => $request->extra_person_rate,
            'capacity'          => $request->capacity,
            'breakfast'         => $request->breakfast,
            'bathtub'           => $request->bathtub,
            'status'            => 'Active',
            'code'              => $request->code,
            'image'        => $request->hasFile('image')
                ? $request->file('image')->store('room-types', 'public')
                : null,
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
            'name'              => 'required|string|max:255',
            'base_price'        => 'required|numeric|min:0',
            'extra_person_rate' => 'required|numeric|min:0',
            'capacity'          => 'required|integer|min:1',
            'breakfast'         => 'required|boolean',
            'bathtub'           => 'required|boolean',
            'image'             => 'nullable|file|image|max:5120',
        ]);

        $imagePath = $roomType->image;
        if ($request->hasFile('image')) {
            if ($imagePath) {
                Storage::disk('public')->delete($imagePath);
            }
            $imagePath = $request->file('image')->store('room-types', 'public');
        }

        // num_of_rooms is intentionally left untouched — it's always computed
        // live via withCount() in index()/show(), never stored/synced here.
        $roomType->update([
            'name'              => $request->name,
            'base_price'        => $request->base_price,
            'extra_person_rate' => $request->extra_person_rate,
            'capacity'          => $request->capacity,
            'breakfast'         => $request->breakfast,
            'bathtub'           => $request->bathtub,
            'code'              => $request->code,
            'image'             => $imagePath,
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
        if ($roomType->image) {
            Storage::disk('public')->delete($roomType->image);
        }
        $roomType->delete();

        return response()->json([
            'message' => 'Room Type deleted successfully.',
        ], 200);
    }
}
