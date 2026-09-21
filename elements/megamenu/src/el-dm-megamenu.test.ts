import { describe, expect, test } from 'bun:test';
import { ElDmMegamenu, register } from './index.js';

register();

describe('ElDmMegamenu', () => {
  test('registers and renders its composition contract', () => {
    const el = document.createElement('el-dm-megamenu') as ElDmMegamenu;
    document.body.appendChild(el);

    expect(customElements.get('el-dm-megamenu')).toBe(ElDmMegamenu);
    const trigger = el.shadowRoot?.querySelector<HTMLButtonElement>('.megamenu-trigger');
    const panel = el.shadowRoot?.querySelector<HTMLElement>('.megamenu-panel');
    expect(trigger?.getAttribute('popovertarget')).toBe(panel?.id);
    expect(panel?.hasAttribute('popover')).toBe(true);
    expect(el.shadowRoot?.querySelector('slot[name="mobile"]')).toBeTruthy();

    el.remove();
  });
});
