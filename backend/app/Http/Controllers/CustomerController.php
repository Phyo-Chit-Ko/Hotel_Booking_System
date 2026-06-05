<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function getCustomer($id)
    {
        // Update this path to match exactly where your compiled customerlookup.exe lives
        $command = '"C:\\Phyo Chit Ko\\cobol\\Hotel-Booking-System\\cobol\\customerlookup.exe" ' . escapeshellarg($id);

        $result = shell_exec($command);

        return response()->json([
            'customer' => trim($result)
        ]);
    }
}