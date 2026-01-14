import pino, { Logger as PinoLogger } from 'pino';
import { ILogger, LogLevel, LoggerOptions } from './logger.interface';

/**
 * Pino-based logger service
 * Provides structured logging with configurable transports
 */
export class Logger implements ILogger {
  private readonly logger: PinoLogger;

  constructor(options: LoggerOptions = {}) {
    const { level = LogLevel.INFO, context } = options;

    const pinoOptions: pino.LoggerOptions = {
      level,
      base: context ? { context } : undefined,
      timestamp: pino.stdTimeFunctions.isoTime,
    };

    // Create base logger
    this.logger = pino(pinoOptions);

    // Note: Pretty printing (options.pretty) and file transport (options.file) 
    // can be configured via pino transport in the future if needed
    // For now, use environment variables or separate logger instances
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.logger.debug(context || {}, message);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.logger.info(context || {}, message);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.logger.warn(context || {}, message);
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const errorContext: Record<string, unknown> = { ...context };

    if (error instanceof Error) {
      errorContext.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error) {
      errorContext.error = error;
    }

    this.logger.error(errorContext, message);
  }

  fatal(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const errorContext: Record<string, unknown> = { ...context };

    if (error instanceof Error) {
      errorContext.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error) {
      errorContext.error = error;
    }

    this.logger.fatal(errorContext, message);
  }

  /**
   * Create a child logger with additional context
   */
  child(context: Record<string, unknown>): Logger {
    const childLogger = Object.create(Logger.prototype);
    childLogger.logger = this.logger.child(context);
    return childLogger;
  }
}

/**
 * Create a logger instance
 */
export function createLogger(options?: LoggerOptions): Logger {
  return new Logger(options);
}

