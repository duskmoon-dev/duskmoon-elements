import { afterEach, describe, expect, test } from 'bun:test';
import { ElDmDatetime, register } from './index.js';

register();

function createDatetime(attributes: Record<string, string> = {}): ElDmDatetime {
  const element = document.createElement('el-dm-datetime') as ElDmDatetime;

  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }

  document.body.appendChild(element);
  return element;
}

function getTimeElement(element: ElDmDatetime): HTMLTimeElement {
  const time = element.shadowRoot?.querySelector('time');
  expect(time).not.toBeNull();
  return time as HTMLTimeElement;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('ElDmDatetime', () => {
  describe('registration', () => {
    test('registers el-dm-datetime idempotently', () => {
      expect(customElements.get('el-dm-datetime')).toBe(ElDmDatetime);
      expect(() => register()).not.toThrow();
    });
  });

  describe('semantics', () => {
    test('renders a display-only time element', () => {
      const element = createDatetime({ value: '2024-02-03T16:05:06' });
      const time = getTimeElement(element);

      expect(time.getAttribute('part')).toBe('time');
      expect(time.getAttribute('datetime')).toBe('2024-02-03T16:05:06');
      expect(element.shadowRoot?.querySelector('input, button, [role="button"]')).toBeNull();
    });

    test('renders empty content when value is empty', () => {
      const time = getTimeElement(createDatetime());

      expect(time.textContent).toBe('');
      expect(time.hasAttribute('datetime')).toBe(false);
    });
  });

  describe('properties', () => {
    test('provides and reflects the public properties', () => {
      const element = createDatetime();

      expect(element.value).toBe('');
      expect(element.format).toBe('YYYY-MM-DD HH:mm');
      expect(element.timeZone).toBe('');

      element.value = '2024-02-03T16:05:06Z';
      element.format = 'DD/MM/YYYY';
      element.timeZone = 'UTC';

      expect(element.getAttribute('value')).toBe('2024-02-03T16:05:06Z');
      expect(element.getAttribute('format')).toBe('DD/MM/YYYY');
      expect(element.getAttribute('time-zone')).toBe('UTC');
    });
  });

  describe('formatting', () => {
    test('formats every supported token', () => {
      const element = createDatetime({
        value: '2024-02-03T16:05:06.007',
        format: 'YYYY YY M MM D DD H HH h hh m mm s ss SSS A a',
      });

      expect(getTimeElement(element).textContent).toBe(
        '2024 24 2 02 3 03 16 16 4 04 5 05 6 06 007 PM pm',
      );
    });

    test('accepts backend timestamps with microsecond precision', () => {
      const microseconds = createDatetime({
        value: '2024-02-03T16:05:06.123456Z',
        format: 'YYYY-MM-DD HH:mm:ss.SSS',
        'time-zone': 'UTC',
      });
      const tenths = createDatetime({
        value: '2024-02-03T16:05:06.1Z',
        format: 'ss.SSS',
        'time-zone': 'UTC',
      });

      expect(getTimeElement(microseconds).textContent).toBe('2024-02-03 16:05:06.123');
      expect(getTimeElement(tenths).textContent).toBe('06.100');
    });

    test('replaces repeated tokens and preserves bracketed literals', () => {
      const element = createDatetime({
        value: '2024-02-03T16:05:06',
        format: '[Today at] h:mm A [on] YYYY/YYYY MM/MM DD/DD',
      });

      expect(getTimeElement(element).textContent).toBe('Today at 4:05 PM on 2024/2024 02/02 03/03');
    });

    test('formats midnight and noon in twelve-hour time', () => {
      const midnight = createDatetime({
        value: '2024-02-03T00:00:00',
        format: 'h hh A a',
      });
      const noon = createDatetime({
        value: '2024-02-03T12:00:00',
        format: 'h hh A a',
      });

      expect(getTimeElement(midnight).textContent).toBe('12 12 AM am');
      expect(getTimeElement(noon).textContent).toBe('12 12 PM pm');
    });

    test('keeps date-only and zone-less values as wall-clock values', () => {
      const date = createDatetime({
        value: '2024-02-29',
        format: 'YYYY-MM-DD HH:mm:ss',
        'time-zone': 'Asia/Shanghai',
      });
      const datetime = createDatetime({
        value: '2024-02-03T16:05:06',
        format: 'YYYY-MM-DD HH:mm:ss',
        'time-zone': 'UTC',
      });

      expect(getTimeElement(date).textContent).toBe('2024-02-29 00:00:00');
      expect(getTimeElement(datetime).textContent).toBe('2024-02-03 16:05:06');
    });

    test('projects explicit offsets into the requested time zone', () => {
      const positiveOffset = createDatetime({
        value: '2024-02-03T16:05:06+08:00',
        format: 'YYYY-MM-DD HH:mm:ss',
        'time-zone': 'UTC',
      });
      const negativeOffset = createDatetime({
        value: '2024-02-03T23:05:06-02:00',
        format: 'YYYY-MM-DD HH:mm:ss',
        'time-zone': 'UTC',
      });

      expect(getTimeElement(positiveOffset).textContent).toBe('2024-02-03 08:05:06');
      expect(getTimeElement(negativeOffset).textContent).toBe('2024-02-04 01:05:06');
    });

    test('projects UTC instants into an IANA time zone', () => {
      const element = createDatetime({
        value: '2024-02-03T16:05:06Z',
        format: 'YYYY-MM-DD HH:mm:ss',
        'time-zone': 'Asia/Shanghai',
      });

      expect(getTimeElement(element).textContent).toBe('2024-02-04 00:05:06');
    });
  });

  describe('invalid input', () => {
    test('rejects invalid dates and browser-dependent date strings', () => {
      const impossibleDate = createDatetime({ value: '2023-02-29' });
      const ambiguousDate = createDatetime({ value: '02/03/2024' });

      expect(getTimeElement(impossibleDate).textContent).toBe('');
      expect(getTimeElement(impossibleDate).hasAttribute('datetime')).toBe(false);
      expect(getTimeElement(ambiguousDate).textContent).toBe('');
      expect(getTimeElement(ambiguousDate).hasAttribute('datetime')).toBe(false);
    });

    test('renders empty content for an invalid time zone', () => {
      const time = getTimeElement(
        createDatetime({
          value: '2024-02-03T16:05:06Z',
          'time-zone': 'Not/A_Time_Zone',
        }),
      );

      expect(time.textContent).toBe('');
      expect(time.hasAttribute('datetime')).toBe(false);
    });
  });

  describe('reactivity', () => {
    test('updates when value, format, and time-zone change', async () => {
      const element = createDatetime({
        value: '2024-02-03T16:05:06Z',
        format: 'YYYY-MM-DD HH:mm',
        'time-zone': 'UTC',
      });

      element.value = '2024-02-04T01:06:07Z';
      element.format = 'DD/MM/YYYY [at] h:mm A';
      element.timeZone = 'Asia/Shanghai';
      await Promise.resolve();

      expect(getTimeElement(element).textContent).toBe('04/02/2024 at 9:06 AM');
      expect(getTimeElement(element).getAttribute('datetime')).toBe('2024-02-04T01:06:07Z');
    });

    test('clears stale output when a valid value becomes invalid', async () => {
      const element = createDatetime({ value: '2024-02-03T16:05:06' });
      expect(getTimeElement(element).textContent).not.toBe('');

      element.setAttribute('value', 'not-a-date');
      await Promise.resolve();

      expect(getTimeElement(element).textContent).toBe('');
      expect(getTimeElement(element).hasAttribute('datetime')).toBe(false);
    });
  });

  describe('escaping', () => {
    test('renders hostile format literals as text', () => {
      const element = createDatetime({
        value: '2024-02-03T16:05:06',
        format: '[<img src=x onerror=alert(1)>] YYYY',
      });
      const time = getTimeElement(element);

      expect(time.textContent).toBe('<img src=x onerror=alert(1)> 2024');
      expect(element.shadowRoot?.querySelector('img, script')).toBeNull();
    });

    test('does not inject invalid values into the shadow tree', () => {
      const element = createDatetime({ value: '"><img src=x onerror=alert(1)>' });
      const time = getTimeElement(element);

      expect(time.textContent).toBe('');
      expect(time.hasAttribute('datetime')).toBe(false);
      expect(element.shadowRoot?.querySelector('img, script')).toBeNull();
    });
  });
});
