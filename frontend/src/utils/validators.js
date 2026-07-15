// Client-side mirrors of backend/app/Support/ValidationPatterns.php — these
// are conveniences only (fast feedback before a round-trip); the backend
// rules remain the enforcement layer.

export const NAME_RE = /^\p{L}[\p{L}\s'.-]*$/u;
export const PHONE_RE = /^\+?[0-9][0-9\s-]{6,19}$/;
export const NATIONALITY_RE = /^\p{L}[\p{L}\s-]*$/u;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSPORT_RE = /^[A-Za-z0-9]{6,9}$/;

export function validateIdNumber(idType, value) {
  const trimmed = (value || "").trim();
  if (!trimmed) return "ID number is required.";
  if (idType === "Passport" && !PASSPORT_RE.test(trimmed)) {
    return "Passport numbers must be 6-9 letters/digits.";
  }
  if (!/^[\p{L}\p{N}/()\-\s]+$/u.test(trimmed)) {
    return "ID number contains invalid characters.";
  }
  return "";
}
