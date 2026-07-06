<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Guest extends Model
{
    protected $table = 'guests';
    protected $primaryKey = 'guest_id';

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'id_number',
        'id_type',
        'nationality',
        'is_vip',
        'id_front_path',
        'id_back_path',
    ];

    protected $casts = [
        'is_vip' => 'boolean',
    ];

    /**
     * A guest can have many reservations over time.
     */
    public function reservations()
    {
        return $this->hasMany(Reservation::class, 'guest_id', 'guest_id');
    }

    /**
     * Convenience accessor: "John Smith"
     */
    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }
}