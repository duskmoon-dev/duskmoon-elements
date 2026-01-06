/**
 * DuskMoon Progress Element
 *
 * A progress bar component for displaying completion status.
 * Uses styles from @duskmoon-dev/core for consistent theming.
 *
 * @element el-dm-progress
 *
 * @attr {number} value - Current progress value (0-100)
 * @attr {number} max - Maximum value (default: 100)
 * @attr {string} color - Progress bar color: primary, secondary, tertiary, success, warning, error, info
 * @attr {string} size - Progress bar size: sm, md, lg
 * @attr {boolean} indeterminate - Whether to show indeterminate animation
 * @attr {boolean} striped - Whether to show striped pattern
 * @attr {boolean} animated - Whether to animate the stripes
 * @attr {boolean} show-value - Whether to show the value label
 *
 * @csspart progress - The progress container
 * @csspart bar - The progress bar
 * @csspart value - The value label
 */

import { BaseElement, css } from '@duskmoon-dev/el-core';
import { css as progressCSS } from '@duskmoon-dev/core/components/progress';

const COLOR_CLASSES: Record<string, string> = {
  primary: 'progress-primary',
  secondary: 'progress-secondary',
  tertiary: 'progress-tertiary',
  success: 'progress-success',
  warning: 'progress-warning',
  error: 'progress-error',
  info: 'progress-info',
};

const SIZE_CLASSES: Record<string, string> = {
  sm: 'progress-sm',
  md: '',
  lg: 'progress-lg',
};

export type ProgressColor = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'info';
export type ProgressSize = 'sm' | 'md' | 'lg';

// Strip @layer wrapper for Shadow DOM compatibility
const coreStyles = progressCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: block;
    width: 100%;
  }

  :host([hidden]) {
    display: none !important;
  }

  ${coreStyles}

  .progress {
    position: relative;
    width: 100%;
    height: 0.5rem;
    background-color: var(--color-surface-variant);
    border-radius: 9999px;
    overflow: hidden;
    font-family: inherit;
  }

  .progress-sm {
    height: 0.25rem;
  }

  .progress-lg {
    height: 1rem;
  }

  .progress-bar {
    height: 100%;
    background-color: var(--color-primary);
    border-radius: 9999px;
    transition: width 300ms ease;
  }

  .progress-primary .progress-bar {
    background-color: var(--color-primary);
  }

  .progress-secondary .progress-bar {
    background-color: var(--color-secondary);
  }

  .progress-tertiary .progress-bar {
    background-color: var(--color-tertiary);
  }

  .progress-success .progress-bar {
    background-color: var(--color-success);
  }

  .progress-warning .progress-bar {
    background-color: var(--color-warning);
  }

  .progress-error .progress-bar {
    background-color: var(--color-error);
  }

  .progress-info .progress-bar {
    background-color: var(--color-info);
  }

  .progress-striped .progress-bar {
    background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent
    );
    background-size: 1rem 1rem;
  }

  .progress-animated .progress-bar {
    animation: progress-stripes 1s linear infinite;
  }

  @keyframes progress-stripes {
    0% {
      background-position: 1rem 0;
    }
    100% {
      background-position: 0 0;
    }
  }

  .progress-indeterminate .progress-bar {
    width: 50% !important;
    animation: progress-indeterminate 1.5s ease-in-out infinite;
  }

  @keyframes progress-indeterminate {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(200%);
    }
  }

  .progress-value {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 0.625rem;
    font-weight: 600;
    color: var(--color-on-surface);
  }

  .progress-lg .progress-value {
    font-size: 0.75rem;
  }
`;

export class ElDmProgress extends BaseElement {
  static properties = {
    value: { type: Number, reflect: true, default: 0 },
    max: { type: Number, reflect: true, default: 100 },
    color: { type: String, reflect: true, default: 'primary' },
    size: { type: String, reflect: true },
    indeterminate: { type: Boolean, reflect: true },
    striped: { type: Boolean, reflect: true },
    animated: { type: Boolean, reflect: true },
    showValue: { type: Boolean, reflect: true, attribute: 'show-value' },
  };

  declare value: number;
  declare max: number;
  declare color: ProgressColor;
  declare size: ProgressSize;
  declare indeterminate: boolean;
  declare striped: boolean;
  declare animated: boolean;
  declare showValue: boolean;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  private _getPercentage(): number {
    const val = Math.max(0, Math.min(this.value || 0, this.max || 100));
    return (val / (this.max || 100)) * 100;
  }

  private _getProgressClasses(): string {
    const classes = ['progress'];

    if (this.color && COLOR_CLASSES[this.color]) {
      classes.push(COLOR_CLASSES[this.color]);
    }

    if (this.size && SIZE_CLASSES[this.size]) {
      classes.push(SIZE_CLASSES[this.size]);
    }

    if (this.indeterminate) {
      classes.push('progress-indeterminate');
    }

    if (this.striped) {
      classes.push('progress-striped');
    }

    if (this.animated && this.striped) {
      classes.push('progress-animated');
    }

    return classes.join(' ');
  }

  render(): string {
    const progressClasses = this._getProgressClasses();
    const percentage = this._getPercentage();

    return `
      <div
        class="${progressClasses}"
        role="progressbar"
        aria-valuenow="${this.value || 0}"
        aria-valuemin="0"
        aria-valuemax="${this.max || 100}"
        part="progress"
      >
        <div
          class="progress-bar"
          style="width: ${this.indeterminate ? '50' : percentage}%"
          part="bar"
        ></div>
        ${this.showValue && !this.indeterminate ? `<span class="progress-value" part="value">${Math.round(percentage)}%</span>` : ''}
      </div>
    `;
  }
}
