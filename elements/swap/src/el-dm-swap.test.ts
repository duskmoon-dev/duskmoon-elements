import { afterEach, describe, expect, test } from 'bun:test';
import { ElDmSwap, register } from './index';
register();
afterEach(() => document.body.replaceChildren());
describe('ElDmSwap', () => {
  test('uses native checkbox state and semantic state slots', () => {
    const el = document.createElement('el-dm-swap') as ElDmSwap;
    el.checked = true;
    el.rotate = true;
    document.body.append(el);
    const input = el.shadowRoot.querySelector<HTMLInputElement>('input')!;
    expect(input.type).toBe('checkbox');
    expect(input.checked).toBe(true);
    expect(el.shadowRoot.querySelector('.swap')?.classList.contains('swap-rotate')).toBe(true);
    expect(el.shadowRoot.querySelector('slot[name="on"]')).not.toBeNull();
    expect(el.shadowRoot.querySelector('slot[name="off"]')).not.toBeNull();
  });
  test('escapes checkbox value attributes', () => {
    const el = document.createElement('el-dm-swap') as ElDmSwap;
    el.value = 'on" autofocus data-injected="yes';
    document.body.append(el);
    const input = el.shadowRoot.querySelector<HTMLInputElement>('input')!;
    expect(input.value).toBe(el.value);
    expect(input.hasAttribute('data-injected')).toBe(false);
  });
});
