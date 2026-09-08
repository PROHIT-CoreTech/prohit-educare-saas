/**
 * Validates 10-digit Indian Mobile Numbers on the frontend.
 * Must be 10 digits, start with 6, 7, 8, or 9, and not be dummy repeated digits.
 */
export function isValidMobile(phone: string | undefined | null): boolean {
  if (!phone) return false;
  const cleanPhone = phone.toString().trim().replace(/[\s\-\+\(\)]/g, '');

  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    return false;
  }

  // Reject repeated dummy digits (e.g. 0000000000, 1111111111, etc.)
  if (/^(.)\1{9}$/.test(cleanPhone)) {
    return false;
  }

  if (cleanPhone === '1234567890' || cleanPhone === '0123456789') {
    return false;
  }

  return true;
}
