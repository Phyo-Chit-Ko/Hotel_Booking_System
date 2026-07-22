<?php
// app/Http/Controllers/Api/ReservationGuestController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Guest;
use App\Models\Reservation;
use App\Models\ReservationGuest;
use App\Support\IdNumberOverlapChecker;
use App\Support\ValidationPatterns;
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
        'guestId'     => ['nullable', 'integer', 'exists:guests,guest_id'],
        'guestType'   => ['nullable', 'in:Adult,Child'],
        'firstName'   => ['required_without:guestId', 'string', 'max:255', 'regex:' . ValidationPatterns::NAME],
        'lastName'    => ['required_without:guestId', 'string', 'max:255', 'regex:' . ValidationPatterns::NAME],
        'phone'       => ['nullable', 'string', 'max:50', 'regex:' . ValidationPatterns::PHONE],
        'email'       => ['nullable', 'string', 'email:rfc', 'max:255'],
        'nationality' => ['nullable', 'string', 'max:100', 'regex:' . ValidationPatterns::NATIONALITY],
        'gender'      => ['nullable', 'in:Male,Female,Other'],
        'idType'      => ['required_without:guestId', 'string', 'in:Passport,NRC,Driver\'s License,National ID'],
        'idNumber'    => ['required_without:guestId', 'string', 'max:100', ValidationPatterns::idNumberRule($request->input('idType', ''))],
        'idFront'     => ['nullable', 'file', 'image', 'max:5120'],
        'idBack'      => ['nullable', 'file', 'image', 'max:5120'],
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
                    'phone'       => $validated['phone'] ?? null,
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

            if ($guest->id_number && IdNumberOverlapChecker::hasConflict(
                $guest->id_number,
                $reservation->check_in_date,
                $reservation->check_out_date,
                $reservation->reservation_id
            )) {
                throw new \RuntimeException("This guest's Identification Document Number is already used on another reservation that overlaps these dates.");
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