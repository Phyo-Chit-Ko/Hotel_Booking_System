<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FloorLayout extends Model
{
    protected $fillable = [
        'floor',
        'type',
        'label',
        'col',
        'row',
        'w',
        'h',
        'vertical',
        'color',
    ];

    protected $casts = [
        'col'      => 'integer',
        'row'      => 'integer',
        'w'        => 'integer',
        'h'        => 'integer',
        'vertical' => 'boolean',
    ];
}
