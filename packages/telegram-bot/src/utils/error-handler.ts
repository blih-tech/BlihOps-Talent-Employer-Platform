import axios, { AxiosError } from 'axios';
import { Context } from 'grammy';

/**
 * Error types for better error handling
 */
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  DUPLICATE_ERROR = 'DUPLICATE_ERROR',
  UNAUTHORIZED_ERROR = 'UNAUTHORIZED_ERROR',
  API_ERROR = 'API_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Parsed error information
 */
export interface ParsedError {
  type: ErrorType;
  message: string;
  userMessage: string;
  statusCode?: number;
  originalError: unknown;
}

/**
 * Parse errors and provide user-friendly messages
 */
export function parseError(error: unknown): ParsedError {
  // Axios errors (API calls)
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;

    // Network errors (no response)
    if (!axiosError.response && axiosError.request) {
      return {
        type: ErrorType.NETWORK_ERROR,
        message: 'Network error: Cannot reach API',
        userMessage: '⚠️ Connection problem. Please check your internet connection and try again.',
        originalError: error,
      };
    }

    // Timeout errors
    if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
      return {
        type: ErrorType.TIMEOUT_ERROR,
        message: 'Request timeout',
        userMessage: '⏱️ Request took too long. Please try again in a moment.',
        originalError: error,
      };
    }

    if (axiosError.response) {
      const status = axiosError.response.status;
      const apiMessage =
        axiosError.response.data?.message ||
        axiosError.response.data?.error ||
        axiosError.message;

      // Rate limiting (429)
      if (status === 429) {
        return {
          type: ErrorType.RATE_LIMIT_ERROR,
          message: `Rate limit exceeded (${status})`,
          userMessage:
            '⏳ Too many requests. Please wait a moment before trying again.',
          statusCode: status,
          originalError: error,
        };
      }

      // Not found (404)
      if (status === 404) {
        return {
          type: ErrorType.NOT_FOUND_ERROR,
          message: `Resource not found (${status})`,
          userMessage:
            '❌ The requested item was not found. Please check the ID and try again.',
          statusCode: status,
          originalError: error,
        };
      }

      // Conflict/Duplicate (409)
      if (status === 409) {
        return {
          type: ErrorType.DUPLICATE_ERROR,
          message: `Duplicate/Conflict (${status}): ${apiMessage}`,
          userMessage:
            '⚠️ This action has already been performed. Please check and try again.',
          statusCode: status,
          originalError: error,
        };
      }

      // Unauthorized (401)
      if (status === 401) {
        return {
          type: ErrorType.UNAUTHORIZED_ERROR,
          message: `Unauthorized (${status})`,
          userMessage:
            '🔒 Authentication required. Please try again or contact support.',
          statusCode: status,
          originalError: error,
        };
      }

      // Forbidden (403)
      if (status === 403) {
        return {
          type: ErrorType.UNAUTHORIZED_ERROR,
          message: `Forbidden (${status})`,
          userMessage:
            '🚫 You do not have permission to perform this action.',
          statusCode: status,
          originalError: error,
        };
      }

      // Server errors (5xx)
      if (status >= 500) {
        return {
          type: ErrorType.API_ERROR,
          message: `Server error (${status}): ${apiMessage}`,
          userMessage:
            '🔧 Server error. Our team has been notified. Please try again later.',
          statusCode: status,
          originalError: error,
        };
      }

      // Other API errors (4xx)
      return {
        type: ErrorType.API_ERROR,
        message: `API error (${status}): ${apiMessage}`,
        userMessage: apiMessage || '❌ An error occurred. Please try again.',
        statusCode: status,
        originalError: error,
      };
    }
  }

  // Standard Error objects
  if (error instanceof Error) {
    // Check for specific error messages
    const errorMessage = error.message.toLowerCase();

    // Duplicate application errors
    if (
      errorMessage.includes('already applied') ||
      errorMessage.includes('duplicate') ||
      errorMessage.includes('already exists')
    ) {
      return {
        type: ErrorType.DUPLICATE_ERROR,
        message: error.message,
        userMessage:
          '⚠️ You have already performed this action. Please check and try again.',
        originalError: error,
      };
    }

    // Validation errors
    if (
      errorMessage.includes('invalid') ||
      errorMessage.includes('validation') ||
      errorMessage.includes('required')
    ) {
      return {
        type: ErrorType.VALIDATION_ERROR,
        message: error.message,
        userMessage: `❌ Invalid input: ${error.message}`,
        originalError: error,
      };
    }

    // Not found errors
    if (errorMessage.includes('not found')) {
      return {
        type: ErrorType.NOT_FOUND_ERROR,
        message: error.message,
        userMessage:
          '❌ The requested item was not found. Please check the ID and try again.',
        originalError: error,
      };
    }

    // Generic error
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: error.message,
      userMessage: '❌ An unexpected error occurred. Please try again later.',
      originalError: error,
    };
  }

  // Unknown error type
  return {
    type: ErrorType.UNKNOWN_ERROR,
    message: 'Unknown error',
    userMessage: '❌ An unexpected error occurred. Please try again later.',
    originalError: error,
  };
}

/**
 * Handle error and send user-friendly message to context
 */
export async function handleError(
  ctx: Context,
  error: unknown,
  customMessage?: string
): Promise<void> {
  const parsed = parseError(error);
  
  // Log error for debugging
  console.error('Error handled:', {
    type: parsed.type,
    message: parsed.message,
    statusCode: parsed.statusCode,
    error: parsed.originalError,
  });

  // Use custom message if provided, otherwise use parsed user message
  const userMessage = customMessage || parsed.userMessage;

  try {
    await ctx.reply(userMessage);
  } catch (replyError) {
    // If reply fails (e.g., context is not available), log it
    console.error('Failed to send error message to user:', replyError);
  }
}

/**
 * Handle callback query errors with appropriate response
 */
export async function handleCallbackError(
  ctx: Context,
  error: unknown,
  customMessage?: string
): Promise<void> {
  const parsed = parseError(error);
  
  console.error('Callback error handled:', {
    type: parsed.type,
    message: parsed.message,
    statusCode: parsed.statusCode,
    error: parsed.originalError,
  });

  const userMessage = customMessage || parsed.userMessage;

  try {
    // Try to answer callback query with alert
    if ('answerCallbackQuery' in ctx) {
      await (ctx as any).answerCallbackQuery({
        text: userMessage.length > 200 ? userMessage.substring(0, 200) : userMessage,
        show_alert: true,
      });
    }
  } catch (replyError) {
    console.error('Failed to answer callback query:', replyError);
  }
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  const parsed = parseError(error);
  return parsed.type === ErrorType.NETWORK_ERROR;
}

/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  const parsed = parseError(error);
  return parsed.type === ErrorType.TIMEOUT_ERROR;
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
  const parsed = parseError(error);
  return parsed.type === ErrorType.RATE_LIMIT_ERROR;
}

/**
 * Check if error is a duplicate/conflict error
 */
export function isDuplicateError(error: unknown): boolean {
  const parsed = parseError(error);
  return parsed.type === ErrorType.DUPLICATE_ERROR;
}

/**
 * Check if error is a not found error
 */
export function isNotFoundError(error: unknown): boolean {
  const parsed = parseError(error);
  return parsed.type === ErrorType.NOT_FOUND_ERROR;
}


