import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmChart, register } from './index';

register();

describe('ElDmChart', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  function createChart(attrs: Partial<ElDmChart> = {}): ElDmChart {
    const el = document.createElement('el-dm-chart') as ElDmChart;
    Object.assign(el, attrs);
    container.appendChild(el);
    return el;
  }

  test('is defined', () => {
    expect(customElements.get('el-dm-chart')).toBe(ElDmChart);
  });

  test('renders a bar chart from an array', () => {
    const el = createChart({ data: '[4,8,15]' });

    expect(el.shadowRoot?.querySelector('svg')?.getAttribute('aria-label')).toBe('Bar chart');
    expect(el.shadowRoot?.querySelectorAll('.bar').length).toBe(3);
  });

  test('renders a line chart from object data', () => {
    const el = createChart({
      type: 'line',
      data: '{"labels":["A","B","C"],"values":[1,3,2]}',
    });

    expect(el.shadowRoot?.querySelector('svg')?.getAttribute('aria-label')).toBe('Line chart');
    expect(el.shadowRoot?.querySelector('.line')).toBeDefined();
    expect(el.shadowRoot?.querySelectorAll('.point').length).toBe(3);
  });

  test('renders a pie chart', () => {
    const el = createChart({ type: 'pie', data: '[2,3,5]' });

    expect(el.shadowRoot?.querySelector('svg')?.getAttribute('aria-label')).toBe('Pie chart');
    expect(el.shadowRoot?.querySelectorAll('.slice').length).toBe(3);
  });

  test('renders legend when enabled in options', () => {
    const el = createChart({
      data: '{"labels":["CPU","Memory"],"values":[60,80]}',
      options: '{"showLegend":true}',
    });

    expect(el.shadowRoot?.querySelector('.legend')?.textContent).toContain('CPU');
    expect(el.shadowRoot?.querySelector('.legend')?.textContent).toContain('Memory');
  });

  test('applies variant color and size classes', () => {
    const el = createChart({
      data: '[1]',
      variant: 'outlined',
      color: 'success',
      size: 'lg',
    });
    const chart = el.shadowRoot?.querySelector('.chart');

    expect(chart?.classList.contains('chart-outlined')).toBe(true);
    expect(chart?.classList.contains('chart-success')).toBe(true);
    expect(chart?.classList.contains('chart-lg')).toBe(true);
  });

  test('shows empty state for invalid data', () => {
    const el = createChart({ data: '{invalid json' });

    expect(el.shadowRoot?.querySelector('.empty')?.textContent).toBe('No chart data');
  });
});
