<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\Reservation;
use App\Models\ReservationCharge;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with(['roomType', 'handledBy']);

        // Search by booking id, guest name, or email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('booking_id', 'like', "%{$search}%")
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
                    'id'                 => 'BK' . str_pad($b->booking_id, 3, '0', STR_PAD_LEFT),
                    'raw_id'             => $b->booking_id,
                    'first_name'         => $b->first_name,
                    'last_name'          => $b->last_name,
                    'email'              => $b->email,
                    'phone'              => $b->phone,
                    'roomType'           => $b->roomType->name ?? 'N/A',
                    'roomNumber'         => $b->room_number,
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

        $screenshotPath = $request->file('payment_screenshot')
            ->store('deposit_screenshots', 'public');

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
            'deposit'             => 45.00,
            'deposit_screenshot'  => $screenshotPath,
            'payment_method'      => $validated['payment_method'],
            'special_requests'    => $validated['special_requests'] ?? null,
            'status'              => 'pending',
        ]);

        return response()->json([
            'message' => 'Booking created successfully.',
            'booking' => $booking,
        ], 201);
    }

    /**
     * Update an existing booking record. If the admin confirms the booking
     * AND assigns a room in the same request, the booking is converted into
     * a real Reservation:
     *   - No Guest record is created here. guest_name / guest_email /
     *     guest_phone are snapshotted directly onto the reservation.
     *     A real Guest (with ID type/number) only gets created later,
     *     at actual front-desk check-in.
     *   - room_charge / extra_person_charge / tax_amount / total_amount
     *     are calculated the same way as ReservationController::store(),
     *     so both creation paths stay consistent.
     *   - The booking's $45 deposit is recorded as an actual Payment row,
     *     so Reservation Management's Balance column (which is derived
     *     from payments.sum('amount'), not deposit_amount) reflects it
     *     correctly.
     */
    public function update(Request $request, $id)
    {
        $booking = Booking::where('booking_id', $id)->firstOrFail();

        // 1. Validate the incoming request
        $validated = $request->validate([
            'first_name'  => 'required|string|max:255',
            'last_name'   => 'required|string|max:255',
            'phone'       => 'required|string|max:50',
            'status'      => 'required|string',
            'room_number' => 'nullable|string', // Nullable because cancelled bookings don't need a room
        ]);

        $status = strtolower($validated['status']);

        // 2. Handle Cancellation
        if ($status === 'cancelled') {
            $booking->update(['status' => 'cancelled']);

            return response()->json([
                'status'  => 'success',
                'message' => 'Booking has been cancelled.',
                'data'    => $booking->fresh(),
            ], 200);
        }

        // 3. Handle Confirmation/Conversion Logic
        $shouldConvert = $status === 'confirmed' && !empty($validated['room_number']);
        $room = null;

        if ($shouldConvert) {
            $room = Room::with('roomType')->where('room_number', $validated['room_number'])->firstOrFail();

            if (in_array($room->status, ['Maintenance', 'Cleaning'], true)) {
                return response()->json([
                    'status'  => 'error',
                    'message' => "Room {$room->room_number} is currently {$room->status} and cannot be assigned.",
                ], 422);
            }

            if (($room->roomType->status ?? 'Active') !== 'Active') {
                return response()->json([
                    'status'  => 'error',
                    'message' => "This room type is not currently available for booking.",
                ], 422);
            }

            // Verify room type matches the guest's booking
            if ((int) $room->room_type_id !== (int) $booking->room_type_id) {
                return response()->json([
                    'status'  => 'error',
                    'message' => "Room {$validated['room_number']} does not match the booked room type.",
                ], 422);
            }

            // Check for existing reservation conflicts
            $conflict = Reservation::where('room_number', $validated['room_number'])
                ->whereNotIn('reservation_status', ['Checked-Out', 'Cancelled'])
                ->where('check_in_date', '<', $booking->check_out_date)
                ->where('check_out_date', '>', $booking->check_in_date)
                ->exists();

            if ($conflict) {
                return response()->json([
                    'status'  => 'error',
                    'message' => "Room {$validated['room_number']} is already booked for these dates.",
                ], 422);
            }
        }

        // 4. Update the Booking record
        $validated['handled_by'] = Auth::id() ?? $booking->handled_by;
        $booking->update($validated);

        // 5. Run Conversion Transaction if confirmed
        if ($shouldConvert) {
            DB::transaction(function () use ($booking, $room) {
                $nights = Carbon::parse($booking->check_in_date)->diffInDays(Carbon::parse($booking->check_out_date));
                $nights = max(1, $nights);

                $rateNight = (float) ($room->roomType->base_price ?? 0);
                $adults    = (int) $booking->adult;
                $children  = (int) $booking->child;
                $totalGuests = $adults + $children;

                $roomCharge        = $nights * $rateNight;
                $extraPersonCharge = max(0, $totalGuests - 2) * (float) ($room->roomType->extra_person_rate ?? 0) * $nights;
                $taxAmount         = ($roomCharge + $extraPersonCharge) * 0.1;
                $totalAmount       = $roomCharge + $extraPersonCharge + $taxAmount;
                $deposit           = (float) $booking->deposit;

                $reservation = Reservation::create([
                    'guest_id'            => null,
                    'guest_name'          => trim($booking->first_name . ' ' . $booking->last_name),
                    'guest_email'         => $booking->email,
                    'guest_phone'         => $booking->phone,
                    'room_type_id'        => $booking->room_type_id,
                    'room_number'         => $room->room_number,
                    'check_in_date'       => $booking->check_in_date,
                    'check_out_date'      => $booking->check_out_date,
                    'adults'              => $adults,
                    'children'            => $children,
                    'booking_source'      => 'Website',
                    'special_requests'    => $booking->special_requests,
                    'nights'              => $nights,
                    'room_charge'         => $roomCharge,
                    'extra_person_charge' => $extraPersonCharge,
                    'tax_amount'          => $taxAmount,
                    'total_amount'        => $totalAmount,
                    'deposit_amount'      => $deposit,
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

                if ($deposit > 0) {
                    Payment::create([
                        'reservation_id' => $reservation->reservation_id,
                        'amount'         => $deposit,
                        'payment_method' => $booking->payment_method ?? 'online',
                        'date'           => now()->toDateString(),
                        'description'    => 'Deposit paid at online booking',
                    ]);
                }

                $booking->update([
                    'status'         => 'converted',
                    'reservation_id' => $reservation->reservation_id,
                ]);
            });
        }

        return response()->json([
            'status'  => 'success',
            'message' => $shouldConvert ? 'Booking confirmed and reservation created!' : 'Booking updated successfully!',
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
        // Remove BK prefix if frontend sends BK008
        $id = str_replace('BK', '', $id);

        $booking = Booking::with('roomType')
            ->where('booking_id', $id)
            ->first();

        if (!$booking) {
            return response()->json([
                'message' => 'Booking not found',
                'searched_id' => $id
            ], 404);
        }

        return response()->json([
            'success' => true,
            'booking' => $booking
        ]);
    }
}