/**
 * Sparkline renderer — mini inline charts for grid cells.
 *
 * Supports line, bar, and area chart types. Renders as inline SVG
 * for crisp, resolution-independent display.
 */

// ─── Public Types ────────────────────────────

export interface SparklineDef {
  type: 'line' | 'bar' | 'area';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  highlightStyle?: { fill?: string; stroke?: string };
  min?: number;
  max?: number;
  padding?: { top?: number; right?: number; bottom?: number; left?: number };
}

export interface SparklineOptions {
  width?: number;
  height?: number;
  data: number[];
  def: SparklineDef;
}

// ─── Sparkline Class ─────────────────────────

export class Sparkline {
  /**
   * Render a sparkline as an inline SVG string.
   */
  render(options: SparklineOptions): string {
    const { data, def } = options;
    const width = options.width ?? 100;
    const height = options.height ?? 24;

    if (!data || data.length === 0) {
      return `<svg class="grid-sparkline" width="${width}" height="${height}"></svg>`;
    }

    const pad = {
      top: def.padding?.top ?? 2,
      right: def.padding?.right ?? 2,
      bottom: def.padding?.bottom ?? 2,
      left: def.padding?.left ?? 2,
    };

    const plotWidth = width - pad.left - pad.right;
    const plotHeight = height - pad.top - pad.bottom;

    const minVal = def.min ?? Math.min(...data);
    const maxVal = def.max ?? Math.max(...data);
    const range = maxVal - minVal || 1;

    switch (def.type) {
      case 'line':
        return this.#renderLine(
          data,
          width,
          height,
          plotWidth,
          plotHeight,
          pad,
          minVal,
          range,
          def,
        );
      case 'bar':
        return this.#renderBar(data, width, height, plotWidth, plotHeight, pad, minVal, range, def);
      case 'area':
        return this.#renderArea(
          data,
          width,
          height,
          plotWidth,
          plotHeight,
          pad,
          minVal,
          range,
          def,
        );
      default:
        return '';
    }
  }

  #renderLine(
    data: number[],
    width: number,
    height: number,
    plotWidth: number,
    plotHeight: number,
    pad: { top: number; left: number },
    minVal: number,
    range: number,
    def: SparklineDef,
  ): string {
    const stroke = def.stroke ?? 'var(--dm-color-primary, #3b82f6)';
    const strokeWidth = def.strokeWidth ?? 1.5;
    const points = this.#computePoints(data, plotWidth, plotHeight, pad, minVal, range);
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

    return `<svg class="grid-sparkline" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <path d="${pathD}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" />
    </svg>`;
  }

  #renderArea(
    data: number[],
    width: number,
    height: number,
    plotWidth: number,
    plotHeight: number,
    pad: { top: number; left: number; bottom: number },
    minVal: number,
    range: number,
    def: SparklineDef,
  ): string {
    const fill = def.fill ?? 'var(--dm-color-primary, #3b82f6)';
    const stroke = def.stroke ?? 'var(--dm-color-primary, #3b82f6)';
    const strokeWidth = def.strokeWidth ?? 1.5;
    const points = this.#computePoints(data, plotWidth, plotHeight, pad, minVal, range);
    const baseline = height - pad.bottom;

    const lineD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const areaD = `${lineD} L${points[points.length - 1].x},${baseline} L${points[0].x},${baseline} Z`;

    return `<svg class="grid-sparkline" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <path d="${areaD}" fill="${fill}" fill-opacity="0.2" />
      <path d="${lineD}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" />
    </svg>`;
  }

  #renderBar(
    data: number[],
    width: number,
    height: number,
    plotWidth: number,
    plotHeight: number,
    pad: { top: number; left: number; bottom: number },
    minVal: number,
    range: number,
    def: SparklineDef,
  ): string {
    const fill = def.fill ?? 'var(--dm-color-primary, #3b82f6)';
    const barGap = 1;
    const barWidth = Math.max(1, (plotWidth - barGap * (data.length - 1)) / data.length);
    const baseline = height - pad.bottom;

    const bars = data
      .map((val, i) => {
        const x = pad.left + i * (barWidth + barGap);
        const barHeight = ((val - minVal) / range) * plotHeight;
        const y = baseline - barHeight;
        return `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${fill}" />`;
      })
      .join('');

    return `<svg class="grid-sparkline" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      ${bars}
    </svg>`;
  }

  #computePoints(
    data: number[],
    plotWidth: number,
    plotHeight: number,
    pad: { top: number; left: number },
    minVal: number,
    range: number,
  ): { x: number; y: number }[] {
    const step = data.length > 1 ? plotWidth / (data.length - 1) : 0;
    return data.map((val, i) => ({
      x: pad.left + i * step,
      y: pad.top + plotHeight - ((val - minVal) / range) * plotHeight,
    }));
  }
}
