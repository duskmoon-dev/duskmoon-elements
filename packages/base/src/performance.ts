/**
 * Performance utilities for DuskMoon custom elements
 *
 * Provides debounce, throttle, and scheduling helpers for
 * optimizing element responsiveness and reducing unnecessary work.
 *
 * @example
 * ```ts
 * import { debounce, throttle, scheduleTask } from '@duskmoon-dev/el-base';
 *
 * class MySearch extends BaseElement {
 *   #search = debounce((query: string) => {
 *     this.emit('search', { query });
 *   }, 300);
 *
 *   #handleScroll = throttle(() => {
 *     this._updatePosition();
 *   }, 100);
 * }
 * ```
 */

/**
 * Creates a debounced function that delays invocation until after
 * `delay` milliseconds have elapsed since the last call.
 *
 * Returns a function with a `.cancel()` method to abort pending execution.
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number,
): T & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const debounced = function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = undefined;
      fn.apply(this, args);
    }, delay);
  } as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  };

  return debounced;
}

/**
 * Creates a throttled function that invokes at most once per `interval` ms.
 * Uses leading-edge execution: fires immediately, then suppresses until interval passes.
 *
 * Returns a function with a `.cancel()` method to abort pending execution.
 */
export function throttle<T extends (...args: Parameters<T>) => void>(
  fn: T,
  interval: number,
): T & { cancel: () => void } {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const throttled = function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = interval - (now - lastCall);

    if (remaining <= 0) {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
      lastCall = now;
      fn.apply(this, args);
    } else if (timeoutId === undefined) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = undefined;
        fn.apply(this, args);
      }, remaining);
    }
  } as T & { cancel: () => void };

  throttled.cancel = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
    lastCall = 0;
  };

  return throttled;
}

/**
 * Schedule a low-priority task using requestIdleCallback (with fallback).
 * Useful for deferring non-critical work like analytics, preloading, or cleanup.
 *
 * @returns A cancel function
 */
export function scheduleIdle(callback: () => void, options?: { timeout?: number }): () => void {
  if (typeof requestIdleCallback === 'function') {
    const id = requestIdleCallback(callback, options);
    return () => cancelIdleCallback(id);
  }
  // Fallback for environments without requestIdleCallback
  const id = setTimeout(callback, options?.timeout ?? 50);
  return () => clearTimeout(id);
}
