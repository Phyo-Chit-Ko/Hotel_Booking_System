<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5; }
        h2 { color: #92400e; margin-bottom: 4px; }
        h3 { margin-bottom: 4px; color: #374151; }
        table { border-collapse: collapse; width: 100%; margin: 8px 0 16px; }
        td { padding: 3px 8px 3px 0; vertical-align: top; }
        .label { color: #6b7280; width: 190px; }
        .room-block { border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; margin-bottom: 12px; }
        .footer { margin-top: 24px; font-size: 13px; color: #6b7280; }
    </style>
</head>
<body>
    <p>Dear {{ $booking->first_name }} {{ $booking->last_name }},</p>

    <p>Thank you for choosing Grand Hotel.</p>

    <p>We are pleased to confirm your reservation. Below are your booking details.</p>

    <h3>Reservation Information</h3>
    <table>
        <tr><td class="label">Booking No.</td><td>{{ $booking->booking_number }}</td></tr>
        <tr><td class="label">Guest Name</td><td>{{ $booking->first_name }} {{ $booking->last_name }}</td></tr>
    </table>

    <h3>Stay Details</h3>
    <table>
        <tr><td class="label">Check-in</td><td>{{ \Carbon\Carbon::parse($booking->check_in_date)->format('d F Y') }}</td></tr>
        <tr><td class="label">Check-out</td><td>{{ \Carbon\Carbon::parse($booking->check_out_date)->format('d F Y') }}</td></tr>
        <tr><td class="label">Guests</td><td>{{ $booking->adult }} Adult(s){{ $booking->child > 0 ? ', ' . $booking->child . ' Child(ren)' : '' }}</td></tr>
        <tr><td class="label">Total Rooms</td><td>{{ $booking->total_room }}</td></tr>
    </table>

    <h3>Room Details</h3>
    @foreach ($reservations as $reservation)
        <div class="room-block">
            <table>
                <tr><td class="label">Room Type</td><td>{{ $reservation->roomType->name ?? '' }}</td></tr>
                <tr><td class="label">Room Number</td><td>{{ $reservation->room_number }}</td></tr>
                <tr><td class="label">Bed Type</td><td>{{ $reservation->room->bed_type ?? '' }}</td></tr>
                <tr><td class="label">Nights</td><td>{{ $reservation->nights }}</td></tr>
                <tr><td class="label">Total Amount</td><td>{{ number_format((float) $reservation->total_amount, 2) }} MMK</td></tr>
                <tr><td class="label">Deposit Paid</td><td>{{ number_format((float) $reservation->deposit_amount, 2) }} MMK</td></tr>
                <tr><td class="label">Balance Due at Check-in</td><td>{{ number_format((float) $reservation->total_amount - (float) $reservation->deposit_amount, 2) }} MMK</td></tr>
            </table>
        </div>
    @endforeach

    <h3>Payment Summary</h3>
    <table>
        <tr><td class="label">Total Amount</td><td>{{ number_format((float) $totalAmount, 2) }} MMK</td></tr>
        <tr><td class="label">Deposit Paid</td><td>{{ number_format((float) $totalDeposit, 2) }} MMK</td></tr>
        <tr><td class="label">Balance Due at Check-in</td><td>{{ number_format((float) $totalAmount - (float) $totalDeposit, 2) }} MMK</td></tr>
    </table>

    <h3>Hotel Policies</h3>
    <table>
        <tr><td class="label">Check-in</td><td>From 2:00 PM</td></tr>
        <tr><td class="label">Check-out</td><td>Before 12:00 PM</td></tr>
    </table>

    <p>If you have any questions or need to modify your reservation, please contact us.</p>

    <p>We look forward to welcoming you to Grand Hotel.</p>

    <p>Best regards,</p>

    <div class="footer">
        Grand Hotel<br>
        Phone: +95-XXX-XXXXXX<br>
        Email: reservations@grandhotel.com
    </div>
</body>
</html>
