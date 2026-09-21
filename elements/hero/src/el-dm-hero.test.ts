import { describe, expect, test } from 'bun:test';
import { ElDmHero, register } from './index.js';

register();

describe('ElDmHero', () => {
  test('registers and renders its composition contract', () => {
    const el = document.createElement('el-dm-hero') as ElDmHero;
    document.body.appendChild(el);

    expect(customElements.get('el-dm-hero')).toBe(ElDmHero);
    expect(el.shadowRoot?.querySelector('.hero-content slot:not([name])')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('slot[name="overlay"]')).toBeTruthy();

    el.remove();
  });
});
