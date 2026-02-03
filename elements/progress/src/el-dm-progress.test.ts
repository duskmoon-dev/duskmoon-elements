import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmProgress, register } from './index';

register();

describe('ElDmProgress', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-progress')).toBe(ElDmProgress);
  });

  test('creates a shadow root with progressbar role', () => {
    const el = document.createElement('el-dm-progress') as ElDmProgress;
    container.appendChild(el);

    const progress = el.shadowRoot?.querySelector('[role="progressbar"]');
    expect(progress).toBeDefined();
  });

  test('sets aria-valuenow', () => {
    const el = document.createElement('el-dm-progress') as ElDmProgress;
    el.value = 50;
    container.appendChild(el);

    const progress = el.shadowRoot?.querySelector('[role="progressbar"]');
    expect(progress?.getAttribute('aria-valuenow')).toBe('50');
  });

  test('sets aria-valuemax', () => {
    const el = document.createElement('el-dm-progress') as ElDmProgress;
    el.max = 200;
    container.appendChild(el);

    const progress = el.shadowRoot?.querySelector('[role="progressbar"]');
    expect(progress?.getAttribute('aria-valuemax')).toBe('200');
  });

  test('calculates bar width percentage', () => {
    const el = document.createElement('el-dm-progress') as ElDmProgress;
    el.value = 75;
    el.max = 100;
    container.appendChild(el);

    const bar = el.shadowRoot?.querySelector('.progress-bar') as HTMLElement;
    expect(bar?.style.width).toBe('75%');
  });

  test('applies color classes', () => {
    const el = document.createElement('el-dm-progress') as ElDmProgress;
    el.color = 'success';
    container.appendChild(el);

    const progress = el.shadowRoot?.querySelector('.progress');
    expect(progress?.classList.contains('progress-success')).toBe(true);
  });

  test('applies size classes', () => {
    const el = document.createElement('el-dm-progress') as ElDmProgress;
    el.size = 'lg';
    container.appendChild(el);

    const progress = el.shadowRoot?.querySelector('.progress');
    expect(progress?.classList.contains('progress-lg')).toBe(true);
  });

  test('applies indeterminate class', () => {
    const el = document.createElement('el-dm-progress') as ElDmProgress;
    el.indeterminate = true;
    container.appendChild(el);

    const progress = el.shadowRoot?.querySelector('.progress');
    expect(progress?.classList.contains('progress-indeterminate')).toBe(true);
  });

  test('applies striped class', () => {
    const el = document.createElement('el-dm-progress') as ElDmProgress;
    el.striped = true;
    container.appendChild(el);

    const progress = el.shadowRoot?.querySelector('.progress');
    expect(progress?.classList.contains('progress-striped')).toBe(true);
  });

  test('shows value label when show-value is set', () => {
    const el = document.createElement('el-dm-progress') as ElDmProgress;
    el.value = 42;
    el.showValue = true;
    container.appendChild(el);

    const value = el.shadowRoot?.querySelector('.progress-value');
    expect(value?.textContent).toContain('42%');
  });

  test('does not show value label when show-value is not set', () => {
    const el = document.createElement('el-dm-progress') as ElDmProgress;
    el.value = 42;
    container.appendChild(el);

    const value = el.shadowRoot?.querySelector('.progress-value');
    expect(value).toBeNull();
  });

  test('clamps value between 0 and max', () => {
    const el = document.createElement('el-dm-progress') as ElDmProgress;
    el.value = 150;
    el.max = 100;
    container.appendChild(el);

    const bar = el.shadowRoot?.querySelector('.progress-bar') as HTMLElement;
    expect(bar?.style.width).toBe('100%');
  });
});
