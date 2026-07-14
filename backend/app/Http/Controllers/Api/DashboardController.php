<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Room;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Statuses that represent a room genuinely being occupied by a guest on
     * a given day. Used both for "today"'s occupancy figure and for
     * reconstructing the trailing chart series, since there's no historical
     * daily room-status snapshot table — this is a reasonable proxy built
     * from reservation date ranges rather than a true historical log.
     */
    private const OCCUPIED_STATUSES = ['Checked-In', 'Checked-Out', 'Moved'];

    public function stats(Request $request)
    {
        $range = (int) $request->query('range', 7);
        $range = in_array($range, [7, 30], true) ? $range : 7;

        $today = Carbon::today();
        $periodStart = $today->copy()->subDays($range - 1);
        $prevPeriodStart = $periodStart->copy()->subDays($range);
        $prevPeriodEnd = $periodStart->copy()->subDay();

        $totalRooms = max(1, Room::count());

        // ── Total Revenue (money actually received, i.e. payments — not
        //    total_amount, which is a forward-looking charge total) ────────
        $currentRevenue = (float) Payment::whereBetween('date', [$periodStart, $today])->sum('amount');
        $prevRevenue    = (float) Payment::whereBetween('date', [$prevPeriodStart, $prevPeriodEnd])->sum('amount');

        // ── Occupancy rate (today), via the same reservation-reconstruction
        //    used for the chart series, for consistency ─────────────────────
        $occupancyOn = function (Carbon $day) use ($totalRooms) {
            $occupied = Reservation::whereIn('reservation_status', self::OCCUPIED_STATUSES)
                ->whereDate('check_in_date', '<=', $day)
                ->where('check_out_date', '>', $day)
                ->distinct('room_number')
                ->count('room_number');
            return round(($occupied / $totalRooms) * 100, 1);
        };

        $currentOccupancy  = $occupancyOn($today);
        $previousOccupancy = $occupancyOn($today->copy()->subDays($range));

        // ── Active check-ins — precise current state, not reconstructed ────
        $currentCheckIns  = Reservation::where('reservation_status', 'Checked-In')->count();
        $previousCheckIns = Reservation::where('reservation_status', 'Checked-In')
            ->where('check_in_date', '<=', $today->copy()->subDays($range))
            ->count();

        // ── Chart series: daily revenue + reconstructed occupancy ──────────
        $chartSeries = [];
        $dailyRevenue = Payment::selectRaw('date, SUM(amount) as total')
            ->whereBetween('date', [$periodStart, $today])
            ->groupBy('date')
            ->pluck('total', 'date');

        for ($i = 0; $i < $range; $i++) {
            $day = $periodStart->copy()->addDays($i);
            $chartSeries[] = [
                'date'           => $day->toDateString(),
                'revenue'        => (float) ($dailyRevenue[$day->toDateString()] ?? 0),
                'occupancy_rate' => $occupancyOn($day),
            ];
        }

        // ── Distribution channels (booking source), reservations created in range ─
        $channelRows = Reservation::whereBetween('created_at', [$periodStart, $today->copy()->endOfDay()])
            ->select('booking_source', DB::raw('count(*) as count'))
            ->groupBy('booking_source')
            ->orderByDesc('count')
            ->get();

        $channelTotal = max(1, $channelRows->sum('count'));
        $distributionChannels = $channelRows->map(fn ($row) => [
            'name'    => $row->booking_source ?: 'Unknown',
            'count'   => (int) $row->count,
            'percent' => round(($row->count / $channelTotal) * 100, 1),
        ])->values();

        // ── Recent activity: blended reservations + payments, newest first ──
        $recentReservations = Reservation::latest('created_at')->limit(10)
            ->get(['reservation_id', 'guest_name', 'room_number', 'booking_source', 'created_at'])
            ->map(fn ($r) => [
                'id'   => "reservation-{$r->reservation_id}",
                'text' => "New booking for Room {$r->room_number}" . ($r->booking_source ? " via {$r->booking_source}" : ''),
                'at'   => $r->created_at,
            ]);

        $recentPayments = Payment::with('reservation')->latest('created_at')->limit(10)->get()
            ->map(fn ($p) => [
                'id'   => "payment-{$p->payment_id}",
                'text' => 'Payment of $' . number_format((float) $p->amount, 2) . ' recorded for Room ' . ($p->reservation->room_number ?? '—'),
                'at'   => $p->created_at,
            ]);

        $recentActivity = $recentReservations->concat($recentPayments)
            ->sortByDesc('at')
            ->take(10)
            ->map(fn ($item) => [
                'id'   => $item['id'],
                'text' => $item['text'],
                'time' => $item['at']?->diffForHumans() ?? '',
            ])
            ->values();

        return response()->json([
            'range' => $range,
            'stats' => [
                'total_revenue'   => ['value' => $currentRevenue, 'change' => $this->pctChange($currentRevenue, $prevRevenue)],
                'occupancy_rate'  => ['value' => $currentOccupancy, 'change' => $this->pctChange($currentOccupancy, $previousOccupancy)],
                'active_check_ins' => ['value' => $currentCheckIns, 'change' => $currentCheckIns - $previousCheckIns],
            ],
            'chart_series'          => $chartSeries,
            'distribution_channels' => $distributionChannels,
            'recent_activity'       => $recentActivity,
        ]);
    }

    private function pctChange(float $current, float $previous): ?float
    {
        if ($previous == 0.0) {
            return $current > 0 ? 100.0 : 0.0;
        }
        return round((($current - $previous) / $previous) * 100, 1);
    }
}
