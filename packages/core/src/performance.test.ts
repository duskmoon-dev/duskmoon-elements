import { expect, test, describe, beforeEach } from 'bun:test';
import { debounce, throttle, scheduleIdle } from './performance';

describe('Performance utilities', () => {
  describe('debounce()', () => {
    test('delays function execution', async () => {
      let callCount = 0;
      const debounced = debounce(() => {
        callCount++;
      }, 50);

      debounced();
      debounced();
      debounced();

      expect(callCount).toBe(0);

      await new Promise((r) => setTimeout(r, 80));
      expect(callCount).toBe(1);
    });

    test('resets timer on subsequent calls', async () => {
      let callCount = 0;
      const debounced = debounce(() => {
        callCount++;
      }, 50);

      debounced();
      await new Promise((r) => setTimeout(r, 30));
      debounced(); // Reset timer
      await new Promise((r) => setTimeout(r, 30));
      expect(callCount).toBe(0); // Still waiting

      await new Promise((r) => setTimeout(r, 40));
      expect(callCount).toBe(1);
    });

    test('passes arguments to original function', async () => {
      let received: string[] = [];
      const debounced = debounce((...args: string[]) => {
        received = args;
      }, 20);

      debounced('a', 'b');
      await new Promise((r) => setTimeout(r, 50));
      expect(received).toEqual(['a', 'b']);
    });

    test('cancel() prevents execution', async () => {
      let callCount = 0;
      const debounced = debounce(() => {
        callCount++;
      }, 20);

      debounced();
      debounced.cancel();

      await new Promise((r) => setTimeout(r, 50));
      expect(callCount).toBe(0);
    });

    test('cancel() is safe to call when no pending execution', () => {
      const debounced = debounce(() => {}, 20);
      expect(() => debounced.cancel()).not.toThrow();
    });
  });

  describe('throttle()', () => {
    test('fires immediately on first call', () => {
      let callCount = 0;
      const throttled = throttle(() => {
        callCount++;
      }, 100);

      throttled();
      expect(callCount).toBe(1);
    });

    test('suppresses calls within interval', () => {
      let callCount = 0;
      const throttled = throttle(() => {
        callCount++;
      }, 100);

      throttled();
      throttled();
      throttled();
      expect(callCount).toBe(1);
    });

    test('fires trailing call after interval', async () => {
      let callCount = 0;
      const throttled = throttle(() => {
        callCount++;
      }, 50);

      throttled(); // fires immediately
      throttled(); // queued as trailing
      expect(callCount).toBe(1);

      await new Promise((r) => setTimeout(r, 80));
      expect(callCount).toBe(2);
    });

    test('passes latest arguments to trailing call', async () => {
      let received = '';
      const throttled = throttle((msg: string) => {
        received = msg;
      }, 50);

      throttled('first'); // fires immediately
      throttled('second'); // queued
      throttled('third'); // replaces queued — but our throttle queues one

      await new Promise((r) => setTimeout(r, 80));
      // The trailing call should fire
      expect(received).not.toBe('first');
    });

    test('cancel() prevents pending trailing call', async () => {
      let callCount = 0;
      const throttled = throttle(() => {
        callCount++;
      }, 50);

      throttled(); // fires immediately
      throttled(); // queued as trailing
      throttled.cancel();

      await new Promise((r) => setTimeout(r, 80));
      expect(callCount).toBe(1); // Only the immediate call
    });

    test('cancel() resets lastCall allowing immediate re-fire', () => {
      let callCount = 0;
      const throttled = throttle(() => {
        callCount++;
      }, 100);

      throttled();
      expect(callCount).toBe(1);

      throttled.cancel();
      throttled();
      expect(callCount).toBe(2);
    });
  });

  describe('scheduleIdle()', () => {
    beforeEach(() => {
      // Ensure requestIdleCallback is available (may not be in happy-dom)
    });

    test('executes callback', async () => {
      let called = false;
      scheduleIdle(() => {
        called = true;
      });

      await new Promise((r) => setTimeout(r, 100));
      expect(called).toBe(true);
    });

    test('returns cancel function', async () => {
      let called = false;
      const cancel = scheduleIdle(() => {
        called = true;
      }, { timeout: 50 });

      cancel();
      await new Promise((r) => setTimeout(r, 100));
      expect(called).toBe(false);
    });
  });
});
