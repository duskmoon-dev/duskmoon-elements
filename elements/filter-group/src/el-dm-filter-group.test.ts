import { afterEach, describe, expect, test } from 'bun:test';
import { ElDmFilterGroup, register } from './index';
register();
afterEach(() => document.body.replaceChildren());
describe('ElDmFilterGroup', () => {
  test('preserves authored native controls and maps the palette', () => {
    const el = document.createElement('el-dm-filter-group') as ElDmFilterGroup;
    el.color = 'secondary';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = 'topic';
    el.append(input);
    document.body.append(el);
    expect(el.querySelector('input')).toBe(input);
    expect(input.type).toBe('checkbox');
    expect(
      el.shadowRoot.querySelector('.filter-group')?.classList.contains('filter-group-secondary'),
    ).toBe(true);
  });
});
