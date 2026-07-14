<?php

namespace App\Support;

use Closure;

/**
 * Shared validation patterns for person-identifying fields (name, phone,
 * nationality, ID number) used across Guest, ReservationGuest, and User
 * validation. Centralized here because the same rules are needed in several
 * controllers whose surrounding rule sets (required/sometimes/required_without)
 * differ too much to share one FormRequest class.
 */
class ValidationPatterns
{
    // Unicode letters (covers Burmese-script names) + spaces/apostrophes/
    // hyphens/periods. Must start with a letter.
    public const NAME = '/^[\pL][\pL\s\'\.\-]*$/u';

    // Optional leading +, 7-20 digits with optional spaces/hyphens.
    public const PHONE = '/^\+?[0-9][0-9\s\-]{6,19}$/';

    // Unicode letters, spaces, hyphens — e.g. "Myanmar", "Japanese".
    public const NATIONALITY = '/^[\pL][\pL\s\-]*$/u';

    // ICAO passport numbers are typically 6-9 alphanumeric characters.
    public const ID_PASSPORT = '/^[A-Za-z0-9]{6,9}$/';

    // NRC / Driver's License / National ID: format varies too much (township
    // codes, transliteration) to enforce a strict structural regex safely —
    // loose sanity check only (letters/digits/()/- allowed, rejects control
    // characters and pure whitespace).
    public const ID_GENERIC = '/^[\pL\pN\/\(\)\-\s]+$/u';

    /**
     * Build a validation closure for an ID number field, applying the
     * strict Passport format only when idType === 'Passport'.
     */
    public static function idNumberRule(string $idType): Closure
    {
        return function (string $attribute, $value, Closure $fail) use ($idType) {
            $trimmed = trim((string) $value);
            if ($trimmed === '') {
                $fail('The ID number is required.');
                return;
            }
            if ($idType === 'Passport' && !preg_match(self::ID_PASSPORT, $trimmed)) {
                $fail('Passport numbers must be 6-9 letters/digits.');
                return;
            }
            if (!preg_match(self::ID_GENERIC, $trimmed)) {
                $fail('The ID number contains invalid characters.');
            }
        };
    }
}
