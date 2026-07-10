<?php
// app/Http/Controllers/Api/ReservationGuestController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Guest;
use App\Models\Reservation;
use App\Models\ReservationGuest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReservationGuestController extends Controller
{
    public function index($reservationId)
    {
        $reservation = Reservation::findOrFail($reservationId);
        return response()->json([
            'guests' => $reservation->additionalGuests()->with('guest')->get(),
        ]);
    }

    public function store(Request $request, $reservationId)
    {
        $reservation = Reservation::findOrFail($reservationId);

        $validated = $request->validate([
            'guestId'     => 'nullable|integer|exists:guests,guest_id',
            'guestType'   => 'nullable|in:Adult,Child',
            'firstName'   => 'required_without:guestId|string|max:255',
            'lastName'    => 'required_without:guestId|string|max:255',
            'phone'       => 'required_without:guestId|string|max:50',
            'email'       => 'nullable|email|max:255',
            'nationality' => 'nullable|string|max:255',
            'gender'      => 'nullable|in:Male,Female,Other',
            'idType'      => 'required_without:guestId|string|max:50',
            'idNumber'    => 'required_without:guestId|string|max:100',
            'idFront'     => 'nullable|file|image|max:5120',
            'idBack'      => 'nullable|file|image|max:5120',
        ]);

        try {
            $result = DB::transaction(function () use ($validated, $request, $reservation) {
                if (!empty($validated['guestId'])) {
                    $guest = Guest::findOrFail($validated['guestId']);
                    $guestCreated = false;
                } else {
                    $guestData = [
                        'first_name'  => $validated['firstName'],
                        'last_name'   => $validated['lastName'],
                        'phone'       => $validated['phone'],
                        'email'       => $validated['email'] ?? null,
                        'nationality' => $validated['nationality'] ?? null,
                        'gender'      => $validated['gender'] ?? null,
                        'id_type'     => $validated['idType'],
                        'id_number'   => $validated['idNumber'],
                        'is_vip'      => false,
                    ];
                    if ($request->hasFile('idFront')) {
                        $guestData['id_front_path'] = $request->file('idFront')->store('guest-ids', 'public');
                    }
                    if ($request->hasFile('idBack')) {
                        $guestData['id_back_path'] = $request->file('idBack')->store('guest-ids', 'public');
                    }
                    $guest = Guest::create($guestData);
                    $guestCreated = true;
                }

                if ($reservation->guest_id == $guest->guest_id) {
                    throw new \RuntimeException('This guest is already the primary guest on this reservation.');
                }

                $link = ReservationGuest::firstOrCreate(
                    ['reservation_id' => $reservation->reservation_id, 'guest_id' => $guest->guest_id],
                    ['guest_type' => $validated['guestType'] ?? 'Adult']
                );

                return ['guest' => $guest, 'link' => $link, 'guestCreated' => $guestCreated];
            });
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'guest'        => $result['guest'],
            'guestCreated' => $result['guestCreated'],
            'guestType'    => $result['link']->guest_type,
        ], 201);
    }

    public function destroy($reservationId, $guestId)
    {
        $reservation = Reservation::findOrFail($reservationId);

        $link = ReservationGuest::where('reservation_id', $reservation->reservation_id)
            ->where('guest_id', $guestId)
            ->firstOrFail();

        $link->delete();

        return response()->json(['message' => 'Guest removed from reservation.']);
    }
}