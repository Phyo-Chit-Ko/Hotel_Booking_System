<?php
namespace App\Console\Commands;

use App\Models\NightAuditReport;
use App\Models\Reservation;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;
use Carbon\Carbon;

class RunNightAudit extends Command
{
    protected $signature = 'audit:night-run';
    protected $description = 'Run COBOL night audit batch and store results';

    public function handle(): int
    {
        $date = Carbon::yesterday()->toDateString();
        $staysPath  = storage_path("app/audit/stays_{$date}.txt");
        $outputPath = storage_path("app/audit/summary_{$date}.txt");

        @mkdir(dirname($staysPath), 0755, true);
        $this->exportStays($date, $staysPath);

        $process = new Process([config('services.night_audit_bin'), $staysPath, $outputPath, $date]);
$process->setTimeout(300);
$process->run();

\Log::info('Night audit process debug', [
    'command'   => $process->getCommandLine(),
    'exit_code' => $process->getExitCode(),
    'stdout'    => $process->getOutput(),
    'stderr'    => $process->getErrorOutput(),
    'working_dir' => getcwd(),
]);

if (!$process->isSuccessful()) {
            NightAuditReport::updateOrCreate(
                ['audit_date' => $date],
                ['status' => 'failed', 'total_check_in' => 0, 'total_check_out' => 0, 'total_inhouse' => 0, 'total_no_show_rooms' => 0, 'total_revenue' => 0]
            );
            $this->error('COBOL batch failed: ' . $process->getErrorOutput());
            return self::FAILURE;
        }

        $line = file_get_contents($outputPath);

        $report = [
            'audit_date'           => $date,
            'total_check_in'       => (int) substr($line, 10, 5),
            'total_check_out'      => (int) substr($line, 15, 5),
            'total_inhouse'        => (int) substr($line, 20, 5),
            'total_no_show_rooms'  => (int) substr($line, 25, 5),
            'total_revenue'        => (int) substr($line, 30, 11) / 100,
            'status'               => 'success',
        ];

        NightAuditReport::updateOrCreate(['audit_date' => $date], $report);
        $this->info("Night audit for {$date} saved.");
        return self::SUCCESS;
    }

    private function exportStays(string $date, string $path): void
    {
        $lines = collect();

        // Arrivals that day
        Reservation::whereDate('check_in_date', $date)
            ->get()->each(fn ($r) => $lines->push(sprintf('%-10s%-10s%09d%09d', $r->room_number, 'CHECKIN', 0, 0)));

        // Departures that day
        Reservation::whereDate('check_out_date', $date)
            ->get()->each(fn ($r) => $lines->push(sprintf('%-10s%-10s%09d%09d', $r->room_number, 'CHECKOUT', 0, 0)));

        // In-house that night (revenue counted here only, to avoid double-counting)
        Reservation::where('reservation_status', 'Checked-in')
            ->whereDate('check_in_date', '<=', $date)
            ->whereDate('check_out_date', '>', $date)
            ->get()->each(function ($r) use ($lines) {
                $nights = max($r->nights, 1);
                $lines->push(sprintf(
                    '%-10s%-10s%09d%09d',
                    $r->room_number, 'INHOUSE',
                    round(($r->room_charge / $nights) * 100),
                    round(($r->extra_person_charge / $nights) * 100)
                ));
            });

        // No-shows that day
        Reservation::where('reservation_status', 'No-show')
            ->whereDate('check_in_date', $date)
            ->get()->each(fn ($r) => $lines->push(sprintf('%-10s%-10s%09d%09d', $r->room_number, 'NOSHOW', 0, 0)));

        file_put_contents($path, $lines->implode("\n"));
    }
}