<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class RoomLayoutController extends Controller
{
    /**
     * GET /api/rooms/layout?floor=2
     */
    public function getLayout(Request $request)
    {
        $floor = $request->query('floor', '2');

        $rooms = Room::with('roomType')
            ->where('floor', $floor)
            ->get()
            ->map(fn($room) => [
                'id'              => 'r-' . $room->room_number,
                'roomNumber'      => $room->room_number,
                'type'            => $room->roomType->code ?? 'SUP',
                'status'          => $room->status,
                'bedType'         => $room->bed_type,
                'extraPersonRate' => $room->extra_person_rate,
                'col'             => (int) $room->grid_col,
                'row'             => (int) $room->grid_row,
                'w'               => (int) $room->grid_w,
                'h'               => (int) $room->grid_h,
            ]);

        return response()->json([
            'success' => true,
            'floor'   => $floor,
            'rooms'   => $rooms,
        ]);
    }

    /**
     * POST /api/rooms/layout
     */
    public function saveLayout(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'floor'                   => 'required|string',
            'rooms'                   => 'required|array',
            'rooms.*.roomNumber'      => 'required|string|max:10',
            'rooms.*.type'            => 'required|string|in:SUP,DS,JS,PRES',
            'rooms.*.status'          => 'required|string|in:Available,Occupied,Cleaning,Reserved,Maintenance',
            'rooms.*.col'             => 'required|integer|min:1',
            'rooms.*.row'             => 'required|integer|min:1',
            'rooms.*.w'               => 'required|integer|min:1|max:6',
            'rooms.*.h'               => 'required|integer|min:1|max:6',
            'rooms.*.bedType'         => 'nullable|string|max:50',
            'rooms.*.extraPersonRate' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        $typeMap = RoomType::all()->keyBy('code');

        DB::beginTransaction();
        try {
            $floor        = $request->floor;
            $incomingNums = collect($request->rooms)->pluck('roomNumber')->toArray();

            // Delete rooms removed from the editor
            Room::where('floor', $floor)
                ->whereNotIn('room_number', $incomingNums)
                ->delete();

            // Insert or update each room
            foreach ($request->rooms as $data) {
                $roomType = $typeMap->get($data['type']);

                if (!$roomType) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => "Room type '{$data['type']}' not found. Run: php artisan db:seed --class=RoomTypeSeeder",
                    ], 422);
                }

                Room::updateOrCreate(
                    ['room_number' => $data['roomNumber']],
                    [
                        'room_type_id'      => $roomType->room_type_id,
                        'floor'             => $floor,
                        'status'            => $data['status'],
                        'bed_type'          => $data['bedType']         ?? 'Single',
                        'extra_person_rate' => $data['extraPersonRate'] ?? 0,
                        'grid_col'          => $data['col'],
                        'grid_row'          => $data['row'],
                        'grid_w'            => $data['w'],
                        'grid_h'            => $data['h'],
                    ]
                );
            }

            // Sync num_of_rooms in room_types
            foreach ($typeMap as $type) {
                $count = Room::where('room_type_id', $type->room_type_id)->count();
                $type->update(['num_of_rooms' => $count]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Floor {$floor} layout saved successfully.",
                'count'   => count($request->rooms),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Save failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}