import { afterEach, describe, expect, test } from 'bun:test';
import { ElDmJoin, register } from './index';
register();
afterEach(() => document.body.replaceChildren());
describe('ElDmJoin', () => {
  test('maps orientation without replacing native children', () => {
    const el = document.createElement('el-dm-join') as ElDmJoin;
    el.orientation = 'vertical';
    const button = document.createElement('button');
    el.append(button);
    document.body.append(el);
    expect(el.firstElementChild).toBe(button);
    expect(el.shadowRoot.querySelector('.join')?.classList.contains('join-vertical')).toBe(true);
  });
});
