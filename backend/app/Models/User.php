<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The primary key associated with the table.
     * Required because your migration uses 'user_id' instead of 'id'.
     */
    protected $primaryKey = 'user_id';

    /**
     * The attributes that are mass assignable.
     * Added 'phone', 'status', and 'role' to allow saving these via forms/API.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'status',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed', // Automatically handles password hashing
        ];
    }
}
