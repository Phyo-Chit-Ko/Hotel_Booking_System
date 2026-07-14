<?php

namespace App\Http\Requests;

use App\Support\ValidationPatterns;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255', 'regex:' . ValidationPatterns::NAME],
            'email' => ['required', 'string', 'email:rfc', 'max:255', 'unique:users'],
            'phone' => ['nullable', 'string', 'max:20', 'regex:' . ValidationPatterns::PHONE],
            'role' => ['required', 'string', 'in:admin,manager,receptionist'],
            'status' => ['required', 'string', 'in:Active,Inactive'],
            'password' => ['required', 'string', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
        ];
    }
}
