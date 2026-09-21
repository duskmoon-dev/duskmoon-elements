import { afterEach, describe, expect, test } from 'bun:test';
import { ElDmRadialProgress, register } from './index';

register();

describe('ElDmRadialProgress', () => {
  afterEach(() => document.body.replaceChildren());

  test('registers the custom element', () => {
    expect(customElements.get('el-dm-radial-progress')).toBe(ElDmRadialProgress);
  });

  test('keeps CSS and ARIA values in sync', async () => {
    const element = document.createElement('el-dm-radial-progress') as ElDmRadialProgress;
    element.value = 25;
    element.max = 50;
    document.body.append(element);
    await Promise.resolve();

    const progress = element.shadowRoot.querySelector('.radial-progress') as HTMLElement;
    expect(element.getAttribute('role')).toBe('progressbar');
    expect(element.getAttribute('aria-valuenow')).toBe('25');
    expect(element.getAttribute('aria-valuemax')).toBe('50');
    expect(progress.getAttribute('style')).toContain('--radial-progress-value: 50');
  });

  test('clamps values to the declared range', async () => {
    const element = document.createElement('el-dm-radial-progress') as ElDmRadialProgress;
    element.value = 125;
    document.body.append(element);
    await Promise.resolve();

    const progress = element.shadowRoot.querySelector('.radial-progress') as HTMLElement;
    expect(element.getAttribute('aria-valuenow')).toBe('100');
    expect(progress.getAttribute('style')).toContain('--radial-progress-value: 100');
  });
});
