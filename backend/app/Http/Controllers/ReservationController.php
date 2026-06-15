<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use App\Models\Reservation;
use App\Models\Room;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ReservationController extends Controller
{
    // public function storeWalkIn(Request $request)
    // {
    //     $validator = Validator::make($request->all(), [

    //         'first_name' => 'required|string|max:100',
    //         'last_name' => 'required|string|max:100',
    //         'email' => 'required|email|max:150',
    //         'phone' => 'required|string|max:30',

    //         'room_number' =>
    //             'required|exists:rooms,room_number',

    //         'room_type_id' =>
    //             'required|exists:room_types,room_type_id',

    //         'check_in_date' =>
    //             'required|date',

    //         'check_out_date' =>
    //             'required|date|after:check_in_date',

    //         'deposit_amount' =>
    //             'required|numeric|min:0',

    //         'reservation_status' =>
    //             'required|in:Confirmed,Pending',
    //     ]);

    //     if ($validator->fails()) {
    //         return response()->json([
    //             'status' => 'error',
    //             'errors' => $validator->errors()
    //         ], 422);
    //     }

    //     DB::beginTransaction();

    //     try {

    //         $room = Room::lockForUpdate()
    //             ->where(
    //                 'room_number',
    //                 $request->room_number
    //             )
    //             ->first();

    //         if (!$room) {
    //             throw new \Exception(
    //                 'Room not found.'
    //             );
    //         }

    //         if ($room->status !== 'Available') {
    //             return response()->json([
    //                 'status' => 'error',
    //                 'message' =>
    //                     'Selected room is not available.'
    //             ], 409);
    //         }

    //         $guest = Guest::firstOrCreate(
    //             [
    //                 'email' => $request->email
    //             ],
    //             [
    //                 'first_name' =>
    //                     $request->first_name,

    //                 'last_name' =>
    //                     $request->last_name,

    //                 'phone' =>
    //                     $request->phone,
    //             ]
    //         );

    //         $reservation = Reservation::create([

    //             'guest_id' =>
    //                 $guest->guest_id,

    //             'room_type_id' =>
    //                 $request->room_type_id,

    //             'room_number' =>
    //                 $room->room_number,

    //             'check_in_date' =>
    //                 $request->check_in_date,

    //             'check_out_date' =>
    //                 $request->check_out_date,

    //             'deposit_amount' =>
    //                 $request->deposit_amount,

    //             'reservation_status' =>
    //                 $request->reservation_status,

    //             'created_by' => 1,
    //         ]);

    //         $room->status = 'Occupied';
    //         $room->save();

    //         DB::commit();

    //         return response()->json([
    //             'status' => 'success',
    //             'message' =>
    //                 'Walk-in reservation created.',

    //             'reservation_id' =>
    //                 $reservation->reservation_id,
    //         ], 201);

    //     } catch (\Exception $e) {

    //         DB::rollBack();

    //         return response()->json([
    //             'status' => 'error',
    //             'message' => $e->getMessage()
    //         ], 500);
    //     }
    // }

    public function storeWalkIn(Request $request)
{
    dd($request->all());
}
}