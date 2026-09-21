import { describe, expect, test } from 'bun:test';
import { ElDmFooter, register } from './index.js';

register();

describe('ElDmFooter', () => {
  test('registers and renders its composition contract', () => {
    const el = document.createElement('el-dm-footer') as ElDmFooter;
    document.body.appendChild(el);

    expect(customElements.get('el-dm-footer')).toBe(ElDmFooter);
    expect(el.shadowRoot?.querySelector('footer.footer')).toBeTruthy();

    el.remove();
  });
});
