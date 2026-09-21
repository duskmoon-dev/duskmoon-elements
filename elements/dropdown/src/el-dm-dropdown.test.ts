import { afterEach, describe, expect, test } from 'bun:test';
import { ElDmDropdown, register } from './index';
register();
afterEach(() => document.body.replaceChildren());
describe('ElDmDropdown', () => {
  test('uses a native Popover target and maps logical placement', () => {
    const el = document.createElement('el-dm-dropdown') as ElDmDropdown;
    el.placement = 'inline-start';
    document.body.append(el);
    const trigger = el.shadowRoot.querySelector('button')!;
    const content = el.shadowRoot.querySelector<HTMLElement>('[popover]')!;
    expect(trigger.getAttribute('popovertarget')).toBe(content.id);
    expect(content.getAttribute('popover')).toBe('auto');
    expect(
      el.shadowRoot.querySelector('.dropdown')?.classList.contains('dropdown-inline-start'),
    ).toBe(true);
  });
  test('escapes the fallback trigger label', () => {
    const el = document.createElement('el-dm-dropdown') as ElDmDropdown;
    el.triggerLabel = '<img src=x onerror=alert(1)>';
    document.body.append(el);
    expect(el.shadowRoot.querySelector('button')?.textContent?.trim()).toBe(
      '<img src=x onerror=alert(1)>',
    );
    expect(el.shadowRoot.querySelector('img')).toBeNull();
  });
});
