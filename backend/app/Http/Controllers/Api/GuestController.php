<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Guest;
use App\Models\Reservation;
use Illuminate\Http\Request;

class GuestController extends Controller
{
    public function search(Request $request)
    {
        $q = $request->query('q', '');

        $guests = Guest::where('first_name', 'like', "%{$q}%")
            ->orWhere('last_name', 'like', "%{$q}%")
            ->orWhere('phone', 'like', "%{$q}%")
            ->orWhere('email', 'like', "%{$q}%")
            ->limit(10)
            ->get();

        return response()->json(['guests' => $guests]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'firstName'   => 'required|string|max:255',
            'lastName'    => 'required|string|max:255',
            'phone'       => 'required|string|max:50',
            'email'       => 'nullable|email|max:255',
            'nationality' => 'nullable|string|max:255',
            'idType'      => 'required|string|max:50',
            'idNumber'    => 'required|string|max:100',
            'idFront'     => 'nullable|file|image|max:5120',
            'idBack'      => 'nullable|file|image|max:5120',
            'isVip'       => 'nullable|boolean',
        ]);

        $guestData = [
            'first_name'  => $validated['firstName'],
            'last_name'   => $validated['lastName'],
            'phone'       => $validated['phone'],
            'email'       => $validated['email'] ?? null,
            'nationality' => $validated['nationality'] ?? null,
            'id_type'     => $validated['idType'],
            'id_number'   => $validated['idNumber'],
            'is_vip'      => $request->boolean('isVip'),
        ];

        if ($request->hasFile('idFront')) {
            $guestData['id_front_path'] = $request->file('idFront')->store('guest-ids', 'public');
        }
        if ($request->hasFile('idBack')) {
            $guestData['id_back_path'] = $request->file('idBack')->store('guest-ids', 'public');
        }

        $guest = Guest::create($guestData);

        return response()->json(['guest' => $guest], 201);
    }

    /**
     * Roll back a guest that was created earlier in the multi-step
     * reservation flow but the user cancelled before finishing (payment
     * step). Deleting the guest cascades to any reservation created
     * against it (reservations.guest_id -> onDelete('cascade')), so a
     * single delete here cleans up both tables for the "new guest"
     * abandonment case.
     */
   public function destroy($id)
{
    $guest = Guest::where('guest_id', $id)->firstOrFail();

    $hasCompletedBooking = Reservation::where('guest_id', $guest->guest_id)
            ->whereHas('payments')->exists()
        || Reservation::whereHas('additionalGuests', fn ($q) => $q->where('guest_id', $guest->guest_id))
            ->whereHas('payments')->exists();

    if ($hasCompletedBooking) {
        return response()->json(['message' => 'Cannot delete a guest with a completed booking.'], 422);
    }

    $guest->delete();

    return response()->json(['message' => 'Guest deleted.']);
}
}
