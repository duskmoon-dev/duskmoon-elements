import { afterEach, describe, expect, test } from 'bun:test';
import { ElDmRange, register } from './index';
register();
afterEach(() => document.body.replaceChildren());
describe('ElDmRange', () => {
  test('maps bounds and styling to a native range input', () => {
    const el = document.createElement('el-dm-range') as ElDmRange;
    el.min = 10;
    el.max = 80;
    el.step = 5;
    el.value = 30;
    el.color = 'primary';
    document.body.append(el);
    expect(el.input?.type).toBe('range');
    expect(el.input?.min).toBe('10');
    expect(el.input?.max).toBe('80');
    expect(el.input?.step).toBe('5');
    expect(el.input?.value).toBe('30');
    expect(el.input?.classList.contains('range-primary')).toBe(true);
  });
  test('escapes the form name', () => {
    const el = document.createElement('el-dm-range') as ElDmRange;
    el.name = 'volume" autofocus data-injected="yes';
    document.body.append(el);
    expect(el.input?.name).toBe(el.name);
    expect(el.input?.hasAttribute('data-injected')).toBe(false);
  });
});
