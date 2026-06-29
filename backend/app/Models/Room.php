<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    // room_number is the primary key (string, not auto-increment)
    protected $primaryKey = 'room_number';
    public    $incrementing = false;
    protected $keyType      = 'string';

    protected $fillable = [
        'room_number',
        'room_type_id',
        'floor',
        'status',
        'bed_type',
        'extra_person_rate',
        'grid_col',
        'grid_row',
        'grid_w',
        'grid_h',
    ];

    protected $casts = [
        'extra_person_rate' => 'decimal:2',
        'grid_col'          => 'integer',
        'grid_row'          => 'integer',
        'grid_w'            => 'integer',
        'grid_h'            => 'integer',
    ];

    // ── Relationships ──────────────────────────────────────────────────────

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class, 'room_type_id', 'room_type_id');
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class, 'room_number', 'room_number');
    }

    // public function transfers(): HasMany
    // {
    //     return $this->hasMany(RoomTransfer::class, 'old_room_num', 'room_number');
    // }
}
