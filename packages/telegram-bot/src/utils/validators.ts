/**
 * Validation utilities for inputs (IDs, text, etc.)
 */

/**
 * Validates if a string is a valid UUID format
 * Supports both standard UUID and simplified ID formats
 */
export function isValidId(id: string | undefined | null): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }

  const trimmed = id.trim();
  
  // Empty string is not valid
  if (trimmed.length === 0) {
    return false;
  }

  // UUID v4 format (with or without dashes)
  const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?4[0-9a-f]{3}-?[89ab][0-9a-f]{3}-?[0-9a-f]{12}$/i;
  
  // MongoDB ObjectId format (24 hex characters)
  const mongoIdRegex = /^[0-9a-f]{24}$/i;

  // Simple alphanumeric ID (at least 10 characters, max 100)
  const simpleIdRegex = /^[a-zA-Z0-9_-]{10,100}$/;

  return uuidRegex.test(trimmed) || mongoIdRegex.test(trimmed) || simpleIdRegex.test(trimmed);
}

/**
 * Validates job ID format
 */
export function isValidJobId(jobId: string | undefined | null): boolean {
  return isValidId(jobId);
}

/**
 * Validates talent ID format
 */
export function isValidTalentId(talentId: string | undefined | null): boolean {
  return isValidId(talentId);
}

/**
 * Validates application ID format
 */
export function isValidApplicationId(applicationId: string | undefined | null): boolean {
  return isValidId(applicationId);
}

/**
 * Sanitizes and validates text input
 * @param text - Text to validate
 * @param minLength - Minimum length (default: 1)
 * @param maxLength - Maximum length (default: 10000)
 * @returns Object with isValid flag and sanitized text
 */
export function validateText(
  text: string | undefined | null,
  minLength: number = 1,
  maxLength: number = 10000
): { isValid: boolean; sanitized?: string; error?: string } {
  if (!text || typeof text !== 'string') {
    return {
      isValid: false,
      error: 'Text input is required',
    };
  }

  const trimmed = text.trim();

  if (trimmed.length < minLength) {
    return {
      isValid: false,
      error: `Text must be at least ${minLength} character(s)`,
    };
  }

  if (trimmed.length > maxLength) {
    return {
      isValid: false,
      error: `Text must not exceed ${maxLength} characters`,
    };
  }

  return {
    isValid: true,
    sanitized: trimmed,
  };
}

/**
 * Validates email format (if needed in the future)
 */
export function isValidEmail(email: string | undefined | null): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates Telegram ID (numeric string)
 */
export function isValidTelegramId(telegramId: string | number | undefined | null): boolean {
  if (telegramId === undefined || telegramId === null) {
    return false;
  }

  const idString = typeof telegramId === 'number' ? telegramId.toString() : telegramId;
  const numRegex = /^\d+$/;
  return numRegex.test(idString) && parseInt(idString, 10) > 0;
}

/**
 * Extracts and validates ID from text message
 * Handles cases where ID might be in quotes, after "ID:", etc.
 */
export function extractId(text: string | undefined | null): string | null {
  if (!text || typeof text !== 'string') {
    return null;
  }

  const trimmed = text.trim();

  // Remove common prefixes
  const cleaned = trimmed
    .replace(/^(id|ID):\s*/i, '')
    .replace(/^['"]|['"]$/g, '')
    .trim();

  // Check if it's a valid ID format
  if (isValidId(cleaned)) {
    return cleaned;
  }

  // If cleaned text is a valid ID, return it
  if (isValidId(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Validates numeric input
 */
export function validateNumber(
  value: string | number | undefined | null,
  min?: number,
  max?: number
): { isValid: boolean; value?: number; error?: string } {
  if (value === undefined || value === null) {
    return {
      isValid: false,
      error: 'Number is required',
    };
  }

  const num = typeof value === 'string' ? parseFloat(value.trim()) : value;

  if (isNaN(num)) {
    return {
      isValid: false,
      error: 'Invalid number format',
    };
  }

  if (min !== undefined && num < min) {
    return {
      isValid: false,
      error: `Number must be at least ${min}`,
    };
  }

  if (max !== undefined && num > max) {
    return {
      isValid: false,
      error: `Number must not exceed ${max}`,
    };
  }

  return {
    isValid: true,
    value: num,
  };
}


