import { describe, expect, test } from 'bun:test';
import { ElDmConsolePage, register } from './index.js';

register();

describe('ElDmConsolePage', () => {
  test('registers and renders its composition contract', () => {
    const el = document.createElement('el-dm-console-page') as ElDmConsolePage;
    document.body.appendChild(el);

    expect(customElements.get('el-dm-console-page')).toBe(ElDmConsolePage);
    expect(el.shadowRoot?.querySelector('.console-page-frame')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('.console-page-appbar.appbar')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('slot[name="appbar"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('slot[name="menu-trigger"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('slot[name="sidebar-toggle"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('slot[name="sidebar"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('slot[name="main"]')).toBeTruthy();

    el.remove();
  });
});
