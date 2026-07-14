<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// app/Models/NightAuditReport.php
class NightAuditReport extends Model
{
  
    protected $fillable = [
        'audit_date', 'total_check_in', 'total_check_out',
        'total_inhouse', 'total_no_show_rooms', 'total_revenue',
        'status',
    ];
}

