import { afterEach, describe, expect, test } from 'bun:test';
import { ElDmLink, register } from './index';
register();
afterEach(() => document.body.replaceChildren());
describe('ElDmLink', () => {
  test('maps navigation attributes to a native anchor', () => {
    const el = document.createElement('el-dm-link') as ElDmLink;
    el.href = '/docs';
    el.target = '_blank';
    el.rel = 'noopener';
    el.color = 'secondary';
    el.hover = true;
    document.body.append(el);
    const link = el.shadowRoot.querySelector<HTMLAnchorElement>('a')!;
    expect(link.getAttribute('href')).toBe('/docs');
    expect(link.target).toBe('_blank');
    expect(link.rel).toBe('noopener');
    expect(link.classList.contains('link-secondary')).toBe(true);
    expect(link.classList.contains('link-hover')).toBe(true);
  });
  test('escapes navigation attributes', () => {
    const el = document.createElement('el-dm-link') as ElDmLink;
    el.href = '/docs" autofocus data-injected="yes';
    el.rel = 'noopener" data-rel-injected="yes';
    document.body.append(el);
    const link = el.shadowRoot.querySelector<HTMLAnchorElement>('a')!;
    expect(link.getAttribute('href')).toBe(el.href);
    expect(link.rel).toBe(el.rel);
    expect(link.hasAttribute('data-injected')).toBe(false);
    expect(link.hasAttribute('data-rel-injected')).toBe(false);
  });
});
