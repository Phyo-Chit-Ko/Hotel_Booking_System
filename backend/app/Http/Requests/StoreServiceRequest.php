<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // The reservation is resolved server-side from the room number
            // (see ExtraServiceController::resolveActiveReservation) — staff
            // no longer type a raw reservation ID by hand, and guest_name is
            // derived from that reservation rather than trusted from the client.
            'room_number'    => ['required', 'string', 'exists:rooms,room_number'],

            'guest_name'     => ['nullable', 'string', 'max:255'],

            'service_type'   => ['required', 'string', 'in:Laundry,Car Rental,Food'],
            
            'charge_date'    => ['required', 'date'],
            
            'description'    => ['nullable', 'string'], 
            
            'quantity'       => ['required', 'integer', 'min:1'],
            
            'rate'           => ['required', 'numeric', 'min:0'],
            
            // 🔥 FIX: Removed 'string' rule constraint so it allows mixed array data payloads 
            // from your React select element before your controller converts it safely to JSON.
            'food_items'     => ['nullable'],
        ];
    }
}