import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmSlider, register } from './index';

register();

describe('ElDmSlider', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-slider')).toBe(ElDmSlider);
  });

  test('creates a shadow root with slider role', () => {
    const el = document.createElement('el-dm-slider') as ElDmSlider;
    container.appendChild(el);

    const slider = el.shadowRoot?.querySelector('[role="slider"]');
    expect(slider).toBeDefined();
  });

  test('sets aria-valuemin and aria-valuemax', () => {
    const el = document.createElement('el-dm-slider') as ElDmSlider;
    el.min = 10;
    el.max = 200;
    container.appendChild(el);

    const slider = el.shadowRoot?.querySelector('[role="slider"]');
    expect(slider?.getAttribute('aria-valuemin')).toBe('10');
    expect(slider?.getAttribute('aria-valuemax')).toBe('200');
  });

  test('sets aria-valuenow', () => {
    const el = document.createElement('el-dm-slider') as ElDmSlider;
    el.value = 50;
    container.appendChild(el);

    const slider = el.shadowRoot?.querySelector('[role="slider"]');
    expect(slider?.getAttribute('aria-valuenow')).toBe('50');
  });

  test('renders track and thumb', () => {
    const el = document.createElement('el-dm-slider') as ElDmSlider;
    container.appendChild(el);

    const track = el.shadowRoot?.querySelector('.slider-track');
    const thumb = el.shadowRoot?.querySelector('.slider-thumb');
    expect(track).toBeDefined();
    expect(thumb).toBeDefined();
  });

  test('applies size classes', () => {
    const el = document.createElement('el-dm-slider') as ElDmSlider;
    el.size = 'lg';
    container.appendChild(el);

    const slider = el.shadowRoot?.querySelector('.slider');
    expect(slider?.classList.contains('slider-lg')).toBe(true);
  });

  test('applies disabled state', () => {
    const el = document.createElement('el-dm-slider') as ElDmSlider;
    el.disabled = true;
    container.appendChild(el);

    expect(el.hasAttribute('disabled')).toBe(true);
  });

  test('shows value label when show-value is set', () => {
    const el = document.createElement('el-dm-slider') as ElDmSlider;
    el.showValue = true;
    el.value = 42;
    container.appendChild(el);

    const label = el.shadowRoot?.querySelector('.slider-thumb-label');
    expect(label).toBeDefined();
  });
});
