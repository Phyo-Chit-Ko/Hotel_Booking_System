<?php

namespace App\Http\Controllers;

use App\Mail\BookingCancelledMail;
use App\Mail\BookingConfirmedMail;
use App\Models\Booking;
use App\Models\BookingRoomAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\Reservation;
use App\Models\ReservationCharge;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with(['roomType', 'handledBy']);

        // Search by booking number, guest name, or email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('booking_id', 'like', "%{$search}%")
                  ->orWhere('booking_number', 'like', "%{$search}%")
                  ->orWhere('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status. 'confirmed' also matches 'converted' — a
        // converted booking is still a confirmed one, just further along
        // (it now has a linked Reservation too).
        if ($request->filled('status') && $request->status !== 'All Status') {
            $statusValue = strtolower($request->status);
            if ($statusValue === 'confirmed') {
                $query->whereIn('status', ['confirmed', 'converted']);
            } else {
                $query->where('status', $statusValue);
            }
        }

        // Filter by check-in date
        if ($request->filled('date')) {
            $query->whereDate('check_in_date', $request->date);
        }

        $bookings = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'data' => $bookings->map(function ($b) {
                return [
                    'id'                 => $b->booking_number,
                    'raw_id'             => $b->booking_id,
                    'first_name'         => $b->first_name,
                    'last_name'          => $b->last_name,
                    'email'              => $b->email,
                    'phone'              => $b->phone,
                    'roomType'           => $b->roomType->name ?? 'N/A',
                    'room_type_id'       => $b->room_type_id,
                    'roomNumber'         => $b->room_number,
                    'total_room'         => $b->total_room,
                    'adult'              => $b->adult,
                    'child'              => $b->child,
                    'checkIn'            => $b->check_in_date ? $b->check_in_date->format('Y-m-d') : null,
                    'checkOut'           => $b->check_out_date ? $b->check_out_date->format('Y-m-d') : null,
                    'amount'             => (float) $b->deposit,
                    'depositScreenshot'  => $b->deposit_screenshot
                        ? Storage::disk('public')->url($b->deposit_screenshot)
                        : null,
                    // Display label collapses 'converted' into 'Confirmed' —
                    // guests/staff don't need a third status word for what
                    // is still, from their perspective, a confirmed booking.
                    // rawStatus keeps the real value so the UI can still
                    // tell converted bookings apart (e.g. to link to their
                    // Reservation instead of allowing further edits).
                    'status'             => $b->status === 'converted' ? 'Confirmed' : ucfirst($b->status),
                    'rawStatus'          => $b->status,
                    'reservationId'  => $b->reservation_id,
                    'handledBy'          => $b->handledBy?->name,
                ];
            }),
            'stats' => [
                'total'     => Booking::count(),
                'confirmed' => Booking::whereIn('status', ['confirmed', 'converted'])->count(),
                'pending'   => Booking::where('status', 'pending')->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id'             => 'required|exists:users,user_id',
            'room_type_id'        => 'required|exists:room_types,room_type_id',
            'first_name'          => 'required|string|max:255',
            'last_name'           => 'required|string|max:255',
            'email'               => 'required|email|max:255',
            'phone'               => 'required|string|max:30',
            'bed_preference'      => 'nullable|string',
            'check_in_date'       => 'required|date',
            'check_out_date'      => 'required|date|after:check_in_date',
            'total_room'          => 'required|integer|min:1',
            'adult'               => 'required|integer|min:1',
            'child'               => 'nullable|integer|min:0',
            'special_requests'    => 'nullable|string',
            'payment_method'      => 'required|in:K-Pay,Bank',
            'payment_screenshot'  => 'required|image|max:5120',
        ]);

        $roomType = RoomType::findOrFail($validated['room_type_id']);
        $totalRooms = (int) $validated['total_room'];
        $totalGuests = (int) $validated['adult'] + (int) ($validated['child'] ?? 0);
        $maxForParty = $totalRooms * (int) $roomType->maximum_capacity;

        if ($totalGuests > $maxForParty) {
            $message = $totalRooms === 1
                ? "Total person is more than room's maximum capacity, please choose more than 1 (total rooms) room or reduce total guests."
                : "Total guests ({$totalGuests}) exceed the combined maximum capacity ({$maxForParty}) for {$totalRooms} rooms. Please add more rooms or reduce guests.";

            return response()->json(['message' => $message], 422);
        }

        $nights = max(1, Carbon::parse($validated['check_in_date'])->diffInDays(Carbon::parse($validated['check_out_date'])));
        $deposit = round(($totalRooms * (float) $roomType->base_price * $nights) / 2, 2);

        $screenshotPath = $request->file('payment_screenshot')
            ->store('deposit_screenshots', 'public');

        $booking = DB::transaction(function () use ($validated, $screenshotPath, $deposit) {
            $booking = Booking::create([
                'user_id'             => $validated['user_id'],
                'room_type_id'        => $validated['room_type_id'],
                'first_name'          => $validated['first_name'],
                'last_name'           => $validated['last_name'],
                'email'               => $validated['email'],
                'phone'               => $validated['phone'],
                'bed_preference'      => $validated['bed_preference'] ?? null,
                'check_in_date'       => $validated['check_in_date'],
                'check_out_date'      => $validated['check_out_date'],
                'total_room'          => $validated['total_room'],
                'adult'               => $validated['adult'],
                'child'               => $validated['child'] ?? 0,
                'deposit'             => $deposit,
                'deposit_screenshot'  => $screenshotPath,
                'payment_method'      => $validated['payment_method'],
                'special_requests'    => $validated['special_requests'] ?? null,
                'status'              => 'pending',
            ]);

            $booking->booking_number = 'BK-' . str_pad((string) $booking->booking_id, 5, '0', STR_PAD_LEFT);
            $booking->save();

            return $booking;
        });

        return response()->json([
            'message' => 'Booking created successfully.',
            'booking' => $booking,
        ], 201);
    }

    /**
     * PUT /api/bookings/{id}/rooms
     * Staff picks N distinct rooms (N = booking.total_room) before the
     * booking can be confirmed/converted. Separate save step from confirm,
     * so partial progress can be saved and re-validated independently.
     */
    public function assignRooms(Request $request, $id)
    {
        $booking = Booking::with('roomType')->where('booking_id', $id)->firstOrFail();

        if (!in_array(strtolower($booking->status), ['pending', 'confirmed'], true)) {
            return response()->json([
                'message' => 'Rooms can only be assigned before a booking is converted or cancelled.',
            ], 422);
        }

        $validated = $request->validate([
            'room_numbers'   => 'required|array|min:1',
            'room_numbers.*' => 'distinct|string|exists:rooms,room_number',
        ]);

        if (count($validated['room_numbers']) !== (int) $booking->total_room) {
            return response()->json([
                'message' => "This booking requires exactly {$booking->total_room} room(s); " . count($validated['room_numbers']) . ' given.',
            ], 422);
        }

        $rooms = Room::with('roomType')->whereIn('room_number', $validated['room_numbers'])->get()->keyBy('room_number');

        foreach ($validated['room_numbers'] as $rn) {
            $room = $rooms[$rn] ?? null;
            if (!$room) {
                return response()->json(['message' => "Room {$rn} not found."], 422);
            }
            if ((int) $room->room_type_id !== (int) $booking->room_type_id) {
                return response()->json(['message' => "Room {$rn} is not a {$booking->roomType->name} room."], 422);
            }
            if (in_array($room->status, ['Maintenance', 'Cleaning'], true)) {
                return response()->json(['message' => "Room {$rn} is currently {$room->status} and cannot be assigned."], 422);
            }

            $conflict = Reservation::where('room_number', $rn)
                ->whereNotIn('reservation_status', ['Checked-Out', 'No-Show', 'Moved'])
                ->where('check_in_date', '<', $booking->check_out_date)
                ->where('check_out_date', '>', $booking->check_in_date)
                ->exists();

            if ($conflict) {
                return response()->json([
                    'message' => "Room {$rn} is not available for {$booking->check_in_date->format('Y-m-d')} – {$booking->check_out_date->format('Y-m-d')}.",
                ], 422);
            }
        }

        DB::transaction(function () use ($booking, $validated) {
            BookingRoomAssignment::where('booking_id', $booking->booking_id)->delete();
            foreach ($validated['room_numbers'] as $rn) {
                BookingRoomAssignment::create(['booking_id' => $booking->booking_id, 'room_number' => $rn]);
            }
        });

        return response()->json([
            'message'     => 'Rooms assigned.',
            'assignments' => BookingRoomAssignment::where('booking_id', $booking->booking_id)->pluck('room_number'),
        ]);
    }

    /**
     * Split $total as evenly as possible across $n buckets, giving any
     * remainder to the first buckets (standard "deal the cards" split).
     * Guarantees the sum across all buckets exactly equals $total.
     */
    private function splitEvenly(int $total, int $n): array
    {
        $base = intdiv($total, $n);
        $remainder = $total % $n;
        $out = array_fill(0, $n, $base);
        for ($i = 0; $i < $remainder; $i++) {
            $out[$i]++;
        }
        return $out;
    }

    public function update(Request $request, $id)
    {
        $booking = Booking::where('booking_id', $id)->firstOrFail();

        // 1. Validate the incoming request
        $validated = $request->validate([
            'first_name'  => 'required|string|max:255',
            'last_name'   => 'required|string|max:255',
            'phone'       => 'required|string|max:50',
            'status'      => 'required|string',
            'room_number' => 'nullable|string', // legacy single-room fallback path
        ]);

        $status = strtolower($validated['status']);

        if ($status === 'cancelled') {
            $reservationIds = $booking->roomAssignments()->whereNotNull('reservation_id')->pluck('reservation_id');
            if ($reservationIds->isEmpty() && $booking->reservation_id) {
                $reservationIds = collect([$booking->reservation_id]); // legacy single-room bookings pre-dating this migration
            }
            $reservations = Reservation::whereIn('reservation_id', $reservationIds)->get();

            if ($reservations->contains(fn ($r) => in_array($r->reservation_status, ['Checked-In', 'Checked-Out'], true))) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'This booking cannot be cancelled because the guest has already checked in.',
                ], 422);
            }

            DB::transaction(function () use ($booking, $reservations) {
                foreach ($reservations as $reservation) {
                    Room::where('room_number', $reservation->room_number)->update(['status' => 'Available']);
                    $reservation->delete(); // cascades to its payments/charges/etc.
                }

                BookingRoomAssignment::where('booking_id', $booking->booking_id)->update(['reservation_id' => null]);
                $booking->update(['status' => 'cancelled', 'reservation_id' => null]);
            });

            try {
                Mail::to($booking->email)->send(new BookingCancelledMail($booking->fresh()));
            } catch (\Throwable $e) {
                Log::warning('BookingCancelledMail failed to send', ['booking_id' => $booking->booking_id, 'error' => $e->getMessage()]);
            }

            return response()->json([
                'status'  => 'success',
                'message' => 'Booking has been cancelled.',
                'data'    => $booking->fresh(),
            ], 200);
        }

        // 3. Handle Confirmation/Conversion Logic
        $shouldConvert = $status === 'confirmed';
        $assignedRoomNumbers = collect();
        $rooms = collect();

        if ($shouldConvert) {
            $assignedRoomNumbers = $booking->roomAssignments()->pluck('room_number');
            if ($assignedRoomNumbers->isEmpty() && !empty($validated['room_number'])) {
                $assignedRoomNumbers = collect([$validated['room_number']]); // legacy single-room path
            }

            if ($assignedRoomNumbers->count() !== (int) $booking->total_room) {
                return response()->json([
                    'status'  => 'error',
                    'message' => "Please assign {$booking->total_room} room(s) before confirming.",
                ], 422);
            }

            $rooms = Room::with('roomType')->whereIn('room_number', $assignedRoomNumbers)->get()->keyBy('room_number');

            foreach ($assignedRoomNumbers as $rn) {
                $room = $rooms[$rn] ?? null;

                if (!$room) {
                    return response()->json(['status' => 'error', 'message' => "Room {$rn} not found."], 422);
                }

                if (in_array($room->status, ['Maintenance', 'Cleaning'], true)) {
                    return response()->json([
                        'status'  => 'error',
                        'message' => "Room {$rn} is currently {$room->status} and cannot be assigned.",
                    ], 422);
                }

                if (($room->roomType->status ?? 'Active') !== 'Active') {
                    return response()->json([
                        'status'  => 'error',
                        'message' => "This room type is not currently available for booking.",
                    ], 422);
                }

                if ((int) $room->room_type_id !== (int) $booking->room_type_id) {
                    return response()->json([
                        'status'  => 'error',
                        'message' => "Room {$rn} does not match the booked room type.",
                    ], 422);
                }

                $conflict = Reservation::where('room_number', $rn)
                    ->whereNotIn('reservation_status', ['Checked-Out', 'Cancelled', 'No-Show', 'Moved'])
                    ->where('check_in_date', '<', $booking->check_out_date)
                    ->where('check_out_date', '>', $booking->check_in_date)
                    ->exists();

                if ($conflict) {
                    return response()->json([
                        'status'  => 'error',
                        'message' => "Room {$rn} is already booked for these dates.",
                    ], 422);
                }
            }
        }

        // 4. Update the Booking record
        $validated['handled_by'] = Auth::id() ?? $booking->handled_by;
        $booking->update($validated);

        // 5. Run Conversion Transaction if confirmed
        $createdReservations = [];
        if ($shouldConvert) {
            $createdReservations = DB::transaction(function () use ($booking, $rooms, $assignedRoomNumbers) {
                $nights = max(1, Carbon::parse($booking->check_in_date)->diffInDays(Carbon::parse($booking->check_out_date)));
                $n = $assignedRoomNumbers->count();

                $adultsSplit   = $this->splitEvenly((int) $booking->adult, $n);
                $childrenSplit = $this->splitEvenly((int) $booking->child, $n);
                $depositCents  = (int) round(((float) $booking->deposit) * 100);
                $depositSplit  = array_map(fn ($c) => $c / 100, $this->splitEvenly($depositCents, $n));

                $created = [];
                foreach ($assignedRoomNumbers->values() as $i => $rn) {
                    $room = $rooms[$rn];
                    $roomAdults   = $adultsSplit[$i];
                    $roomChildren = $childrenSplit[$i];
                    $totalGuestsRoom = $roomAdults + $roomChildren;
                    $stdCapacity = (int) ($room->roomType->capacity ?? 2);

                    $rateNight = (float) ($room->roomType->base_price ?? 0);
                    $roomCharge = $nights * $rateNight;
                    $extraPersonCharge = max(0, $totalGuestsRoom - $stdCapacity) * (float) ($room->roomType->extra_person_rate ?? 0) * $nights;
                    $taxAmount = ($roomCharge + $extraPersonCharge) * 0.1;
                    $totalAmount = $roomCharge + $extraPersonCharge + $taxAmount;

                    $reservation = Reservation::create([
                        'guest_id'            => null,
                        'first_name'          => $booking->first_name,
                        'last_name'           => $booking->last_name,
                        'guest_name'          => trim($booking->first_name . ' ' . $booking->last_name),
                        'guest_email'         => $booking->email,
                        'guest_phone'         => $booking->phone,
                        'source_booking_number' => $booking->booking_number,
                        'room_type_id'        => $booking->room_type_id,
                        'room_number'         => $room->room_number,
                        'check_in_date'       => $booking->check_in_date,
                        'check_out_date'      => $booking->check_out_date,
                        'adults'              => $roomAdults,
                        'children'            => $roomChildren,
                        'booking_source'      => 'Website',
                        'special_requests'    => $booking->special_requests,
                        'nights'              => $nights,
                        'room_charge'         => $roomCharge,
                        'extra_person_charge' => $extraPersonCharge,
                        'tax_amount'          => $taxAmount,
                        'total_amount'        => $totalAmount,
                        'deposit_amount'      => $depositSplit[$i],
                        'reservation_status'  => 'Confirmed',
                        'created_by'          => Auth::id(),
                    ]);

                    // Create associated charges and payments
                    ReservationCharge::create([
                        'reservation_id' => $reservation->reservation_id,
                        'charge_type'    => 'room',
                        'description'    => "Room charge — {$nights} night(s)",
                        'amount'         => $roomCharge,
                    ]);

                    if ($extraPersonCharge > 0) {
                        ReservationCharge::create([
                            'reservation_id' => $reservation->reservation_id,
                            'charge_type'    => 'extra_person',
                            'description'    => "Extra person charge — {$nights} night(s)",
                            'amount'         => $extraPersonCharge,
                        ]);
                    }

                    if ($taxAmount > 0) {
                        ReservationCharge::create([
                            'reservation_id' => $reservation->reservation_id,
                            'charge_type'    => 'tax',
                            'description'    => 'Tax',
                            'amount'         => $taxAmount,
                        ]);
                    }

                    if ($depositSplit[$i] > 0) {
                        Payment::create([
                            'reservation_id' => $reservation->reservation_id,
                            'amount'         => $depositSplit[$i],
                            'payment_method' => $booking->payment_method ?? 'online',
                            'date'           => now()->toDateString(),
                            'comment'        => 'Deposit Payment',
                        ]);
                    }

                    BookingRoomAssignment::where('booking_id', $booking->booking_id)->where('room_number', $rn)
                        ->update(['reservation_id' => $reservation->reservation_id]);

                    $created[] = $reservation;
                }

                $booking->update([
                    'status'         => 'converted',
                    'reservation_id' => $created[0]->reservation_id,
                ]);

                return $created;
            });

            try {
                Mail::to($booking->email)->send(new BookingConfirmedMail($booking->fresh(), $createdReservations));
            } catch (\Throwable $e) {
                Log::warning('BookingConfirmedMail failed to send', ['booking_id' => $booking->booking_id, 'error' => $e->getMessage()]);
            }
        }

        return response()->json([
            'status'  => 'success',
            'message' => $shouldConvert ? 'Booking confirmed and reservation(s) created!' : 'Booking updated successfully!',
            'data'    => $booking->fresh(),
        ], 200);
    }

    public function myBookings(int $user_id)
    {
        $bookings = Booking::where('user_id', $user_id)
            ->with('roomType')
            ->get()
            ->map(function ($b) {

                return [
                    'booking_id' => $b->booking_id,
                    'booking_number' => $b->booking_number,

                    'first_name' => $b->first_name,
                    'last_name' => $b->last_name,

                    'room_type' => [
                        'name' => $b->roomType ? $b->roomType->name : 'Unknown'
                    ],

                    'phone' => $b->phone,
                    'adult' => $b->adult,
                    'child' => $b->child,

                    'check_in_date' => $b->check_in_date,
                    'check_out_date' => $b->check_out_date,

                    'deposit' => $b->deposit,

                    'status' => ucfirst($b->status),
                ];
            });

        return response()->json($bookings);
    }

    public function show($id)
    {
        $normalized = strtoupper(trim($id));

        $booking = Booking::with(['roomType', 'roomAssignments.room', 'roomAssignments.reservation'])
            ->where(function ($q) use ($normalized, $id) {
                $q->where('booking_number', $normalized);
                if (ctype_digit((string) $id)) {
                    $q->orWhere('booking_id', $id);
                }
            })
            ->first();

        if (!$booking) {
            return response()->json([
                'message' => 'Booking not found',
                'searched_id' => $id
            ], 404);
        }

        return response()->json([
            'success' => true,
            'booking' => [
                'id'                 => $booking->booking_number,
                'raw_id'             => $booking->booking_id,
                'booking_number'     => $booking->booking_number,
                'first_name'         => $booking->first_name,
                'last_name'          => $booking->last_name,
                'email'              => $booking->email,
                'phone'              => $booking->phone,
                'bed_preference'     => $booking->bed_preference,
                'roomType'           => $booking->roomType->name ?? 'N/A',
                'room_type_id'       => $booking->room_type_id,
                'roomNumber'         => $booking->room_number,
                'total_room'         => $booking->total_room,
                'adult'              => $booking->adult,
                'child'              => $booking->child,
                'checkIn'            => $booking->check_in_date ? $booking->check_in_date->format('Y-m-d') : null,
                'checkOut'           => $booking->check_out_date ? $booking->check_out_date->format('Y-m-d') : null,
                'amount'             => (float) $booking->deposit,
                'depositScreenshot'  => $booking->deposit_screenshot
                    ? Storage::disk('public')->url($booking->deposit_screenshot)
                    : null,
                'payment_method'     => $booking->payment_method,
                'special_requests'   => $booking->special_requests,
                'status'             => $booking->status === 'converted' ? 'Confirmed' : ucfirst($booking->status),
                'rawStatus'          => $booking->status,
                'reservationId'      => $booking->reservation_id,
                'handledBy'          => $booking->handledBy?->name,
                'created_at'         => optional($booking->created_at)->toDateTimeString(),
                'roomAssignments'    => $booking->roomAssignments->map(fn ($a) => [
                    'roomNumber'    => $a->room_number,
                    'floor'         => $a->room?->floor,
                    'reservationId' => $a->reservation_id,
                ])->values(),
            ],
        ]);
    }
}
