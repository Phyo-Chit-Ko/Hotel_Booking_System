<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5; }
        h3 { margin-bottom: 4px; color: #374151; }
        table { border-collapse: collapse; width: 100%; margin: 8px 0 16px; }
        td { padding: 3px 8px 3px 0; vertical-align: top; }
        .label { color: #6b7280; width: 190px; }
        .footer { margin-top: 24px; font-size: 13px; color: #6b7280; }
    </style>
</head>
<body>
    <p>Dear {{ $booking->first_name }} {{ $booking->last_name }},</p>

    <p>This confirms that your booking with Grand Hotel has been cancelled as requested.</p>

    <h3>Booking Information</h3>
    <table>
        <tr><td class="label">Booking No.</td><td>{{ $booking->booking_number }}</td></tr>
        <tr><td class="label">Guest Name</td><td>{{ $booking->first_name }} {{ $booking->last_name }}</td></tr>
        <tr><td class="label">Room Type</td><td>{{ $booking->roomType->name ?? '' }}</td></tr>
        <tr><td class="label">Check-in</td><td>{{ \Carbon\Carbon::parse($booking->check_in_date)->format('d F Y') }}</td></tr>
        <tr><td class="label">Check-out</td><td>{{ \Carbon\Carbon::parse($booking->check_out_date)->format('d F Y') }}</td></tr>
    </table>

    <p>If a deposit was paid, any applicable refund will be processed according to our cancellation policy.</p>

    <p>If you have any questions, please contact us — we hope to welcome you to Grand Hotel another time.</p>

    <p>Best regards,</p>

    <div class="footer">
        Grand Hotel<br>
        Phone: +95-XXX-XXXXXX<br>
        Email: reservations@grandhotel.com
    </div>
</body>
</html>
