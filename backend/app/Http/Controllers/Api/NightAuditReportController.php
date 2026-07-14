<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NightAuditReport;

class NightAuditReportController extends Controller
{
    public function index()
    {
        return NightAuditReport::orderBy('audit_date', 'desc')->get();
    }
}