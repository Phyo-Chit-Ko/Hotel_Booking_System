<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Guest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with('roomType');

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

        // Filter by status
        if ($request->filled('status') && $request->status !== 'All Status') {
            $query->where('status', strtolower($request->status));
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
                    'adult'              => $b->adult,
                    'child'              => $b->child,
                    'checkIn'            => $b->check_in_date ? $b->check_in_date->format('Y-m-d') : null,
                    'checkOut'           => $b->check_out_date ? $b->check_out_date->format('Y-m-d') : null,
                    'amount'             => (float) $b->deposit,
                    'depositScreenshot'  => $b->deposit_screenshot
                    ? Storage::disk('public')->url($b->deposit_screenshot)
                    : null,
                    'status'             => ucfirst($b->status),
                ];
            }),
            'stats' => [
                'total'     => Booking::count(),
                'confirmed' => Booking::where('status', 'confirmed')->count(),
                'pending'   => Booking::where('status', 'pending')->count(),
            ],
        ]);
    }

    public function store(Request $request) 
    {
        // 1. Validate your incoming data
        $validated = $request->validate([
            'first_name'         => 'required|string',
            'last_name'          => 'required|string',
            'email'              => 'required|email',
            'phone'              => 'required|string',
            'adult'              => 'required|integer',
            'child'              => 'nullable|integer',
            'total_room'         => 'required|integer',
            'bed_preference'     => 'required|string',
            'check_in_date'      => 'required|date',
            'check_out_date'     => 'required|date',
            'special_requests'   => 'nullable|string',
            'payment_method'     => 'required|string',
            'room_type_id'       => 'required|integer',
            'payment_screenshot' => 'required|image|max:5120',
        ]);

        // 2. Handle file upload safely
        if ($request->hasFile('payment_screenshot')) {
            $path = $request->file('payment_screenshot')->store('deposit_screenshots', 'public');
            $validated['deposit_screenshot'] = $path;
        }

        // Hardcode your 45$ deposit value since it's a fixed read-only property on your UI
        $validated['deposit'] = 45;
        $validated['status'] = 'pending';

        // 3. Save directly via the Model
        $booking = Booking::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Booking saved successfully!',
            'data' => $booking
        ], 201);
    }

    /**
     * Update an existing booking record.
     */
    public function update(Request $request, $id)
    {
        // FIXED: Find using custom primary column 'booking_id' explicitly 
        $booking = Booking::where('booking_id', $id)->firstOrFail();

        // Validate the incoming fields sent by the edit form
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'phone'      => 'required|string|max:50',
            'status'     => 'required|string',
        ]);

        // Clean values before DB commit: standard lowercase status formatting
        if (isset($validated['status'])) {
            $validated['status'] = strtolower($validated['status']);
        }

        // Update the record fields directly
        $booking->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Booking updated successfully!',
            'data' => $booking
        ], 200);
    }
    }
