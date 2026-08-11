import { BaseElement, css } from '@duskmoon-dev/el-base';

export const DEFAULT_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm';

interface DateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

interface ParsedDateTime {
  parts: DateTimeParts;
  instant?: Date;
}

const ISO_DATETIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?(Z|[+-]\d{2}:\d{2})?)?$/;
const FORMAT_TOKEN_PATTERN = /\[([^\]]*)\]|YYYY|SSS|YY|MM|DD|HH|hh|mm|ss|M|D|H|h|m|s|A|a/g;

const styles = css`
  :host {
    display: inline;
  }

  :host([hidden]) {
    display: none;
  }
`;

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function parseIsoDateTime(value: string): ParsedDateTime | undefined {
  const match = ISO_DATETIME_PATTERN.exec(value);
  if (!match) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4] ?? 0);
  const minute = Number(match[5] ?? 0);
  const second = Number(match[6] ?? 0);
  const millisecond = Number((match[7] ?? '').slice(0, 3).padEnd(3, '0') || 0);
  const offset = match[8];

  if (
    year < 1 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth(year, month) ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    return undefined;
  }

  const parts = { year, month, day, hour, minute, second, millisecond };
  if (!offset) return { parts };

  let offsetMinutes = 0;
  if (offset !== 'Z') {
    const offsetHours = Number(offset.slice(1, 3));
    const offsetRemainder = Number(offset.slice(4, 6));
    if (offsetHours > 23 || offsetRemainder > 59) return undefined;

    const direction = offset[0] === '+' ? 1 : -1;
    offsetMinutes = direction * (offsetHours * 60 + offsetRemainder);
  }

  const utc = new Date(0);
  utc.setUTCFullYear(year, month - 1, day);
  utc.setUTCHours(hour, minute, second, millisecond);

  return {
    parts,
    instant: new Date(utc.getTime() - offsetMinutes * 60_000),
  };
}

function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone) return true;

  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

function partsForInstant(date: Date, timeZone: string): DateTimeParts | undefined {
  if (!timeZone) {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      millisecond: date.getMilliseconds(),
    };
  }

  try {
    const parts = new Intl.DateTimeFormat('en-US-u-ca-gregory-nu-latn', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date);
    const values = new Map(parts.map(({ type, value }) => [type, value]));

    return {
      year: Number(values.get('year')),
      month: Number(values.get('month')),
      day: Number(values.get('day')),
      hour: Number(values.get('hour')),
      minute: Number(values.get('minute')),
      second: Number(values.get('second')),
      millisecond: date.getMilliseconds(),
    };
  } catch {
    return undefined;
  }
}

function formatDateTime(parts: DateTimeParts, format: string): string {
  const hour12 = parts.hour % 12 || 12;
  const meridiem = parts.hour < 12 ? 'AM' : 'PM';
  const tokens: Record<string, string> = {
    YYYY: String(parts.year).padStart(4, '0'),
    YY: String(parts.year % 100).padStart(2, '0'),
    M: String(parts.month),
    MM: String(parts.month).padStart(2, '0'),
    D: String(parts.day),
    DD: String(parts.day).padStart(2, '0'),
    H: String(parts.hour),
    HH: String(parts.hour).padStart(2, '0'),
    h: String(hour12),
    hh: String(hour12).padStart(2, '0'),
    m: String(parts.minute),
    mm: String(parts.minute).padStart(2, '0'),
    s: String(parts.second),
    ss: String(parts.second).padStart(2, '0'),
    SSS: String(parts.millisecond).padStart(3, '0'),
    A: meridiem,
    a: meridiem.toLowerCase(),
  };

  return format.replace(
    FORMAT_TOKEN_PATTERN,
    (match: string, literal: string | undefined) => literal ?? tokens[match] ?? match,
  );
}

function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return value.replace(/[&<>"']/g, (character) => entities[character]);
}

/** Display an ISO date or datetime using a token-based format. */
export class ElDmDatetime extends BaseElement {
  static properties = {
    value: { type: String, reflect: true, default: '' },
    format: { type: String, reflect: true, default: DEFAULT_DATETIME_FORMAT },
    timeZone: { type: String, reflect: true, default: '' },
  };

  declare value: string;
  declare format: string;
  declare timeZone: string;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  protected render(): string {
    const value = this.value ?? '';
    const format = this.format ?? DEFAULT_DATETIME_FORMAT;
    const timeZone = this.timeZone ?? '';
    const parsed = value ? parseIsoDateTime(value) : undefined;

    if (!parsed || !isValidTimeZone(timeZone)) {
      return '<time part="time"></time>';
    }

    const parts = parsed.instant ? partsForInstant(parsed.instant, timeZone) : parsed.parts;
    if (!parts) return '<time part="time"></time>';

    return `<time part="time" datetime="${escapeHtml(value)}">${escapeHtml(formatDateTime(parts, format))}</time>`;
  }
}
