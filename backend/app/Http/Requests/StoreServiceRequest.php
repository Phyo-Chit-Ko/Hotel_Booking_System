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
            // Matches bigint(20) constraint perfectly
            'reservation_id' => ['required', 'integer'], 
            
            'guest_name'     => ['required', 'string', 'max:255'],
            
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