/**
 * Validation utilities for forms across PROHIT Educare Platform.
 */

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

/**
 * Validates standard email address format.
 */
export function isValidEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const cleanEmail = email.toString().trim();
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanEmail);
}

/**
 * Validates that a string has meaningful content (not just whitespace) of minimum length.
 */
export function isValidName(name: string | undefined | null, minLength = 2): boolean {
  if (!name) return false;
  return name.toString().trim().length >= minLength;
}

/**
 * Validates academic level / standard range (-4 Day Care up to 15 TY Degree).
 */
export function isValidStandard(standard: number | string | undefined | null): boolean {
  if (standard === undefined || standard === null || standard === '') return false;
  const num = Number(standard);
  return !isNaN(num) && num >= -4 && num <= 15;
}

/**
 * Validates amounts (fees, payments, discounts).
 */
export function isValidAmount(amount: any, allowZero = true): boolean {
  if (amount === undefined || amount === null || amount === '') return false;
  const num = Number(amount);
  if (isNaN(num) || !isFinite(num)) return false;
  return allowZero ? num >= 0 : num > 0;
}

/**
 * Validates installment count (1 to 24 installments).
 */
export function isValidInstallmentCount(count: any): boolean {
  if (count === undefined || count === null || count === '') return false;
  const num = Number(count);
  return Number.isInteger(num) && num >= 1 && num <= 24;
}

/**
 * Validates password strength (minimum 6 characters).
 */
export function isValidPassword(password: string | undefined | null, minLength = 6): boolean {
  if (!password) return false;
  return password.length >= minLength;
}

/**
 * Extracts and formats clean, human-readable error messages from Axios / API errors,
 * converting raw Mongoose or backend validation messages into user-friendly text.
 */
export function formatValidationErrorMessage(
  err: any,
  fallbackMessage = 'An unexpected error occurred. Please check your inputs and try again.'
): string {
  if (!err) return fallbackMessage;

  const resData = err.response?.data;
  let rawMsg = resData?.message || resData?.error || err.message;

  if (Array.isArray(rawMsg)) {
    return rawMsg.join(' | ');
  }

  if (typeof rawMsg === 'string') {
    // Translate Mongoose schema validation failures
    if (rawMsg.includes('ClassBatch validation failed') || rawMsg.includes('is less than minimum allowed value')) {
      return 'The selected academic level is not supported by the backend schema or failed minimum constraint. Please verify the academic level or select an existing batch.';
    }
    if (rawMsg.includes('E11000') || rawMsg.includes('duplicate key')) {
      return 'A record with these details already exists. Please check your inputs.';
    }
    return rawMsg;
  }

  return fallbackMessage;
}
