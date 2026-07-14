<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Log;
use App\Models\Reservation;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('reservations:mark-no-shows')->dailyAt('00:05');

Schedule::command('audit:night-run')
    ->dailyAt('01:00')
    ->withoutOverlapping()
    ->onFailure(function () {
        Log::error('Night audit batch failed.');
    });