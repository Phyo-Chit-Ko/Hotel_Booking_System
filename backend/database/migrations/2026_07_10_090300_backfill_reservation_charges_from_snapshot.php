<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * One-time backfill: reservations created before the reservation_charges
     * ledger existed only have room_charge/extra_person_charge/tax_amount
     * snapshot columns. Seed matching charge rows so remaining_amount (now
     * computed purely from charges - payments) stays correct for old data.
     */
    public function up(): void
    {
        DB::table('reservations')->orderBy('reservation_id')->chunk(200, function ($reservations) {
            foreach ($reservations as $reservation) {
                $createdAt = $reservation->created_at ?? now();
                $rows = [];

                if ((float) $reservation->room_charge > 0) {
                    $rows[] = [
                        'reservation_id' => $reservation->reservation_id,
                        'charge_type'    => 'room',
                        'description'    => "Room charge — {$reservation->nights} nights",
                        'amount'         => $reservation->room_charge,
                        'created_at'     => $createdAt,
                    ];
                }

                if ((float) $reservation->extra_person_charge > 0) {
                    $rows[] = [
                        'reservation_id' => $reservation->reservation_id,
                        'charge_type'    => 'extra_person',
                        'description'    => "Extra person charge — {$reservation->nights} nights",
                        'amount'         => $reservation->extra_person_charge,
                        'created_at'     => $createdAt,
                    ];
                }

                if ((float) $reservation->tax_amount > 0) {
                    $rows[] = [
                        'reservation_id' => $reservation->reservation_id,
                        'charge_type'    => 'tax',
                        'description'    => 'Tax',
                        'amount'         => $reservation->tax_amount,
                        'created_at'     => $createdAt,
                    ];
                }

                if (!empty($rows)) {
                    DB::table('reservation_charges')->insert($rows);
                }
            }
        });
    }

    /**
     * Not reversible in a meaningful way — this only ever seeds rows that
     * mirror pre-existing columns, it doesn't change source-of-truth data.
     */
    public function down(): void
    {
        //
    }
};
