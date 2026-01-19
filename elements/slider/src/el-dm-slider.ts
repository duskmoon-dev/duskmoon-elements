/**
 * DuskMoon Slider Element
 *
 * A range slider component for selecting numeric values.
 * Uses styles from @duskmoon-dev/core for consistent theming.
 *
 * @element el-dm-slider
 *
 * @attr {number} value - Current slider value
 * @attr {number} min - Minimum value
 * @attr {number} max - Maximum value
 * @attr {number} step - Step increment
 * @attr {boolean} disabled - Whether the slider is disabled
 * @attr {string} size - Size: sm, md, lg
 * @attr {string} color - Color: primary, secondary, tertiary, success, warning, error, info
 * @attr {boolean} show-value - Show current value label
 *
 * @csspart slider - The slider container
 * @csspart track - The slider track
 * @csspart thumb - The slider thumb
 *
 * @fires change - Fired when value changes (on release)
 * @fires input - Fired during drag
 */

import { BaseElement, css } from '@duskmoon-dev/el-core';
import { css as sliderCSS } from '@duskmoon-dev/core/components/slider';

export type SliderSize = 'sm' | 'md' | 'lg';
export type SliderColor = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'info';

const SIZE_CLASSES: Record<string, string> = {
  sm: 'slider-sm',
  md: '',
  lg: 'slider-lg',
};

const COLOR_CLASSES: Record<string, string> = {
  primary: '',
  secondary: 'slider-secondary',
  tertiary: 'slider-tertiary',
  success: 'slider-success',
  warning: 'slider-warning',
  error: 'slider-error',
  info: 'slider-info',
};

// Strip @layer wrapper for Shadow DOM compatibility
const coreStyles = sliderCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: block;
    width: 100%;
  }

  :host([hidden]) {
    display: none !important;
  }

  ${coreStyles}

  /* Web component specific adjustments */
  .slider {
    font-family: inherit;
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    height: 2.5rem;
    touch-action: none;
  }

  .slider-track {
    position: relative;
    flex: 1;
    height: 0.375rem;
    background-color: var(--color-surface-container-high, #e0e0e0);
    border-radius: 0.1875rem;
    cursor: pointer;
  }

  .slider-track-filled {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: var(--color-primary);
    border-radius: 0.1875rem;
    transition: width 0.1s ease;
  }

  .slider-thumb {
    position: absolute;
    top: 50%;
    width: 1.25rem;
    height: 1.25rem;
    background-color: var(--color-primary);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    cursor: grab;
    transition: box-shadow 0.15s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .slider-thumb:hover {
    box-shadow: 0 0 0 8px rgba(var(--color-primary-rgb, 98, 0, 238), 0.1);
  }

  .slider-thumb:active {
    cursor: grabbing;
    box-shadow: 0 0 0 12px rgba(var(--color-primary-rgb, 98, 0, 238), 0.2);
  }

  .slider-thumb-label {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--color-on-primary);
    background-color: var(--color-primary);
    border-radius: 0.25rem;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .slider-thumb:hover .slider-thumb-label,
  .slider-thumb:active .slider-thumb-label,
  .slider.show-value .slider-thumb-label {
    opacity: 1;
  }

  /* Size variants */
  .slider-sm .slider-track {
    height: 0.25rem;
  }

  .slider-sm .slider-thumb {
    width: 1rem;
    height: 1rem;
  }

  .slider-lg .slider-track {
    height: 0.5rem;
  }

  .slider-lg .slider-thumb {
    width: 1.5rem;
    height: 1.5rem;
  }

  /* Color variants */
  .slider-secondary .slider-track-filled,
  .slider-secondary .slider-thumb {
    background-color: var(--color-secondary);
  }

  .slider-tertiary .slider-track-filled,
  .slider-tertiary .slider-thumb {
    background-color: var(--color-tertiary);
  }

  .slider-success .slider-track-filled,
  .slider-success .slider-thumb {
    background-color: var(--color-success);
  }

  .slider-warning .slider-track-filled,
  .slider-warning .slider-thumb {
    background-color: var(--color-warning);
  }

  .slider-error .slider-track-filled,
  .slider-error .slider-thumb {
    background-color: var(--color-error);
  }

  .slider-info .slider-track-filled,
  .slider-info .slider-thumb {
    background-color: var(--color-info);
  }

  /* Disabled state */
  :host([disabled]) .slider {
    opacity: 0.5;
    pointer-events: none;
  }

  :host([disabled]) .slider-thumb {
    cursor: not-allowed;
  }

  /* Labels container */
  .slider-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: var(--color-on-surface);
    opacity: 0.7;
  }
`;

export class ElDmSlider extends BaseElement {
  static properties = {
    value: { type: Number, reflect: true, default: 0 },
    min: { type: Number, reflect: true, default: 0 },
    max: { type: Number, reflect: true, default: 100 },
    step: { type: Number, reflect: true, default: 1 },
    disabled: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
    color: { type: String, reflect: true, default: 'primary' },
    showValue: {
      type: Boolean,
      reflect: true,
      attribute: 'show-value',
    },
  };

  declare value: number;
  declare min: number;
  declare max: number;
  declare step: number;
  declare disabled: boolean;
  declare size: SliderSize;
  declare color: SliderColor;
  declare showValue: boolean;

  private _isDragging = false;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  private _getClasses(): string {
    const classes = ['slider'];

    if (this.size && SIZE_CLASSES[this.size]) {
      classes.push(SIZE_CLASSES[this.size]);
    }

    if (this.color && COLOR_CLASSES[this.color]) {
      classes.push(COLOR_CLASSES[this.color]);
    }

    if (this.showValue) {
      classes.push('show-value');
    }

    return classes.join(' ');
  }

  private _getPercentage(): number {
    const range = this.max - this.min;
    if (range === 0) return 0;
    return ((this.value - this.min) / range) * 100;
  }

  private _valueFromPosition(clientX: number): number {
    const track = this.shadowRoot?.querySelector('.slider-track');
    if (!track) return this.value;

    const rect = track.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawValue = this.min + percentage * (this.max - this.min);

    // Snap to step
    const steppedValue = Math.round(rawValue / this.step) * this.step;
    return Math.max(this.min, Math.min(this.max, steppedValue));
  }

  private _handleTrackClick(e: MouseEvent): void {
    if (this.disabled) return;
    const newValue = this._valueFromPosition(e.clientX);
    if (newValue !== this.value) {
      this.value = newValue;
      this._updateUI();
      this.emit('input', { value: this.value });
      this.emit('change', { value: this.value });
    }
  }

  private _handleThumbMouseDown(e: MouseEvent): void {
    if (this.disabled) return;
    e.preventDefault();
    this._isDragging = true;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newValue = this._valueFromPosition(moveEvent.clientX);
      if (newValue !== this.value) {
        this.value = newValue;
        this._updateUI();
        this.emit('input', { value: this.value });
      }
    };

    const handleMouseUp = () => {
      this._isDragging = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      this.emit('change', { value: this.value });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    if (this.disabled) return;

    let newValue = this.value;
    const bigStep = (this.max - this.min) / 10;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        newValue = Math.min(this.max, this.value + this.step);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        newValue = Math.max(this.min, this.value - this.step);
        break;
      case 'PageUp':
        newValue = Math.min(this.max, this.value + bigStep);
        break;
      case 'PageDown':
        newValue = Math.max(this.min, this.value - bigStep);
        break;
      case 'Home':
        newValue = this.min;
        break;
      case 'End':
        newValue = this.max;
        break;
      default:
        return;
    }

    e.preventDefault();
    if (newValue !== this.value) {
      this.value = newValue;
      this._updateUI();
      this.emit('input', { value: this.value });
      this.emit('change', { value: this.value });
    }
  }

  private _updateUI(): void {
    const percentage = this._getPercentage();
    const filled = this.shadowRoot?.querySelector('.slider-track-filled') as HTMLElement;
    const thumb = this.shadowRoot?.querySelector('.slider-thumb') as HTMLElement;
    const label = this.shadowRoot?.querySelector('.slider-thumb-label') as HTMLElement;

    if (filled) {
      filled.style.width = `${percentage}%`;
    }
    if (thumb) {
      thumb.style.left = `${percentage}%`;
    }
    if (label) {
      label.textContent = String(this.value);
    }
  }

  render(): string {
    const classes = this._getClasses();
    const percentage = this._getPercentage();

    return `
      <div class="${classes}" part="slider" role="slider"
           aria-valuemin="${this.min}"
           aria-valuemax="${this.max}"
           aria-valuenow="${this.value}"
           tabindex="${this.disabled ? -1 : 0}">
        <div class="slider-track" part="track">
          <div class="slider-track-filled" style="width: ${percentage}%"></div>
          <div class="slider-thumb" part="thumb" style="left: ${percentage}%">
            <span class="slider-thumb-label">${this.value}</span>
          </div>
        </div>
      </div>
    `;
  }

  update(): void {
    super.update();

    const track = this.shadowRoot?.querySelector('.slider-track');
    const thumb = this.shadowRoot?.querySelector('.slider-thumb');
    const slider = this.shadowRoot?.querySelector('.slider');

    track?.addEventListener('click', ((e: MouseEvent) =>
      this._handleTrackClick(e)) as EventListener);
    thumb?.addEventListener('mousedown', ((e: MouseEvent) =>
      this._handleThumbMouseDown(e)) as EventListener);
    slider?.addEventListener('keydown', ((e: KeyboardEvent) =>
      this._handleKeyDown(e)) as EventListener);
  }
}
