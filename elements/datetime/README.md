# @duskmoon-dev/el-datetime

A display-only Web Component that formats ISO dates and datetimes as semantic `<time>`
content.

## Installation

```bash
bun add @duskmoon-dev/el-datetime
```

## Registration

```typescript
import '@duskmoon-dev/el-datetime/register';
```

Or register it explicitly:

```typescript
import { register } from '@duskmoon-dev/el-datetime';

register();
```

## Usage

```html
<el-dm-datetime
  value="2026-08-11T14:30:45Z"
  format="YYYY-MM-DD HH:mm:ss"
  time-zone="Asia/Shanghai"
></el-dm-datetime>
```

The example renders `2026-08-11 22:30:45` while retaining the original value in the
inner `<time datetime="...">` attribute.

## Attributes

| Attribute   | Type     | Default              | Description                                                                           |
| ----------- | -------- | -------------------- | ------------------------------------------------------------------------------------- |
| `value`     | `string` | `''`                 | ISO date or datetime to display                                                       |
| `format`    | `string` | `'YYYY-MM-DD HH:mm'` | Output format                                                                         |
| `time-zone` | `string` | `''`                 | IANA time zone for timestamps with `Z` or an offset; empty uses the browser time zone |

## Format tokens

| Token        | Output                                    |
| ------------ | ----------------------------------------- |
| `YYYY`, `YY` | Four- or two-digit year                   |
| `M`, `MM`    | Month without or with zero-padding        |
| `D`, `DD`    | Day without or with zero-padding          |
| `H`, `HH`    | 24-hour time without or with zero-padding |
| `h`, `hh`    | 12-hour time without or with zero-padding |
| `m`, `mm`    | Minutes without or with zero-padding      |
| `s`, `ss`    | Seconds without or with zero-padding      |
| `SSS`        | Milliseconds                              |
| `A`, `a`     | Upper- or lowercase meridiem              |

Wrap literal text in brackets so token letters are not interpreted:

```html
<el-dm-datetime value="2026-08-11T14:30:45" format="YYYY-MM-DD [at] h:mm A"></el-dm-datetime>
```

This renders `2026-08-11 at 2:30 PM`.

## Input and time-zone behavior

- Accepted values are `YYYY-MM-DD` and ISO datetimes such as `2026-08-11T14:30`,
  `2026-08-11T14:30:45.123456Z`, or `2026-08-11T14:30:45+08:00`. Fractional
  seconds are truncated to milliseconds for the `SSS` token.
- Date-only and offsetless datetime values are wall-clock values and are not shifted by
  `time-zone`.
- Values with `Z` or an explicit offset represent an instant. They are converted to
  `time-zone`, or to the browser's local time zone when the attribute is omitted.
- Invalid values, impossible dates, and invalid time zones render empty content without
  throwing.

Use an explicit `Z` or offset whenever time-zone conversion matters.

## CSS parts

| Part   | Description                   |
| ------ | ----------------------------- |
| `time` | The semantic `<time>` element |
