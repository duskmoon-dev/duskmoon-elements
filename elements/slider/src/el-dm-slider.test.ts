import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmSlider, register } from './index';

register();

// Helper to create keyboard events in happy-dom
function createKeyboardEvent(key: string): KeyboardEvent {
  const event = new Event('keydown', { bubbles: true }) as KeyboardEvent;
  Object.defineProperty(event, 'key', { value: key, writable: false });
  Object.defineProperty(event, 'preventDefault', {
    value: () => {},
    writable: false,
  });
  return event;
}

// Helper to create mouse events with clientX
function createMouseEvent(
  type: string,
  clientX: number,
  options: EventInit = {},
): MouseEvent {
  const event = new Event(type, {
    bubbles: true,
    ...options,
  }) as MouseEvent;
  Object.defineProperty(event, 'clientX', { value: clientX, writable: false });
  Object.defineProperty(event, 'preventDefault', {
    value: () => {},
    writable: false,
  });
  return event;
}

describe('ElDmSlider', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  function createSlider(attrs: Record<string, unknown> = {}): ElDmSlider {
    const el = document.createElement('el-dm-slider') as ElDmSlider;
    for (const [key, val] of Object.entries(attrs)) {
      if (key === 'showValue') {
        (el as unknown as Record<string, unknown>).showValue = val;
      } else {
        (el as unknown as Record<string, unknown>)[key] = val;
      }
    }
    container.appendChild(el);
    return el;
  }

  // ──────────────── Registration ────────────────
  test('is defined', () => {
    expect(customElements.get('el-dm-slider')).toBe(ElDmSlider);
  });

  // ──────────────── Rendering ────────────────
  describe('rendering', () => {
    test('creates a shadow root with slider role', () => {
      const el = createSlider();
      const slider = el.shadowRoot?.querySelector('[role="slider"]');
      expect(slider).toBeDefined();
    });

    test('renders track and thumb', () => {
      const el = createSlider();
      const track = el.shadowRoot?.querySelector('.slider-track');
      const thumb = el.shadowRoot?.querySelector('.slider-thumb');
      expect(track).toBeDefined();
      expect(thumb).toBeDefined();
    });

    test('renders filled track', () => {
      const el = createSlider({ value: 50 });
      const filled = el.shadowRoot?.querySelector(
        '.slider-track-filled',
      ) as HTMLElement;
      expect(filled).toBeDefined();
      expect(filled.style.width).toBe('50%');
    });

    test('renders thumb label', () => {
      const el = createSlider({ value: 42 });
      const label = el.shadowRoot?.querySelector('.slider-thumb-label');
      expect(label).toBeDefined();
      expect(label?.textContent).toBe('42');
    });
  });

  // ──────────────── ARIA Attributes ────────────────
  describe('ARIA attributes', () => {
    test('sets aria-valuemin and aria-valuemax', () => {
      const el = createSlider({ min: 10, max: 200 });
      const slider = el.shadowRoot?.querySelector('[role="slider"]');
      expect(slider?.getAttribute('aria-valuemin')).toBe('10');
      expect(slider?.getAttribute('aria-valuemax')).toBe('200');
    });

    test('sets aria-valuenow', () => {
      const el = createSlider({ value: 50 });
      const slider = el.shadowRoot?.querySelector('[role="slider"]');
      expect(slider?.getAttribute('aria-valuenow')).toBe('50');
    });

    test('tabindex is 0 by default', () => {
      const el = createSlider();
      const slider = el.shadowRoot?.querySelector('[role="slider"]');
      expect(slider?.getAttribute('tabindex')).toBe('0');
    });

    test('tabindex is -1 when disabled', () => {
      const el = createSlider({ disabled: true });
      const slider = el.shadowRoot?.querySelector('[role="slider"]');
      expect(slider?.getAttribute('tabindex')).toBe('-1');
    });
  });

  // ──────────────── Properties & Defaults ────────────────
  describe('properties', () => {
    test('has correct defaults', () => {
      const el = createSlider();
      expect(el.value).toBe(0);
      expect(el.min).toBe(0);
      expect(el.max).toBe(100);
      expect(el.step).toBe(1);
      expect(el.disabled).toBeFalsy();
      expect(el.color).toBe('primary');
    });

    test('reflects value to attribute', () => {
      const el = createSlider({ value: 75 });
      expect(el.getAttribute('value')).toBe('75');
    });

    test('reflects min and max to attributes', () => {
      const el = createSlider({ min: 5, max: 50 });
      expect(el.getAttribute('min')).toBe('5');
      expect(el.getAttribute('max')).toBe('50');
    });

    test('reflects step to attribute', () => {
      const el = createSlider({ step: 5 });
      expect(el.getAttribute('step')).toBe('5');
    });

    test('reflects disabled to attribute', () => {
      const el = createSlider({ disabled: true });
      expect(el.hasAttribute('disabled')).toBe(true);
    });

    test('reflects color to attribute', () => {
      const el = createSlider({ color: 'error' });
      expect(el.getAttribute('color')).toBe('error');
    });
  });

  // ──────────────── Size Classes ────────────────
  describe('sizes', () => {
    test('applies small size class', () => {
      const el = createSlider({ size: 'sm' });
      const slider = el.shadowRoot?.querySelector('.slider');
      expect(slider?.classList.contains('slider-sm')).toBe(true);
    });

    test('applies large size class', () => {
      const el = createSlider({ size: 'lg' });
      const slider = el.shadowRoot?.querySelector('.slider');
      expect(slider?.classList.contains('slider-lg')).toBe(true);
    });

    test('medium size has no extra class', () => {
      const el = createSlider({ size: 'md' });
      const slider = el.shadowRoot?.querySelector('.slider');
      expect(slider?.classList.contains('slider-sm')).toBe(false);
      expect(slider?.classList.contains('slider-lg')).toBe(false);
    });
  });

  // ──────────────── Color Classes ────────────────
  describe('colors', () => {
    const colors = [
      'secondary',
      'tertiary',
      'success',
      'warning',
      'error',
      'info',
    ] as const;

    for (const color of colors) {
      test(`applies ${color} color class`, () => {
        const el = createSlider({ color });
        const slider = el.shadowRoot?.querySelector('.slider');
        expect(slider?.classList.contains(`slider-${color}`)).toBe(true);
      });
    }

    test('primary color has no extra class', () => {
      const el = createSlider({ color: 'primary' });
      const slider = el.shadowRoot?.querySelector('.slider');
      expect(slider?.classList.contains('slider-primary')).toBe(false);
    });
  });

  // ──────────────── Show Value ────────────────
  describe('show-value', () => {
    test('adds show-value class when showValue is true', () => {
      const el = createSlider({ showValue: true, value: 42 });
      const slider = el.shadowRoot?.querySelector('.slider');
      expect(slider?.classList.contains('show-value')).toBe(true);
    });

    test('does not add show-value class by default', () => {
      const el = createSlider();
      const slider = el.shadowRoot?.querySelector('.slider');
      expect(slider?.classList.contains('show-value')).toBe(false);
    });
  });

  // ──────────────── Percentage Calculation ────────────────
  describe('percentage calculation', () => {
    test('0% at min value', () => {
      const el = createSlider({ min: 0, max: 100, value: 0 });
      const filled = el.shadowRoot?.querySelector(
        '.slider-track-filled',
      ) as HTMLElement;
      expect(filled.style.width).toBe('0%');
    });

    test('100% at max value', () => {
      const el = createSlider({ min: 0, max: 100, value: 100 });
      const filled = el.shadowRoot?.querySelector(
        '.slider-track-filled',
      ) as HTMLElement;
      expect(filled.style.width).toBe('100%');
    });

    test('50% at midpoint', () => {
      const el = createSlider({ min: 0, max: 200, value: 100 });
      const filled = el.shadowRoot?.querySelector(
        '.slider-track-filled',
      ) as HTMLElement;
      expect(filled.style.width).toBe('50%');
    });

    test('handles custom min/max ranges', () => {
      const el = createSlider({ min: 10, max: 110, value: 60 });
      const filled = el.shadowRoot?.querySelector(
        '.slider-track-filled',
      ) as HTMLElement;
      expect(filled.style.width).toBe('50%');
    });

    test('handles zero range gracefully', () => {
      const el = createSlider({ min: 50, max: 50, value: 50 });
      const filled = el.shadowRoot?.querySelector(
        '.slider-track-filled',
      ) as HTMLElement;
      expect(filled.style.width).toBe('0%');
    });
  });

  // ──────────────── Keyboard Interaction ────────────────
  describe('keyboard interaction', () => {
    test('ArrowRight increments by step', () => {
      const el = createSlider({ value: 50, step: 1 });
      const slider = el.shadowRoot?.querySelector('.slider')!;
      slider.dispatchEvent(createKeyboardEvent('ArrowRight'));
      expect(el.value).toBe(51);
    });

    test('ArrowUp increments by step', () => {
      const el = createSlider({ value: 50, step: 5 });
      const slider = el.shadowRoot?.querySelector('.slider')!;
      slider.dispatchEvent(createKeyboardEvent('ArrowUp'));
      expect(el.value).toBe(55);
    });

    test('ArrowLeft decrements by step', () => {
      const el = createSlider({ value: 50, step: 1 });
      const slider = el.shadowRoot?.querySelector('.slider')!;
      slider.dispatchEvent(createKeyboardEvent('ArrowLeft'));
      expect(el.value).toBe(49);
    });

    test('ArrowDown decrements by step', () => {
      const el = createSlider({ value: 50, step: 10 });
      const slider = el.shadowRoot?.querySelector('.slider')!;
      slider.dispatchEvent(createKeyboardEvent('ArrowDown'));
      expect(el.value).toBe(40);
    });

    test('does not go below min', () => {
      const el = createSlider({ value: 0, min: 0, step: 1 });
      const slider = el.shadowRoot?.querySelector('.slider')!;
      slider.dispatchEvent(createKeyboardEvent('ArrowLeft'));
      expect(el.value).toBe(0);
    });

    test('does not go above max', () => {
      const el = createSlider({ value: 100, max: 100, step: 1 });
      const slider = el.shadowRoot?.querySelector('.slider')!;
      slider.dispatchEvent(createKeyboardEvent('ArrowRight'));
      expect(el.value).toBe(100);
    });

    test('Home sets to min', () => {
      const el = createSlider({ value: 75, min: 10 });
      const slider = el.shadowRoot?.querySelector('.slider')!;
      slider.dispatchEvent(createKeyboardEvent('Home'));
      expect(el.value).toBe(10);
    });

    test('End sets to max', () => {
      const el = createSlider({ value: 25, max: 200 });
      const slider = el.shadowRoot?.querySelector('.slider')!;
      slider.dispatchEvent(createKeyboardEvent('End'));
      expect(el.value).toBe(200);
    });

    test('PageUp increments by 10% of range', () => {
      const el = createSlider({ value: 50, min: 0, max: 100 });
      const slider = el.shadowRoot?.querySelector('.slider')!;
      slider.dispatchEvent(createKeyboardEvent('PageUp'));
      expect(el.value).toBe(60);
    });

    test('PageDown decrements by 10% of range', () => {
      const el = createSlider({ value: 50, min: 0, max: 100 });
      const slider = el.shadowRoot?.querySelector('.slider')!;
      slider.dispatchEvent(createKeyboardEvent('PageDown'));
      expect(el.value).toBe(40);
    });

    test('ignores keyboard when disabled', () => {
      const el = createSlider({ value: 50, disabled: true });
      const slider = el.shadowRoot?.querySelector('.slider')!;
      slider.dispatchEvent(createKeyboardEvent('ArrowRight'));
      expect(el.value).toBe(50);
    });

    test('ignores unrelated keys', () => {
      const el = createSlider({ value: 50 });
      const slider = el.shadowRoot?.querySelector('.slider')!;
      slider.dispatchEvent(createKeyboardEvent('Enter'));
      expect(el.value).toBe(50);
    });

    test('emits input event on keyboard change', () => {
      const el = createSlider({ value: 50 });
      const slider = el.shadowRoot?.querySelector('.slider')!;
      let inputFired = false;
      el.addEventListener('input', () => {
        inputFired = true;
      });
      slider.dispatchEvent(createKeyboardEvent('ArrowRight'));
      expect(inputFired).toBe(true);
    });

    test('emits change event on keyboard change', () => {
      const el = createSlider({ value: 50 });
      const slider = el.shadowRoot?.querySelector('.slider')!;
      let changeFired = false;
      el.addEventListener('change', () => {
        changeFired = true;
      });
      slider.dispatchEvent(createKeyboardEvent('ArrowRight'));
      expect(changeFired).toBe(true);
    });

    test('does not emit events when value unchanged (at boundary)', () => {
      const el = createSlider({ value: 100, max: 100 });
      const slider = el.shadowRoot?.querySelector('.slider')!;
      let eventFired = false;
      el.addEventListener('input', () => {
        eventFired = true;
      });
      slider.dispatchEvent(createKeyboardEvent('ArrowRight'));
      expect(eventFired).toBe(false);
    });
  });

  // ──────────────── Mouse / Track Click ────────────────
  describe('track click', () => {
    test('updates value on track click', () => {
      const el = createSlider({ min: 0, max: 100, value: 0 });
      const track = el.shadowRoot?.querySelector('.slider-track')!;

      // Mock getBoundingClientRect for happy-dom
      track.getBoundingClientRect = () =>
        ({
          left: 0,
          right: 200,
          width: 200,
          top: 0,
          bottom: 40,
          height: 40,
          x: 0,
          y: 0,
          toJSON: () => {},
        }) as DOMRect;

      track.dispatchEvent(createMouseEvent('click', 100));
      expect(el.value).toBe(50);
    });

    test('snaps to nearest step on track click', () => {
      const el = createSlider({ min: 0, max: 100, value: 0, step: 10 });
      const track = el.shadowRoot?.querySelector('.slider-track')!;

      track.getBoundingClientRect = () =>
        ({
          left: 0,
          right: 200,
          width: 200,
          top: 0,
          bottom: 40,
          height: 40,
          x: 0,
          y: 0,
          toJSON: () => {},
        }) as DOMRect;

      // Click at 45% → should snap to 50
      track.dispatchEvent(createMouseEvent('click', 90));
      expect(el.value).toBe(50);
    });

    test('clamps to min/max on track click', () => {
      const el = createSlider({ min: 0, max: 100, value: 50 });
      const track = el.shadowRoot?.querySelector('.slider-track')!;

      track.getBoundingClientRect = () =>
        ({
          left: 0,
          right: 200,
          width: 200,
          top: 0,
          bottom: 40,
          height: 40,
          x: 0,
          y: 0,
          toJSON: () => {},
        }) as DOMRect;

      // Click past the right edge
      track.dispatchEvent(createMouseEvent('click', 300));
      expect(el.value).toBe(100);
    });

    test('emits input and change events on track click', () => {
      const el = createSlider({ min: 0, max: 100, value: 0 });
      const track = el.shadowRoot?.querySelector('.slider-track')!;

      track.getBoundingClientRect = () =>
        ({
          left: 0,
          right: 200,
          width: 200,
          top: 0,
          bottom: 40,
          height: 40,
          x: 0,
          y: 0,
          toJSON: () => {},
        }) as DOMRect;

      let inputFired = false;
      let changeFired = false;
      el.addEventListener('input', () => {
        inputFired = true;
      });
      el.addEventListener('change', () => {
        changeFired = true;
      });

      track.dispatchEvent(createMouseEvent('click', 100));
      expect(inputFired).toBe(true);
      expect(changeFired).toBe(true);
    });

    test('ignores track click when disabled', () => {
      const el = createSlider({
        min: 0,
        max: 100,
        value: 50,
        disabled: true,
      });
      const track = el.shadowRoot?.querySelector('.slider-track')!;

      track.getBoundingClientRect = () =>
        ({
          left: 0,
          right: 200,
          width: 200,
          top: 0,
          bottom: 40,
          height: 40,
          x: 0,
          y: 0,
          toJSON: () => {},
        }) as DOMRect;

      track.dispatchEvent(createMouseEvent('click', 100));
      expect(el.value).toBe(50);
    });

    test('does not emit events when click lands on current value', () => {
      const el = createSlider({ min: 0, max: 100, value: 50 });
      const track = el.shadowRoot?.querySelector('.slider-track')!;

      track.getBoundingClientRect = () =>
        ({
          left: 0,
          right: 200,
          width: 200,
          top: 0,
          bottom: 40,
          height: 40,
          x: 0,
          y: 0,
          toJSON: () => {},
        }) as DOMRect;

      let eventFired = false;
      el.addEventListener('change', () => {
        eventFired = true;
      });

      track.dispatchEvent(createMouseEvent('click', 100));
      expect(eventFired).toBe(false);
    });
  });

  // ──────────────── Mouse Drag (Thumb) ────────────────
  describe('thumb drag', () => {
    test('starts drag on mousedown', () => {
      const el = createSlider({ min: 0, max: 100, value: 50 });
      const thumb = el.shadowRoot?.querySelector('.slider-thumb')!;
      const track = el.shadowRoot?.querySelector('.slider-track')!;

      track.getBoundingClientRect = () =>
        ({
          left: 0,
          right: 200,
          width: 200,
          top: 0,
          bottom: 40,
          height: 40,
          x: 0,
          y: 0,
          toJSON: () => {},
        }) as DOMRect;

      thumb.dispatchEvent(createMouseEvent('mousedown', 100));

      // Simulate mousemove on document to 75%
      document.dispatchEvent(createMouseEvent('mousemove', 150));
      expect(el.value).toBe(75);
    });

    test('emits input during drag', () => {
      const el = createSlider({ min: 0, max: 100, value: 50 });
      const thumb = el.shadowRoot?.querySelector('.slider-thumb')!;
      const track = el.shadowRoot?.querySelector('.slider-track')!;

      track.getBoundingClientRect = () =>
        ({
          left: 0,
          right: 200,
          width: 200,
          top: 0,
          bottom: 40,
          height: 40,
          x: 0,
          y: 0,
          toJSON: () => {},
        }) as DOMRect;

      const inputValues: number[] = [];
      el.addEventListener('input', ((e: CustomEvent) => {
        inputValues.push(e.detail.value);
      }) as EventListener);

      thumb.dispatchEvent(createMouseEvent('mousedown', 100));
      document.dispatchEvent(createMouseEvent('mousemove', 120));
      document.dispatchEvent(createMouseEvent('mousemove', 150));

      expect(inputValues).toContain(60);
      expect(inputValues).toContain(75);
    });

    test('emits change on mouseup after drag', () => {
      const el = createSlider({ min: 0, max: 100, value: 50 });
      const thumb = el.shadowRoot?.querySelector('.slider-thumb')!;
      const track = el.shadowRoot?.querySelector('.slider-track')!;

      track.getBoundingClientRect = () =>
        ({
          left: 0,
          right: 200,
          width: 200,
          top: 0,
          bottom: 40,
          height: 40,
          x: 0,
          y: 0,
          toJSON: () => {},
        }) as DOMRect;

      let changeFired = false;
      el.addEventListener('change', () => {
        changeFired = true;
      });

      thumb.dispatchEvent(createMouseEvent('mousedown', 100));
      document.dispatchEvent(createMouseEvent('mousemove', 150));
      document.dispatchEvent(createMouseEvent('mouseup', 150));

      expect(changeFired).toBe(true);
    });

    test('stops tracking after mouseup', () => {
      const el = createSlider({ min: 0, max: 100, value: 50 });
      const thumb = el.shadowRoot?.querySelector('.slider-thumb')!;
      const track = el.shadowRoot?.querySelector('.slider-track')!;

      track.getBoundingClientRect = () =>
        ({
          left: 0,
          right: 200,
          width: 200,
          top: 0,
          bottom: 40,
          height: 40,
          x: 0,
          y: 0,
          toJSON: () => {},
        }) as DOMRect;

      thumb.dispatchEvent(createMouseEvent('mousedown', 100));
      document.dispatchEvent(createMouseEvent('mousemove', 150));
      document.dispatchEvent(createMouseEvent('mouseup', 150));

      // Further mousemove should not change value
      document.dispatchEvent(createMouseEvent('mousemove', 50));
      expect(el.value).toBe(75);
    });

    test('ignores mousedown when disabled', () => {
      const el = createSlider({
        min: 0,
        max: 100,
        value: 50,
        disabled: true,
      });
      const thumb = el.shadowRoot?.querySelector('.slider-thumb')!;
      const track = el.shadowRoot?.querySelector('.slider-track')!;

      track.getBoundingClientRect = () =>
        ({
          left: 0,
          right: 200,
          width: 200,
          top: 0,
          bottom: 40,
          height: 40,
          x: 0,
          y: 0,
          toJSON: () => {},
        }) as DOMRect;

      thumb.dispatchEvent(createMouseEvent('mousedown', 100));
      document.dispatchEvent(createMouseEvent('mousemove', 150));
      expect(el.value).toBe(50);
    });
  });

  // ──────────────── UI Update ────────────────
  describe('UI update', () => {
    test('updates filled track width on value change', () => {
      const el = createSlider({ value: 0 });
      const filled = el.shadowRoot?.querySelector(
        '.slider-track-filled',
      ) as HTMLElement;
      expect(filled.style.width).toBe('0%');

      // Change via keyboard
      const slider = el.shadowRoot?.querySelector('.slider')!;
      slider.dispatchEvent(createKeyboardEvent('End'));

      const updatedFilled = el.shadowRoot?.querySelector(
        '.slider-track-filled',
      ) as HTMLElement;
      expect(updatedFilled.style.width).toBe('100%');
    });

    test('updates thumb position on value change', () => {
      const el = createSlider({ value: 0 });
      const slider = el.shadowRoot?.querySelector('.slider')!;
      slider.dispatchEvent(createKeyboardEvent('End'));

      const thumb = el.shadowRoot?.querySelector(
        '.slider-thumb',
      ) as HTMLElement;
      expect(thumb.style.left).toBe('100%');
    });

    test('updates thumb label text on value change', () => {
      const el = createSlider({ value: 0, showValue: true });
      const slider = el.shadowRoot?.querySelector('.slider')!;
      slider.dispatchEvent(createKeyboardEvent('ArrowRight'));

      const label = el.shadowRoot?.querySelector('.slider-thumb-label');
      expect(label?.textContent).toBe('1');
    });
  });

  // ──────────────── Event Detail ────────────────
  describe('event detail', () => {
    test('input event contains value in detail', () => {
      const el = createSlider({ value: 50 });
      const slider = el.shadowRoot?.querySelector('.slider')!;

      let detail: { value: number } | null = null;
      el.addEventListener('input', ((e: CustomEvent) => {
        detail = e.detail;
      }) as EventListener);

      slider.dispatchEvent(createKeyboardEvent('ArrowRight'));
      expect(detail).toEqual({ value: 51 });
    });

    test('change event contains value in detail', () => {
      const el = createSlider({ value: 50 });
      const slider = el.shadowRoot?.querySelector('.slider')!;

      let detail: { value: number } | null = null;
      el.addEventListener('change', ((e: CustomEvent) => {
        detail = e.detail;
      }) as EventListener);

      slider.dispatchEvent(createKeyboardEvent('ArrowLeft'));
      expect(detail).toEqual({ value: 49 });
    });
  });

  // ──────────────── Edge Cases ────────────────
  describe('edge cases', () => {
    test('handles step larger than range gracefully', () => {
      const el = createSlider({ min: 0, max: 5, value: 3, step: 10 });
      const slider = el.shadowRoot?.querySelector('.slider')!;
      slider.dispatchEvent(createKeyboardEvent('ArrowRight'));
      expect(el.value).toBe(5);
    });

    test('handles negative range', () => {
      const el = createSlider({ min: -100, max: 100, value: 0 });
      const filled = el.shadowRoot?.querySelector(
        '.slider-track-filled',
      ) as HTMLElement;
      expect(filled.style.width).toBe('50%');
    });

    test('handles decimal step values', () => {
      const el = createSlider({ min: 0, max: 1, value: 0.5, step: 0.1 });
      const slider = el.shadowRoot?.querySelector('.slider')!;
      slider.dispatchEvent(createKeyboardEvent('ArrowRight'));
      // Floating point: round to reasonable precision
      expect(Math.abs(el.value - 0.6)).toBeLessThan(0.01);
    });

    test('Home when already at min does not emit', () => {
      const el = createSlider({ value: 0, min: 0 });
      const slider = el.shadowRoot?.querySelector('.slider')!;
      let eventFired = false;
      el.addEventListener('change', () => {
        eventFired = true;
      });
      slider.dispatchEvent(createKeyboardEvent('Home'));
      expect(eventFired).toBe(false);
    });

    test('End when already at max does not emit', () => {
      const el = createSlider({ value: 100, max: 100 });
      const slider = el.shadowRoot?.querySelector('.slider')!;
      let eventFired = false;
      el.addEventListener('change', () => {
        eventFired = true;
      });
      slider.dispatchEvent(createKeyboardEvent('End'));
      expect(eventFired).toBe(false);
    });
  });

  // ──────────────── Disabled State ────────────────
  describe('disabled state', () => {
    test('reflects disabled attribute', () => {
      const el = createSlider({ disabled: true });
      expect(el.hasAttribute('disabled')).toBe(true);
    });

    test('blocks all keyboard interaction', () => {
      const el = createSlider({ value: 50, disabled: true });
      const slider = el.shadowRoot?.querySelector('.slider')!;
      for (const key of [
        'ArrowRight',
        'ArrowLeft',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End',
        'PageUp',
        'PageDown',
      ]) {
        slider.dispatchEvent(createKeyboardEvent(key));
      }
      expect(el.value).toBe(50);
    });
  });
});
