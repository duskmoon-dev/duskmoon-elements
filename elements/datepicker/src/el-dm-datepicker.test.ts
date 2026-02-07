import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmDatepicker, register } from './index';

register();

function createDatepicker(props: Partial<ElDmDatepicker> = {}): ElDmDatepicker {
  const el = document.createElement('el-dm-datepicker') as ElDmDatepicker;
  Object.assign(el, props);
  return el;
}

describe('ElDmDatepicker', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  // --- Registration ---
  test('is defined', () => {
    expect(customElements.get('el-dm-datepicker')).toBe(ElDmDatepicker);
  });

  // --- Rendering ---
  test('creates a shadow root', () => {
    const el = createDatepicker();
    container.appendChild(el);
    expect(el.shadowRoot).toBeDefined();
  });

  test('has datepicker trigger', () => {
    const el = createDatepicker();
    container.appendChild(el);
    const trigger = el.shadowRoot?.querySelector('.datepicker-trigger');
    expect(trigger).toBeDefined();
  });

  test('has input element', () => {
    const el = createDatepicker();
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input).toBeDefined();
  });

  test('has calendar icon', () => {
    const el = createDatepicker();
    container.appendChild(el);
    const icon = el.shadowRoot?.querySelector('.datepicker-icon');
    expect(icon).toBeDefined();
  });

  test('has dropdown element', () => {
    const el = createDatepicker();
    container.appendChild(el);
    const dropdown = el.shadowRoot?.querySelector('.datepicker-dropdown');
    expect(dropdown).toBeDefined();
  });

  // --- Properties ---
  test('reflects value attribute', () => {
    const el = createDatepicker({ value: '2025-01-15' });
    container.appendChild(el);
    expect(el.getAttribute('value')).toBe('2025-01-15');
  });

  test('reflects disabled attribute', () => {
    const el = createDatepicker({ disabled: true });
    container.appendChild(el);
    expect(el.hasAttribute('disabled')).toBe(true);
  });

  test('reflects placeholder attribute', () => {
    const el = createDatepicker({ placeholder: 'Pick a date' });
    container.appendChild(el);
    expect(el.getAttribute('placeholder')).toBe('Pick a date');
  });

  test('defaults placeholder to "Select date"', () => {
    const el = createDatepicker();
    container.appendChild(el);
    expect(el.placeholder).toBe('Select date');
  });

  test('reflects format attribute', () => {
    const el = createDatepicker({ format: 'MM/DD/YYYY' });
    container.appendChild(el);
    expect(el.getAttribute('format')).toBe('MM/DD/YYYY');
  });

  test('defaults format to YYYY-MM-DD', () => {
    const el = createDatepicker();
    container.appendChild(el);
    expect(el.format).toBe('YYYY-MM-DD');
  });

  test('reflects minDate attribute', () => {
    const el = createDatepicker({ minDate: '2025-01-01' });
    container.appendChild(el);
    expect(el.getAttribute('min-date')).toBe('2025-01-01');
  });

  test('reflects maxDate attribute', () => {
    const el = createDatepicker({ maxDate: '2025-12-31' });
    container.appendChild(el);
    expect(el.getAttribute('max-date')).toBe('2025-12-31');
  });

  test('reflects range attribute', () => {
    const el = createDatepicker({ range: true });
    container.appendChild(el);
    expect(el.hasAttribute('range')).toBe(true);
  });

  test('reflects showTime attribute', () => {
    const el = createDatepicker({ showTime: true });
    container.appendChild(el);
    expect(el.hasAttribute('show-time')).toBe(true);
  });

  test('reflects size attribute', () => {
    const el = createDatepicker({ size: 'lg' } as Partial<ElDmDatepicker>);
    container.appendChild(el);
    expect(el.getAttribute('size')).toBe('lg');
  });

  test('defaults size to md', () => {
    const el = createDatepicker();
    container.appendChild(el);
    expect(el.size).toBe('md');
  });

  // --- Input ---
  test('input is readonly', () => {
    const el = createDatepicker();
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.hasAttribute('readonly')).toBe(true);
  });

  test('input gets placeholder', () => {
    const el = createDatepicker({ placeholder: 'Choose date' });
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('placeholder')).toBe('Choose date');
  });

  test('input is disabled when component disabled', () => {
    const el = createDatepicker({ disabled: true });
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.hasAttribute('disabled')).toBe(true);
  });

  // --- Calendar ---
  test('has calendar header', () => {
    const el = createDatepicker();
    container.appendChild(el);
    const header = el.shadowRoot?.querySelector('.datepicker-header');
    expect(header).toBeDefined();
  });

  test('has prev/next navigation buttons', () => {
    const el = createDatepicker();
    container.appendChild(el);
    const prevBtn = el.shadowRoot?.querySelector('.datepicker-prev');
    const nextBtn = el.shadowRoot?.querySelector('.datepicker-next');
    expect(prevBtn).toBeDefined();
    expect(nextBtn).toBeDefined();
  });

  test('has header title for month/year', () => {
    const el = createDatepicker();
    container.appendChild(el);
    const title = el.shadowRoot?.querySelector('.datepicker-title');
    expect(title).toBeDefined();
  });

  test('has weekday headers', () => {
    const el = createDatepicker();
    container.appendChild(el);
    const weekdays = el.shadowRoot?.querySelectorAll('.datepicker-weekday');
    expect(weekdays?.length).toBe(7);
  });

  test('has day cells', () => {
    const el = createDatepicker();
    container.appendChild(el);
    const days = el.shadowRoot?.querySelectorAll('.datepicker-day');
    expect((days?.length ?? 0) >= 28).toBe(true);
  });

  // --- Size classes ---
  test('applies sm size class on .datepicker', () => {
    const el = createDatepicker({ size: 'sm' } as Partial<ElDmDatepicker>);
    container.appendChild(el);
    const dp = el.shadowRoot?.querySelector('.datepicker');
    expect(dp?.classList.contains('datepicker-sm')).toBe(true);
  });

  test('applies lg size class on .datepicker', () => {
    const el = createDatepicker({ size: 'lg' } as Partial<ElDmDatepicker>);
    container.appendChild(el);
    const dp = el.shadowRoot?.querySelector('.datepicker');
    expect(dp?.classList.contains('datepicker-lg')).toBe(true);
  });

  // --- Today ---
  test('marks today with today class', () => {
    const el = createDatepicker();
    container.appendChild(el);
    const today = el.shadowRoot?.querySelector('.datepicker-day.today');
    expect(today).toBeDefined();
  });

  // --- Disabled state ---
  test('input is disabled when disabled prop set', () => {
    const el = createDatepicker({ disabled: true });
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.hasAttribute('disabled')).toBe(true);
  });
});
