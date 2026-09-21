import { describe, expect, test } from 'bun:test';
import { ElDmSignPage, register } from './index.js';

register();

describe('ElDmSignPage', () => {
  test('registers and renders its composition contract', () => {
    const el = document.createElement('el-dm-sign-page') as ElDmSignPage;
    document.body.appendChild(el);

    expect(customElements.get('el-dm-sign-page')).toBe(ElDmSignPage);
    expect(el.shadowRoot?.querySelector('slot[name="aside"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('.sign-page-content slot:not([name])')).toBeTruthy();

    el.remove();
  });
});
