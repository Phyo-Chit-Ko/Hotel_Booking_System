<?php

namespace App\Console\Commands;

use App\Models\Reservation;
use Illuminate\Console\Command;

class MarkNoShows extends Command
{
    protected $signature = 'reservations:mark-no-shows';
    protected $description = 'Flip overdue Reserved/Confirmed reservations to No-Show';

    public function handle(): int
    {
        $count = Reservation::whereIn('reservation_status', ['Reserved', 'Confirmed'])
            ->whereDate('check_in_date', '<', now()->toDateString())
            ->update(['reservation_status' => 'No-Show']);

        $this->info("Marked {$count} reservation(s) as No-Show.");
        return self::SUCCESS;
    }
}