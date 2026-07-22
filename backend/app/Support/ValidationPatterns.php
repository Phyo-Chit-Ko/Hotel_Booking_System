<?php

namespace App\Support;

use Closure;

/**
 * Shared validation patterns for person-identifying fields (name, phone,
 * nationality, ID number) used across Guest, ReservationGuest, and User
 * validation.
 */
class ValidationPatterns
{
    // Unicode letters (covers Burmese-script names) + spaces/apostrophes/
    // hyphens/periods. Must start with a letter.
    public const NAME = '/^[\pL][\pL\s\'\.\-]*$/u';

    // Optional leading +, 7-20 digits with optional spaces/hyphens.
    public const PHONE = '/^09\d{7,9}$/';

    // Unicode letters, spaces, hyphens — e.g. "Myanmar", "Japanese".
    public const NATIONALITY = '/^[\pL][\pL\s\-]*$/u';

    // Passport numbers: 6-12 alphanumeric characters (standard ICAO format).
    public const ID_PASSPORT = '/^[A-Za-z0-9]{6,12}$/';

    // NRC Regex: Region 1-14 / Township 3-6 letters / Citizen type (N|P|E) / Exactly 6 digits
    // Example: 12/MAMANA(N)123456
    public const ID_NRC = '/^([1-9]|1[0-4])\/[\pL]{2,10}\((N|P|E|T|Y|S)\)\d{6}$/ui';

    // Driver's License / National ID / Generic: letters/digits/()/- allowed.
    public const ID_GENERIC = '/^[\pL\pN\/\(\)\-\s]+$/u';

    /**
     * Build a validation closure for an ID number field based on idType.
     */
    public static function idNumberRule(string $idType): Closure
    {
        return function (string $attribute, $value, Closure $fail) use ($idType) {
            $trimmed = trim((string) $value);

            if ($trimmed === '') {
                $fail('The ID number is required.');
                return;
            }

            if ($idType === 'NRC') {
                if (!preg_match(self::ID_NRC, $trimmed)) {
                    $fail('Invalid NRC format. Please select region, township, type, and enter exactly 6 digits.');
                    return;
                }
            } elseif ($idType === 'Passport') {
                if (!preg_match(self::ID_PASSPORT, $trimmed)) {
                    $fail('Passport number must be 6 to 12 alphanumeric characters with no spaces or symbols.');
                    return;
                }
            }

            if (!preg_match(self::ID_GENERIC, $trimmed)) {
                $fail('The ID number contains invalid characters.');
            }
        };
    }
}