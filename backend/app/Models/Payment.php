<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $table = 'payments';
    protected $primaryKey = 'payment_id';

    protected $fillable = [
        'reservation_id',
        'amount',
        'payment_method',
        'date',
        'transaction_no',
        'comment',
        'payment_proof_path',
        'handled_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'date'   => 'date',
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class, 'reservation_id', 'reservation_id');
    }

    public function handledBy()
    {
        return $this->belongsTo(User::class, 'handled_by', 'user_id');
    }
}