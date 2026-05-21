/**
 * DuskMoon Chart Element
 *
 * A small SVG chart renderer for simple bar, line, and pie charts.
 *
 * @element el-dm-chart
 *
 * @attr {string} type - Chart type: bar, line, pie
 * @attr {string} data - Chart data as JSON
 * @attr {string} options - Chart options as JSON
 * @attr {string} variant - Chart variant: plain, outlined, filled
 * @attr {string} color - Chart color: primary, secondary, tertiary, accent, success, warning, error, info
 * @attr {string} size - Chart size: sm, md, lg
 *
 * @csspart chart - The chart container
 * @csspart svg - The chart SVG
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';

export type ChartType = 'bar' | 'line' | 'pie';
export type ChartVariant = 'plain' | 'outlined' | 'filled';
export type ChartColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';
export type ChartSize = 'sm' | 'md' | 'lg';

export interface ChartDataset {
  label?: string;
  data: number[];
  color?: string;
}

export interface ChartData {
  labels?: string[];
  values?: number[];
  data?: number[];
  datasets?: ChartDataset[];
}

export interface ChartOptions {
  height?: number;
  showLegend?: boolean;
  showValues?: boolean;
}

interface NormalizedChartData {
  labels: string[];
  datasets: ChartDataset[];
}

const CHART_TYPES = new Set(['bar', 'line', 'pie']);
const CHART_COLORS = new Set([
  'primary',
  'secondary',
  'tertiary',
  'accent',
  'success',
  'warning',
  'error',
  'info',
]);
const CHART_SIZES = new Set(['sm', 'md', 'lg']);
const CHART_VARIANTS = new Set(['plain', 'outlined', 'filled']);
const DEFAULT_VIEWBOX_WIDTH = 320;
const DEFAULT_VIEWBOX_HEIGHT = 180;
const CHART_PADDING = 24;

const styles = css`
  :host {
    display: block;
    width: 100%;
    color: var(--color-on-surface);
    font-family: inherit;
  }

  :host([hidden]) {
    display: none !important;
  }

  .chart {
    --chart-color: var(--color-primary);
    --chart-surface: transparent;
    --chart-border: transparent;
    box-sizing: border-box;
    width: 100%;
    min-height: 12rem;
    padding: 0.75rem;
    border: 1px solid var(--chart-border);
    border-radius: var(--radius-md, 0.5rem);
    background: var(--chart-surface);
  }

  .chart-sm {
    min-height: 8rem;
    padding: 0.5rem;
  }

  .chart-lg {
    min-height: 18rem;
    padding: 1rem;
  }

  .chart-outlined {
    --chart-border: var(--color-outline, currentColor);
  }

  .chart-filled {
    --chart-surface: var(--color-surface-container, var(--color-surface-variant));
  }

  .chart-primary {
    --chart-color: var(--color-primary);
  }

  .chart-secondary {
    --chart-color: var(--color-secondary);
  }

  .chart-tertiary {
    --chart-color: var(--color-tertiary);
  }

  .chart-accent {
    --chart-color: var(--color-accent);
  }

  .chart-success {
    --chart-color: var(--color-success);
  }

  .chart-warning {
    --chart-color: var(--color-warning);
  }

  .chart-error {
    --chart-color: var(--color-error);
  }

  .chart-info {
    --chart-color: var(--color-info);
  }

  svg {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
  }

  .axis,
  .grid {
    stroke: var(--color-outline-variant, color-mix(in srgb, currentColor 20%, transparent));
    stroke-width: 1;
  }

  .bar,
  .line,
  .point,
  .slice {
    color: var(--chart-color);
  }

  .label,
  .value {
    fill: var(--color-on-surface-variant, currentColor);
    font-size: 0.625rem;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 0.75rem;
    margin-top: 0.5rem;
    color: var(--color-on-surface-variant, currentColor);
    font-size: 0.75rem;
  }

  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }

  .legend-swatch {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 9999px;
    background: var(--chart-color);
  }

  .empty {
    display: grid;
    min-height: 8rem;
    place-items: center;
    color: var(--color-on-surface-variant, currentColor);
    font-size: 0.875rem;
  }
`;

export class ElDmChart extends BaseElement {
  static properties = {
    type: { type: String, reflect: true, default: 'bar' },
    data: { type: String, reflect: true, default: '[]' },
    options: { type: String, reflect: true, default: '{}' },
    variant: { type: String, reflect: true, default: 'plain' },
    color: { type: String, reflect: true, default: 'primary' },
    size: { type: String, reflect: true, default: 'md' },
  };

  declare type: ChartType;
  declare data: string;
  declare options: string;
  declare variant: ChartVariant;
  declare color: ChartColor;
  declare size: ChartSize;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  private _getType(): ChartType {
    return CHART_TYPES.has(this.type) ? this.type : 'bar';
  }

  private _getColor(): ChartColor {
    return CHART_COLORS.has(this.color) ? this.color : 'primary';
  }

  private _getSize(): ChartSize {
    return CHART_SIZES.has(this.size) ? this.size : 'md';
  }

  private _getVariant(): ChartVariant {
    return CHART_VARIANTS.has(this.variant) ? this.variant : 'plain';
  }

  private _getOptions(): ChartOptions {
    const parsed = parseJson(this.options);
    if (!isRecord(parsed)) return {};

    return {
      height: typeof parsed.height === 'number' && parsed.height > 0 ? parsed.height : undefined,
      showLegend: typeof parsed.showLegend === 'boolean' ? parsed.showLegend : undefined,
      showValues: typeof parsed.showValues === 'boolean' ? parsed.showValues : undefined,
    };
  }

  private _getData(): NormalizedChartData {
    return normalizeChartData(parseJson(this.data));
  }

  private _getClasses(): string {
    const variant = this._getVariant();
    const size = this._getSize();

    return [
      'chart',
      `chart-${variant}`,
      `chart-${this._getColor()}`,
      size !== 'md' ? `chart-${size}` : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  private _renderBarChart(data: NormalizedChartData, options: ChartOptions): string {
    const values = data.datasets[0]?.data ?? [];
    const max = getPositiveMax(values);
    const width = DEFAULT_VIEWBOX_WIDTH;
    const height = options.height ?? DEFAULT_VIEWBOX_HEIGHT;
    const chartWidth = width - CHART_PADDING * 2;
    const chartHeight = height - CHART_PADDING * 2;
    const gap = 8;
    const barWidth =
      values.length > 0 ? Math.max(4, (chartWidth - gap * (values.length - 1)) / values.length) : 0;

    const bars = values
      .map((value, index) => {
        const barHeight = Math.max(0, (value / max) * chartHeight);
        const x = CHART_PADDING + index * (barWidth + gap);
        const y = CHART_PADDING + chartHeight - barHeight;
        const label = data.labels[index] ?? String(index + 1);
        const valueLabel = options.showValues
          ? `<text class="value" x="${x + barWidth / 2}" y="${Math.max(10, y - 5)}" text-anchor="middle">${escapeHtml(String(value))}</text>`
          : '';

        return `
          <rect class="bar" x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="3" fill="currentColor"></rect>
          <text class="label" x="${x + barWidth / 2}" y="${height - 6}" text-anchor="middle">${escapeHtml(label)}</text>
          ${valueLabel}
        `;
      })
      .join('');

    return `
      <svg part="svg" role="img" viewBox="0 0 ${width} ${height}" aria-label="Bar chart">
        <line class="axis" x1="${CHART_PADDING}" y1="${height - CHART_PADDING}" x2="${width - CHART_PADDING}" y2="${height - CHART_PADDING}"></line>
        ${bars}
      </svg>
    `;
  }

  private _renderLineChart(data: NormalizedChartData, options: ChartOptions): string {
    const values = data.datasets[0]?.data ?? [];
    const max = getPositiveMax(values);
    const width = DEFAULT_VIEWBOX_WIDTH;
    const height = options.height ?? DEFAULT_VIEWBOX_HEIGHT;
    const chartWidth = width - CHART_PADDING * 2;
    const chartHeight = height - CHART_PADDING * 2;
    const step = values.length > 1 ? chartWidth / (values.length - 1) : 0;
    const points = values.map((value, index) => ({
      x: CHART_PADDING + step * index,
      y: CHART_PADDING + chartHeight - (value / max) * chartHeight,
      value,
    }));
    const pointList = points.map((point) => `${point.x},${point.y}`).join(' ');
    const circles = points
      .map((point) => {
        const valueLabel = options.showValues
          ? `<text class="value" x="${point.x}" y="${Math.max(10, point.y - 8)}" text-anchor="middle">${escapeHtml(String(point.value))}</text>`
          : '';

        return `
          <circle class="point" cx="${point.x}" cy="${point.y}" r="4" fill="currentColor"></circle>
          ${valueLabel}
        `;
      })
      .join('');

    return `
      <svg part="svg" role="img" viewBox="0 0 ${width} ${height}" aria-label="Line chart">
        <line class="grid" x1="${CHART_PADDING}" y1="${CHART_PADDING}" x2="${CHART_PADDING}" y2="${height - CHART_PADDING}"></line>
        <line class="axis" x1="${CHART_PADDING}" y1="${height - CHART_PADDING}" x2="${width - CHART_PADDING}" y2="${height - CHART_PADDING}"></line>
        <polyline class="line" points="${pointList}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
        ${circles}
      </svg>
    `;
  }

  private _renderPieChart(data: NormalizedChartData, options: ChartOptions): string {
    const values = data.datasets[0]?.data ?? [];
    const total = values.reduce((sum, value) => sum + Math.max(0, value), 0);
    const width = DEFAULT_VIEWBOX_WIDTH;
    const height = options.height ?? DEFAULT_VIEWBOX_HEIGHT;
    const radius = Math.min(width, height) / 2 - CHART_PADDING;
    const centerX = width / 2;
    const centerY = height / 2;
    let startAngle = -90;

    const slices = values
      .map((value, index) => {
        const sliceValue = Math.max(0, value);
        const angle = total > 0 ? (sliceValue / total) * 360 : 0;
        const path = describeArc(centerX, centerY, radius, startAngle, startAngle + angle);
        startAngle += angle;

        return `<path class="slice" d="${path}" fill="currentColor" opacity="${getSliceOpacity(index)}"></path>`;
      })
      .join('');

    return `
      <svg part="svg" role="img" viewBox="0 0 ${width} ${height}" aria-label="Pie chart">
        ${slices}
      </svg>
    `;
  }

  private _renderLegend(data: NormalizedChartData, options: ChartOptions): string {
    if (!options.showLegend) return '';

    const labels =
      data.labels.length > 0
        ? data.labels
        : (data.datasets[0]?.data.map((_, index) => String(index + 1)) ?? []);
    if (labels.length === 0) return '';

    return `
      <div class="legend" part="legend">
        ${labels
          .map(
            (label, index) => `
              <span class="legend-item">
                <span class="legend-swatch" style="opacity: ${getSliceOpacity(index)}"></span>
                ${escapeHtml(label)}
              </span>
            `,
          )
          .join('')}
      </div>
    `;
  }

  render(): string {
    const data = this._getData();
    const options = this._getOptions();
    const values = data.datasets[0]?.data ?? [];

    if (values.length === 0) {
      return `<div class="${this._getClasses()}" part="chart"><div class="empty">No chart data</div></div>`;
    }

    const chart =
      this._getType() === 'line'
        ? this._renderLineChart(data, options)
        : this._getType() === 'pie'
          ? this._renderPieChart(data, options)
          : this._renderBarChart(data, options);

    return `
      <div class="${this._getClasses()}" part="chart">
        ${chart}
        ${this._renderLegend(data, options)}
      </div>
    `;
  }
}

function parseJson(value: string | undefined): unknown {
  if (!value) return undefined;

  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function normalizeChartData(value: unknown): NormalizedChartData {
  if (Array.isArray(value)) {
    const values = value.filter(isFiniteNumber);
    return {
      labels: values.map((_, index) => String(index + 1)),
      datasets: [{ data: values }],
    };
  }

  if (!isRecord(value)) {
    return { labels: [], datasets: [] };
  }

  const labels = Array.isArray(value.labels) ? value.labels.filter(isString) : [];
  const values = Array.isArray(value.values)
    ? value.values.filter(isFiniteNumber)
    : Array.isArray(value.data)
      ? value.data.filter(isFiniteNumber)
      : [];

  if (values.length > 0) {
    return {
      labels: normalizeLabels(labels, values.length),
      datasets: [{ data: values }],
    };
  }

  if (Array.isArray(value.datasets)) {
    const datasets = value.datasets
      .filter(isRecord)
      .map((dataset) => ({
        label: typeof dataset.label === 'string' ? dataset.label : undefined,
        data: Array.isArray(dataset.data) ? dataset.data.filter(isFiniteNumber) : [],
        color: typeof dataset.color === 'string' ? dataset.color : undefined,
      }))
      .filter((dataset) => dataset.data.length > 0);

    return {
      labels: normalizeLabels(labels, datasets[0]?.data.length ?? 0),
      datasets,
    };
  }

  return { labels: [], datasets: [] };
}

function normalizeLabels(labels: string[], length: number): string[] {
  return Array.from({ length }, (_, index) => labels[index] ?? String(index + 1));
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getPositiveMax(values: number[]): number {
  return Math.max(1, ...values.map((value) => Math.max(0, value)));
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
): { x: number; y: number } {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    `M ${centerX} ${centerY}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

function getSliceOpacity(index: number): string {
  return String(Math.max(0.35, 1 - index * 0.12));
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
