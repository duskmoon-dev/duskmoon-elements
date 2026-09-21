import { afterEach, describe, expect, test } from 'bun:test';
import { ElDmToggleSwitch, register } from './index';
register();
afterEach(() => document.body.replaceChildren());
describe('ElDmToggleSwitch', () => {
  test('maps form state to a native checkbox switch', () => {
    const el = document.createElement('el-dm-toggle-switch') as ElDmToggleSwitch;
    el.checked = true;
    el.required = true;
    el.name = 'alerts';
    el.size = 'sm';
    document.body.append(el);
    const input = el.shadowRoot.querySelector<HTMLInputElement>('input')!;
    expect(input.type).toBe('checkbox');
    expect(input.getAttribute('role')).toBe('switch');
    expect(input.checked).toBe(true);
    expect(input.required).toBe(true);
    expect(input.name).toBe('alerts');
    expect(input.classList.contains('toggle-sm')).toBe(true);
  });
  test('escapes checkbox value attributes', () => {
    const el = document.createElement('el-dm-toggle-switch') as ElDmToggleSwitch;
    el.value = 'enabled" autofocus data-injected="yes';
    document.body.append(el);
    const input = el.shadowRoot.querySelector<HTMLInputElement>('input')!;
    expect(input.value).toBe(el.value);
    expect(input.hasAttribute('data-injected')).toBe(false);
  });
});
