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
                'checkIn'            => $b->check_in_date->format('Y-m-d'),
                'checkOut'           => $b->check_out_date->format('Y-m-d'),
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
        $validated = $request->validate([
            'room_type_id'      => 'required|exists:room_types,room_type_id',
            'first_name'        => 'required|string|max:255',
            'last_name'         => 'required|string|max:255',
            'email'             => 'required|email|max:255',
            'phone'             => 'required|string|max:30',
            'bed_preference'    => 'nullable|string',
            'check_in_date'     => 'required|date',
            'check_out_date'    => 'required|date|after:check_in_date',
            'total_room'        => 'required|integer|min:1',
            'adult'             => 'required|integer|min:1',
            'child'             => 'nullable|integer|min:0',
            'special_requests'  => 'nullable|string',
            'payment_method'    => 'required|in:K-Pay,Bank',
            'payment_screenshot'=> 'required|image|max:5120', // 5MB
        ]);

        // Find existing guest by email, or create a new one
        $guest = Guest::firstOrCreate(
            ['email' => $validated['email']],
            [
                'first_name' => $validated['first_name'],
                'last_name'  => $validated['last_name'],
                'phone'      => $validated['phone'],
            ]
        );

        $screenshotPath = $request->file('payment_screenshot')
            ->store('deposit_screenshots', 'public');

        $booking = Booking::create([
            'guest_id'           => $guest->guest_id,
            'room_type_id'       => $validated['room_type_id'],
            'first_name'         => $validated['first_name'],
            'last_name'          => $validated['last_name'],
            'email'              => $validated['email'],
            'phone'              => $validated['phone'],
            'bed_preference'     => $validated['bed_preference'] ?? null,
            'check_in_date'      => $validated['check_in_date'],
            'check_out_date'     => $validated['check_out_date'],
            'total_room'         => $validated['total_room'],
            'adult'              => $validated['adult'],
            'child'              => $validated['child'] ?? 0,
            'deposit'            => 45.00,
            'deposit_screenshot' => $screenshotPath,
            'special_requests'   => $validated['special_requests'] ?? null,
            'status'             => 'pending',
        ]);

        return response()->json([
            'message' => 'Booking created successfully.',
            'booking' => $booking,
        ], 201);
    }
}