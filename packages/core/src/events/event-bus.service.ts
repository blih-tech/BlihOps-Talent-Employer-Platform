import { EventEmitter2 } from 'eventemitter2';

/**
 * Event bus service using EventEmitter2
 * Provides type-safe event emission and listening
 */
export class EventBusService {
  private readonly emitter: EventEmitter2;

  constructor(options?: { wildcard?: boolean; delimiter?: string; maxListeners?: number }) {
    this.emitter = new EventEmitter2({
      wildcard: options?.wildcard ?? false,
      delimiter: options?.delimiter ?? '.',
      maxListeners: options?.maxListeners ?? 20,
    });
  }

  /**
   * Emit an event
   */
  emit<T = unknown>(event: string, data?: T): boolean {
    return this.emitter.emit(event, data);
  }

  /**
   * Emit an event asynchronously
   */
  emitAsync<T = unknown>(event: string, data?: T): Promise<unknown[]> {
    return this.emitter.emitAsync(event, data);
  }

  /**
   * Listen to an event
   */
  on<T = unknown>(event: string, listener: (data: T) => void): this {
    this.emitter.on(event, listener);
    return this;
  }

  /**
   * Listen to an event once
   */
  once<T = unknown>(event: string, listener: (data: T) => void): this {
    this.emitter.once(event, listener);
    return this;
  }

  /**
   * Remove event listener
   */
  off(event: string, listener?: (...args: unknown[]) => void): this {
    if (listener) {
      this.emitter.off(event, listener);
    } else {
      this.emitter.removeAllListeners(event);
    }
    return this;
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: string | string[]): this {
    this.emitter.removeAllListeners(event);
    return this;
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: string): number {
    return this.emitter.listenerCount(event);
  }
}

/**
 * Global event bus singleton
 */
let globalEventBus: EventBusService | null = null;

/**
 * Get or create the global event bus instance
 */
export function getEventBus(): EventBusService {
  if (!globalEventBus) {
    globalEventBus = new EventBusService();
  }
  return globalEventBus;
}

/**
 * Set the global event bus instance (useful for testing)
 */
export function setEventBus(eventBus: EventBusService): void {
  globalEventBus = eventBus;
}

