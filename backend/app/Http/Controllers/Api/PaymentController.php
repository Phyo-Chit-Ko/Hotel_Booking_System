<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reservationId' => 'required|integer|exists:reservations,reservation_id',
            'depositAmount' => 'nullable|numeric|min:0',
            'paymentMethod' => 'required|string|in:cash,credit_card,bank_transfer,online',
            'transactionNo' => 'nullable|string|max:100',
            'paymentProof'  => 'nullable|file|max:5120',
        ]);

        $booking = DB::transaction(function () use ($validated, $request) {
            $reservation = Reservation::findOrFail($validated['reservationId']);
            $deposit = $validated['depositAmount'] ?? 0;

            if ($deposit > 0) {
                $paymentData = [
                    'reservation_id' => $reservation->reservation_id,
                    'amount'         => $deposit,
                    'payment_method' => $validated['paymentMethod'],
                    'date'           => now()->toDateString(),
                    'transaction_no' => $validated['transactionNo'] ?? null,
                    'description'    => 'Initial deposit at booking',
                ];

                if ($request->hasFile('paymentProof')) {
                    $paymentData['payment_proof_path'] = $request->file('paymentProof')->store('payment-proofs', 'public');
                }

                Payment::create($paymentData);
            }

            $reservation->update(['deposit_amount' => $deposit]);
            $reservation->load(['guest', 'roomType', 'payments', 'charges']);

            return $reservation;
        });

        return response()->json([
            'booking' => $booking->toTableRow(),
        ], 201);
    }
}