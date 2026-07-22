<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Guest;
use App\Models\Reservation;
use App\Models\ReservationGuest;
use App\Support\IdNumberOverlapChecker;
use App\Support\ValidationPatterns;
use Illuminate\Http\Request;

class GuestController extends Controller
{
    public function index(Request $request)
    {
        $query = Guest::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('nationality')) {
            $query->where('nationality', $request->nationality);
        }

        if ($request->filled('id_type')) {
            $query->where('id_type', $request->id_type);
        }

        if ($request->filled('vip')) {
            $query->where('is_vip', $request->vip === 'true' || $request->vip === '1');
        }

        $guests = $query->orderByDesc('guest_id')->get();

        return response()->json($guests);
    }

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
            'firstName'   => ['required', 'string', 'max:255', 'regex:' . ValidationPatterns::NAME],
            'lastName'    => ['required', 'string', 'max:255', 'regex:' . ValidationPatterns::NAME],
            'phone'       => ['nullable', 'string', 'max:50', 'regex:' . ValidationPatterns::PHONE],
            'email'       => ['nullable', 'string', 'email:rfc', 'max:255'],
            'nationality' => ['nullable', 'string', 'max:100', 'regex:' . ValidationPatterns::NATIONALITY],
            'gender'      => ['nullable', 'in:Male,Female,Other'],
            'idType'      => ['required', 'string', 'in:Passport,NRC,Driver\'s License,National ID'],
            'idNumber'    => ['required', 'string', 'max:100', ValidationPatterns::idNumberRule($request->input('idType', ''))],
            'idFront'     => ['nullable', 'file', 'image', 'max:5120'],
            'idBack'      => ['nullable', 'file', 'image', 'max:5120'],
            'isVip'       => ['nullable', 'boolean'],
        ], [
            'idNumber.regex' => match ($request->input('idType')) {
                'NRC' => 'Invalid NRC format. Please select region, township, type, and enter exactly 6 digits.',
                'Passport' => 'Invalid Passport format. Must be 6 to 12 alphanumeric characters with no spaces or symbols.',
                default => 'The ID number format is invalid.',
            },
        ]);

        $guestData = [
            'first_name'  => $validated['firstName'],
            'last_name'   => $validated['lastName'],
            'phone'       => $validated['phone'],
            'email'       => $validated['email'] ?? null,
            'nationality' => $validated['nationality'] ?? null,
            'gender'      => $validated['gender'] ?? null,
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
     * Correct guest details while checking a reservation in (name, phone,
     * ID, etc. may have been mistyped originally, or a guest's own details
     * genuinely change). Only the fields provided are updated.
     */
    public function update(Request $request, $id)
    {
        $guest = Guest::findOrFail($id);

        $validated = $request->validate([
            'firstName'   => ['sometimes', 'string', 'max:255', 'regex:' . ValidationPatterns::NAME],
            'lastName'    => ['sometimes', 'string', 'max:255', 'regex:' . ValidationPatterns::NAME],
            'phone'       => ['sometimes', 'string', 'max:50', 'regex:' . ValidationPatterns::PHONE],
            'email'       => ['nullable', 'string', 'email:rfc', 'max:255'],
            'nationality' => ['nullable', 'string', 'max:100', 'regex:' . ValidationPatterns::NATIONALITY],
            'gender'      => ['nullable', 'in:Male,Female,Other'],
            'idType'      => ['sometimes', 'string', 'in:Passport,NRC,Driver\'s License,National ID'],
            'idNumber'    => ['sometimes', 'string', 'max:100', ValidationPatterns::idNumberRule($request->input('idType', $guest->id_type))],
            'isVip'       => ['nullable', 'boolean'],
        ], [
            'idNumber.regex' => match ($request->input('idType', $guest->id_type)) {
                'NRC' => 'Invalid NRC format. Please select region, township, type, and enter exactly 6 digits.',
                'Passport' => 'Invalid Passport format. Must be 6 to 12 alphanumeric characters with no spaces or symbols.',
                default => 'The ID number format is invalid.',
            },
        ]);

        if (array_key_exists('idNumber', $validated) && $validated['idNumber'] !== $guest->id_number) {
            $activeReservationIds = Reservation::where(function ($q) use ($guest) {
                    $q->where('guest_id', $guest->guest_id)
                      ->orWhereHas('additionalGuests', fn ($q2) => $q2->where('guest_id', $guest->guest_id));
                })
                ->where('reservation_status', '!=', 'Moved')
                ->get(['reservation_id', 'check_in_date', 'check_out_date']);

            foreach ($activeReservationIds as $res) {
                if (IdNumberOverlapChecker::hasConflict($validated['idNumber'], $res->check_in_date, $res->check_out_date, $res->reservation_id)) {
                    return response()->json([
                        'message' => 'This Identification Document Number is already used on another reservation that overlaps these dates.',
                    ], 422);
                }
            }
        }

        $map = [
            'firstName'   => 'first_name',
            'lastName'    => 'last_name',
            'phone'       => 'phone',
            'email'       => 'email',
            'nationality' => 'nationality',
            'gender'      => 'gender',
            'idType'      => 'id_type',
            'idNumber'    => 'id_number',
        ];

        $update = [];
        foreach ($map as $key => $column) {
            if (array_key_exists($key, $validated)) {
                $update[$column] = $validated[$key];
            }
        }
        if (array_key_exists('isVip', $validated)) {
            $update['is_vip'] = $request->boolean('isVip');
        }

        $guest->update($update);

        return response()->json(['guest' => $guest]);
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