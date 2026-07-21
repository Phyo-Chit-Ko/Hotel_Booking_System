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
     * Statuses that represent a room genuinely being occupied by a guest.
     */
    private const OCCUPIED_STATUSES = ['Checked-In', 'Checked-Out', 'Moved'];
 
    public function stats(Request $request)
    {
        // ── Parse the weekly calendar parameter (e.g., "2026-W29") ──────────
        $weekParam = $request->query('week');
 
        if ($weekParam && preg_match('/^(\d{4})-W(\d{2})$/', $weekParam, $matches)) {
            $year = (int)$matches[1];
            $week = (int)$matches[2];
           
            // Set Carbon to the first day (Monday) of that specific calendar week
            $periodStart = Carbon::now()->setISODate($year, $week)->startOfDay();
        } else {
            // Fallback to the current week's Monday if parameter is missing or malformed
            $periodStart = Carbon::now()->startOfWeek()->startOfDay();
        }
 
        // Define the bounds for the selected week (Monday through Sunday)
        $periodEnd = $periodStart->copy()->endOfWeek()->endOfDay();
 
        // Define the comparison bounds for the prior week (shifted back exactly 7 days)
        $prevPeriodStart = $periodStart->copy()->subWeek()->startOfDay();
        $prevPeriodEnd = $prevPeriodStart->copy()->endOfWeek()->endOfDay();
 
        $totalRooms = max(1, Room::count());
 
        // ── Total Revenue (Payments registered within the specific weeks) ──
        $currentRevenue = (float) Payment::whereBetween('date', [$periodStart, $periodEnd])->sum('amount');
        $prevRevenue    = (float) Payment::whereBetween('date', [$prevPeriodStart, $prevPeriodEnd])->sum('amount');
 
        // ── Occupancy Helper Function ──────────────────────────────────────
        $getOccupancyOn = function (Carbon $day) use ($totalRooms) {
            $occupied = Reservation::whereIn('reservation_status', self::OCCUPIED_STATUSES)
                ->whereDate('check_in_date', '<=', $day)
                ->where('check_out_date', '>', $day)
                ->distinct('room_number')
                ->count('room_number');
            return round(($occupied / $totalRooms) * 100, 1);
        };
 
        // Average occupancy rate over the course of the target weeks
        $currentOccupancy  = $this->getAverageOccupancyForPeriod($periodStart, $periodEnd, $getOccupancyOn);
        $previousOccupancy = $this->getAverageOccupancyForPeriod($prevPeriodStart, $prevPeriodEnd, $getOccupancyOn);
 
        // ── Active Check-Ins (Calculated for the terminal date of the week) ──
        // Since it's a structural snapshot, we evaluate what was active at the end of the weeks
        $currentCheckIns  = Reservation::where('reservation_status', 'Checked-In')
            ->where('check_in_date', '<=', $periodEnd)
            ->where('check_out_date', '>', $periodEnd)
            ->count();
 
        $previousCheckIns = Reservation::where('reservation_status', 'Checked-In')
            ->where('check_in_date', '<=', $prevPeriodEnd)
            ->where('check_out_date', '>', $prevPeriodEnd)
            ->count();
 
        // ── Chart Series: Exact 7-day breakdown of the selected week ───────
        $chartSeries = [];
        $dailyRevenue = Payment::selectRaw('date, SUM(amount) as total')
            ->whereBetween('date', [$periodStart, $periodEnd])
            ->groupBy('date')
            ->pluck('total', 'date');
 
        for ($i = 0; $i < 7; $i++) {
            $day = $periodStart->copy()->addDays($i);
            $dateString = $day->toDateString();
           
            $chartSeries[] = [
                'date'           => $dateString,
                'revenue'        => (float) ($dailyRevenue[$dateString] ?? 0),
                'occupancy_rate' => $getOccupancyOn($day),
            ];
        }
 
        // ── Distribution Channels: Bookings created during this specific week ─
        $channelRows = Reservation::whereBetween('created_at', [$periodStart, $periodEnd])
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
 
        // ── Recent Activity Log ─────────────────────────────────────────────
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
            'week' => $weekParam ?: Carbon::now()->format('Y-\WW'),
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
 
    /**
     * Helper to compute aggregate average occupancy percentage over a 7-day phase.
     */
    private function getAverageOccupancyForPeriod(Carbon $start, Carbon $end, callable $occupancyOn): float
    {
        $totalPct = 0;
        $daysCount = 0;
       
        $current = $start->copy();
        while ($current->lte($end) && $daysCount < 7) {
            $totalPct += $occupancyOn($current);
            $daysCount++;
            $current->addDay();
        }
       
        return $daysCount > 0 ? round($totalPct / $daysCount, 1) : 0.0;
    }
 
    private function pctChange(float $current, float $previous): ?float
    {
        if ($previous == 0.0) {
            return $current > 0 ? 100.0 : 0.0;
        }
        return round((($current - $previous) / $previous) * 100, 1);
    }
}
 