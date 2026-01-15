import { z } from 'zod';
import { Logger } from '../logger';

/**
 * Configuration service with Zod validation
 * Provides type-safe access to environment variables
 */
export class ConfigService {
  private readonly config: Record<string, unknown>;
  private readonly logger: Logger;

  constructor(schema: z.ZodObject<z.ZodRawShape>, logger?: Logger) {
    this.logger = logger || new Logger({ context: 'ConfigService' });

    // Load environment variables
    const rawConfig = process.env;

    // Validate configuration
    const result = schema.safeParse(rawConfig);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));

      this.logger.error('Configuration validation failed', undefined, { errors });
      throw new Error(
        `Configuration validation failed:\n${errors.map((e) => `  - ${e.path}: ${e.message}`).join('\n')}`
      );
    }

    this.config = result.data;
    this.logger.info('Configuration loaded and validated successfully');
  }

  /**
   * Get configuration value by key
   */
  get<T = unknown>(key: string): T {
    const value = this.config[key];
    if (value === undefined) {
      this.logger.warn(`Configuration key '${key}' not found`);
    }
    return value as T;
  }

  /**
   * Get configuration value with default
   */
  getOrDefault<T>(key: string, defaultValue: T): T {
    const value = this.config[key];
    return value !== undefined ? (value as T) : defaultValue;
  }

  /**
   * Check if configuration key exists
   */
  has(key: string): boolean {
    return key in this.config;
  }

  /**
   * Get all configuration
   */
  getAll(): Record<string, unknown> {
    return { ...this.config };
  }
}

/**
 * Create a configuration service with schema
 */
export function createConfigService<T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
  logger?: Logger
): ConfigService {
  return new ConfigService(schema, logger);
}




