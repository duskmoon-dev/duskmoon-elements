import { afterEach, describe, expect, test } from 'bun:test';
import { ElDmFab, register } from './index';
register();
afterEach(() => document.body.replaceChildren());
describe('ElDmFab', () => {
  test('keeps Popover as the speed-dial state authority', () => {
    const el = document.createElement('el-dm-fab') as ElDmFab;
    el.start = true;
    el.contained = true;
    document.body.append(el);
    const trigger = el.shadowRoot.querySelector('button')!;
    const actions = el.shadowRoot.querySelector<HTMLElement>('.fab-actions')!;
    expect(trigger.getAttribute('popovertarget')).toBe(actions.id);
    expect(actions.getAttribute('popover')).toBe('auto');
    expect(el.shadowRoot.querySelector('.fab')?.className).toContain('fab-start');
  });
  test('escapes the trigger accessible name', () => {
    const el = document.createElement('el-dm-fab') as ElDmFab;
    el.label = 'Create" autofocus data-injected="yes';
    document.body.append(el);
    const trigger = el.shadowRoot.querySelector('button')!;
    expect(trigger.getAttribute('aria-label')).toBe(el.label);
    expect(trigger.hasAttribute('data-injected')).toBe(false);
  });
});
