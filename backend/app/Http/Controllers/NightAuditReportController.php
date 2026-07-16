<?php

namespace App\Http\Controllers;

use App\Models\NightAuditReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class NightAuditReportController extends Controller
{
    /**
     * GET /api/night-audit-reports
     * Returns all audit rows, most recent first — matches what Reports.jsx expects.
     */
    public function index()
    {
        return response()->json(
            NightAuditReport::orderByDesc('audit_date')->get()
        );
    }

    /**
     * POST /api/night-audit-reports/run-batch
     * Manually triggers the same artisan command the scheduler would run at 00:30.
     * Useful for testing without waiting overnight, or as a manual re-run button.
     */
    public function runBatch()
    {
        try {
            $exitCode = Artisan::call('audit:night-run');
            $output = Artisan::output();

            if ($exitCode !== 0) {
                return response()->json([
                    'message' => 'Batch job reported a failure. Check the output for details.',
                    'output'  => $output,
                ], 500);
            }

            return response()->json([
                'message' => 'Batch job completed successfully.',
                'output'  => $output,
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Batch job failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}
