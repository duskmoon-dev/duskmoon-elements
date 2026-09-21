import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as radialProgressCSS } from '@duskmoon-dev/core/components/radial-progress';

export type RadialProgressSize = 'md' | 'sm' | 'lg' | 'xl';
export type RadialProgressColor =
  'primary' | 'secondary' | 'tertiary' | 'info' | 'success' | 'warning' | 'error';
const SIZES: RadialProgressSize[] = ['md', 'sm', 'lg', 'xl'];
const COLORS: RadialProgressColor[] = [
  'primary',
  'secondary',
  'tertiary',
  'info',
  'success',
  'warning',
  'error',
];

const coreStyles = radialProgressCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
const styles = css`
  :host {
    display: inline-grid;
    vertical-align: middle;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreStyles}
  .radial-progress > slot {
    position: relative;
    z-index: 1;
  }
`;

export class ElDmRadialProgress extends BaseElement {
  static properties = {
    value: { type: Number, reflect: true, default: 0 },
    max: { type: Number, reflect: true, default: 100 },
    size: { type: String, reflect: true, default: 'md' },
    color: { type: String, reflect: true, default: 'primary' },
  };
  declare value: number;
  declare max: number;
  declare size: RadialProgressSize;
  declare color: RadialProgressColor;
  constructor() {
    super();
    this.attachStyles(styles);
  }

  private _normalizedValues(): { max: number; value: number; percent: number } {
    const max = Number(this.max) > 0 ? Number(this.max) : 100;
    const value = Math.max(0, Math.min(max, Number(this.value) || 0));
    return { max, value, percent: (value / max) * 100 };
  }

  render(): string {
    const { percent } = this._normalizedValues();
    const classes = ['radial-progress'];
    if (SIZES.includes(this.size) && this.size !== 'md') {
      classes.push(`radial-progress-${this.size}`);
    }
    if (COLORS.includes(this.color)) classes.push(`radial-progress-${this.color}`);
    return `<div class="${classes.join(' ')}" part="progress" style="--radial-progress-value: ${percent}" aria-hidden="true"><slot>${Math.round(percent)}%</slot></div>`;
  }

  update(): void {
    super.update();
    const { max, value } = this._normalizedValues();
    this.setAttribute('role', 'progressbar');
    this.setAttribute('aria-valuemin', '0');
    this.setAttribute('aria-valuemax', String(max));
    this.setAttribute('aria-valuenow', String(value));
  }
}
