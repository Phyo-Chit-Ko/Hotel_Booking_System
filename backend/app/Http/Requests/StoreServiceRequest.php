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
            // 1. Changed to integer to match bigint(20) on line 2 of AdobeExpressPhotos_fecd2033c46a40e98b510dc2c0e30262_CopyEdited.jpg
            'reservation_id' => ['required', 'integer'], 
            
            'guest_name'     => ['required', 'string', 'max:255'],
            
            // 2. Matches enum rules precisely on line 4 of AdobeExpressPhotos_fecd2033c46a40e98b510dc2c0e30262_CopyEdited.jpg
            'service_type'   => ['required', 'string', 'in:Laundry,Car Rental,Food'],
            
            'charge_date'    => ['required', 'date'],
            'description'    => ['nullable', 'string'], 
            'quantity'       => ['required', 'integer', 'min:1'],
            'rate'           => ['required', 'numeric', 'min:0'],
            
            // 3. Kept optional/nullable as allowed on line 10 of AdobeExpressPhotos_fecd2033c46a40e98b510dc2c0e30262_CopyEdited.jpg
            'food_items'     => ['nullable', 'string'],
        ];
    }
}