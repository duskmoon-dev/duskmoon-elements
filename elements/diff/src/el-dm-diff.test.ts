import { afterEach, describe, expect, test } from 'bun:test';
import { ElDmDiff, register } from './index';

register();

describe('ElDmDiff', () => {
  afterEach(() => document.body.replaceChildren());

  test('registers the custom element', () => {
    expect(customElements.get('el-dm-diff')).toBe(ElDmDiff);
  });

  test('clamps the reveal position', async () => {
    const element = document.createElement('el-dm-diff') as ElDmDiff;
    element.position = -10;
    document.body.append(element);
    await Promise.resolve();

    const figure = element.shadowRoot.querySelector('.diff') as HTMLElement;
    expect(figure.getAttribute('style')).toContain('--diff-position: 0%');
  });

  test('maps static mode and named slots', async () => {
    const element = document.createElement('el-dm-diff') as ElDmDiff;
    element.static = true;
    document.body.append(element);
    await Promise.resolve();

    expect(element.shadowRoot.querySelector('.diff-static')).toBeTruthy();
    expect(element.shadowRoot.querySelector('slot[name="before"]')).toBeTruthy();
    expect(element.shadowRoot.querySelector('slot[name="after"]')).toBeTruthy();
  });
});
