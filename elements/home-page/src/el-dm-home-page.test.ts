import { describe, expect, test } from 'bun:test';
import { ElDmHomePage, register } from './index.js';

register();

describe('ElDmHomePage', () => {
  test('registers and renders its composition contract', () => {
    const el = document.createElement('el-dm-home-page') as ElDmHomePage;
    document.body.appendChild(el);

    expect(customElements.get('el-dm-home-page')).toBe(ElDmHomePage);
    expect(el.shadowRoot?.querySelector('.home-page-header.appbar')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('slot[name="navigation"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('slot[name="mobile-menu"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('slot[name="footer"]')).toBeTruthy();

    el.remove();
  });
});
