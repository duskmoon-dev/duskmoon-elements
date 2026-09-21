import { describe, expect, test } from 'bun:test';
import { ElDmSidebarLayout, register } from './index.js';

register();

describe('ElDmSidebarLayout', () => {
  test('registers and renders its composition contract', () => {
    const el = document.createElement('el-dm-sidebar-layout') as ElDmSidebarLayout;
    document.body.appendChild(el);

    expect(customElements.get('el-dm-sidebar-layout')).toBe(ElDmSidebarLayout);
    expect(el.shadowRoot?.querySelector('slot[name="sidebar"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('.sidebar-layout-content slot:not([name])')).toBeTruthy();

    el.remove();
  });
});
