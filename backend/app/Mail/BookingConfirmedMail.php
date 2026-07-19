<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BookingConfirmedMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  \App\Models\Reservation[]  $reservations  One per assigned room.
     */
    public function __construct(
        public Booking $booking,
        public array $reservations,
    ) {}

    public function build()
    {
        return $this->subject("Booking Confirmed — {$this->booking->booking_number}")
            ->view('emails.booking-confirmed')
            ->with([
                'booking'      => $this->booking,
                'reservations' => $this->reservations,
                'totalDeposit' => collect($this->reservations)->sum('deposit_amount'),
                'totalAmount'  => collect($this->reservations)->sum('total_amount'),
            ]);
    }
}
