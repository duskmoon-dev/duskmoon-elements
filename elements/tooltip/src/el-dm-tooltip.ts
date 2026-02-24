/**
 * DuskMoon Tooltip Element
 *
 * A tooltip component for displaying additional information on hover/focus.
 * Uses styles from @duskmoon-dev/core for consistent theming.
 *
 * @element el-dm-tooltip
 *
 * @attr {string} content - Tooltip text content
 * @attr {string} position - Tooltip position: top, bottom, left, right
 * @attr {string} trigger - Trigger mode: hover, click, focus
 * @attr {number} delay - Show delay in milliseconds
 * @attr {boolean} arrow - Whether to show arrow
 * @attr {boolean} disabled - Whether tooltip is disabled
 *
 * @slot - Default slot for trigger element
 *
 * @csspart tooltip - The tooltip container
 * @csspart content - The tooltip content
 * @csspart arrow - The tooltip arrow
 */

import { BaseElement, css, animationStyles } from '@duskmoon-dev/el-base';
import { css as tooltipCSS } from '@duskmoon-dev/core/components/tooltip';

const POSITION_CLASSES: Record<string, string> = {
  top: 'tooltip-top',
  bottom: 'tooltip-bottom',
  left: 'tooltip-left',
  right: 'tooltip-right',
};

const COLOR_CLASSES: Record<string, string> = {
  primary: 'tooltip-primary',
  secondary: 'tooltip-secondary',
  accent: 'tooltip-accent',
  info: 'tooltip-info',
  success: 'tooltip-success',
  warning: 'tooltip-warning',
  error: 'tooltip-error',
};

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipTrigger = 'hover' | 'click' | 'focus';
export type TooltipColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

// Strip @layer wrapper for Shadow DOM compatibility
const coreStyles = tooltipCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: inline-flex;
    position: relative;
  }

  :host([hidden]) {
    display: none !important;
  }

  ${coreStyles}

  .tooltip-wrapper {
    display: inline-flex;
    position: relative;
  }

  .tooltip-content {
    position: absolute;
    z-index: 1000;
    padding: 0.5rem 0.75rem;
    background-color: var(--color-inverse-surface, #1f1f1f);
    color: var(--color-inverse-on-surface, #fff);
    font-size: 0.75rem;
    line-height: 1rem;
    border-radius: 0.375rem;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 150ms ease,
      visibility 150ms ease;
    pointer-events: none;
    font-family: inherit;
  }

  .tooltip-content.visible {
    opacity: 1;
    visibility: visible;
  }

  .tooltip-top {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 0.5rem;
  }

  .tooltip-bottom {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 0.5rem;
  }

  .tooltip-left {
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-right: 0.5rem;
  }

  .tooltip-right {
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: 0.5rem;
  }

  .tooltip-arrow {
    position: absolute;
    width: 0;
    height: 0;
    border: 0.375rem solid transparent;
  }

  .tooltip-top .tooltip-arrow {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-top-color: var(--color-inverse-surface, #1f1f1f);
    border-bottom: 0;
  }

  .tooltip-bottom .tooltip-arrow {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-bottom-color: var(--color-inverse-surface, #1f1f1f);
    border-top: 0;
  }

  .tooltip-left .tooltip-arrow {
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    border-left-color: var(--color-inverse-surface, #1f1f1f);
    border-right: 0;
  }

  .tooltip-right .tooltip-arrow {
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    border-right-color: var(--color-inverse-surface, #1f1f1f);
    border-left: 0;
  }

  /* Color variants */
  .tooltip-primary {
    background-color: var(--color-primary);
    color: var(--color-on-primary);
  }
  .tooltip-primary .tooltip-arrow {
    border-color: var(--color-primary);
  }
  .tooltip-secondary {
    background-color: var(--color-secondary);
    color: var(--color-on-secondary);
  }
  .tooltip-secondary .tooltip-arrow {
    border-color: var(--color-secondary);
  }
  .tooltip-accent {
    background-color: var(--color-tertiary);
    color: var(--color-on-tertiary);
  }
  .tooltip-accent .tooltip-arrow {
    border-color: var(--color-tertiary);
  }
  .tooltip-info {
    background-color: var(--color-info);
    color: #fff;
  }
  .tooltip-info .tooltip-arrow {
    border-color: var(--color-info);
  }
  .tooltip-success {
    background-color: var(--color-success);
    color: #fff;
  }
  .tooltip-success .tooltip-arrow {
    border-color: var(--color-success);
  }
  .tooltip-warning {
    background-color: var(--color-warning);
    color: #000;
  }
  .tooltip-warning .tooltip-arrow {
    border-color: var(--color-warning);
  }
  .tooltip-error {
    background-color: var(--color-error);
    color: #fff;
  }
  .tooltip-error .tooltip-arrow {
    border-color: var(--color-error);
  }

  /* Arrow color inheritance for colored variants — reset transparent borders */
  .tooltip-primary .tooltip-arrow,
  .tooltip-secondary .tooltip-arrow,
  .tooltip-accent .tooltip-arrow,
  .tooltip-info .tooltip-arrow,
  .tooltip-success .tooltip-arrow,
  .tooltip-warning .tooltip-arrow,
  .tooltip-error .tooltip-arrow {
    border-color: transparent;
  }
  .tooltip-primary.tooltip-top .tooltip-arrow {
    border-top-color: var(--color-primary);
  }
  .tooltip-primary.tooltip-bottom .tooltip-arrow {
    border-bottom-color: var(--color-primary);
  }
  .tooltip-primary.tooltip-left .tooltip-arrow {
    border-left-color: var(--color-primary);
  }
  .tooltip-primary.tooltip-right .tooltip-arrow {
    border-right-color: var(--color-primary);
  }
  .tooltip-secondary.tooltip-top .tooltip-arrow {
    border-top-color: var(--color-secondary);
  }
  .tooltip-secondary.tooltip-bottom .tooltip-arrow {
    border-bottom-color: var(--color-secondary);
  }
  .tooltip-secondary.tooltip-left .tooltip-arrow {
    border-left-color: var(--color-secondary);
  }
  .tooltip-secondary.tooltip-right .tooltip-arrow {
    border-right-color: var(--color-secondary);
  }
  .tooltip-accent.tooltip-top .tooltip-arrow {
    border-top-color: var(--color-tertiary);
  }
  .tooltip-accent.tooltip-bottom .tooltip-arrow {
    border-bottom-color: var(--color-tertiary);
  }
  .tooltip-accent.tooltip-left .tooltip-arrow {
    border-left-color: var(--color-tertiary);
  }
  .tooltip-accent.tooltip-right .tooltip-arrow {
    border-right-color: var(--color-tertiary);
  }
  .tooltip-info.tooltip-top .tooltip-arrow {
    border-top-color: var(--color-info);
  }
  .tooltip-info.tooltip-bottom .tooltip-arrow {
    border-bottom-color: var(--color-info);
  }
  .tooltip-info.tooltip-left .tooltip-arrow {
    border-left-color: var(--color-info);
  }
  .tooltip-info.tooltip-right .tooltip-arrow {
    border-right-color: var(--color-info);
  }
  .tooltip-success.tooltip-top .tooltip-arrow {
    border-top-color: var(--color-success);
  }
  .tooltip-success.tooltip-bottom .tooltip-arrow {
    border-bottom-color: var(--color-success);
  }
  .tooltip-success.tooltip-left .tooltip-arrow {
    border-left-color: var(--color-success);
  }
  .tooltip-success.tooltip-right .tooltip-arrow {
    border-right-color: var(--color-success);
  }
  .tooltip-warning.tooltip-top .tooltip-arrow {
    border-top-color: var(--color-warning);
  }
  .tooltip-warning.tooltip-bottom .tooltip-arrow {
    border-bottom-color: var(--color-warning);
  }
  .tooltip-warning.tooltip-left .tooltip-arrow {
    border-left-color: var(--color-warning);
  }
  .tooltip-warning.tooltip-right .tooltip-arrow {
    border-right-color: var(--color-warning);
  }
  .tooltip-error.tooltip-top .tooltip-arrow {
    border-top-color: var(--color-error);
  }
  .tooltip-error.tooltip-bottom .tooltip-arrow {
    border-bottom-color: var(--color-error);
  }
  .tooltip-error.tooltip-left .tooltip-arrow {
    border-left-color: var(--color-error);
  }
  .tooltip-error.tooltip-right .tooltip-arrow {
    border-right-color: var(--color-error);
  }
`;

export class ElDmTooltip extends BaseElement {
  static properties = {
    content: { type: String, reflect: true },
    position: { type: String, reflect: true, default: 'top' },
    trigger: { type: String, reflect: true, default: 'hover' },
    delay: { type: Number, reflect: true, default: 0 },
    arrow: { type: Boolean, reflect: true, default: true },
    disabled: { type: Boolean, reflect: true },
    color: { type: String, reflect: true },
    open: { type: Boolean, reflect: true },
  };

  declare content: string;
  declare position: TooltipPosition;
  declare trigger: TooltipTrigger;
  declare delay: number;
  declare arrow: boolean;
  declare disabled: boolean;
  declare color: TooltipColor;
  declare open: boolean;

  private _showTimeout: number | null = null;
  private _isVisible = false;

  constructor() {
    super();
    this.attachStyles([styles, animationStyles]);
  }

  private _show(): void {
    if (this.disabled || !this.content) return;

    if (this.delay > 0) {
      this._showTimeout = window.setTimeout(() => {
        this._setVisible(true);
      }, this.delay);
    } else {
      this._setVisible(true);
    }
  }

  private _hide(): void {
    if (this._showTimeout) {
      clearTimeout(this._showTimeout);
      this._showTimeout = null;
    }
    this._setVisible(false);
  }

  private _setVisible(visible: boolean): void {
    this._isVisible = visible;
    const tooltipContent = this.shadowRoot?.querySelector('.tooltip-content');
    if (tooltipContent) {
      tooltipContent.classList.toggle('visible', visible);
    }
  }

  private _toggle(): void {
    if (this._isVisible) {
      this._hide();
    } else {
      this._show();
    }
  }

  private _getTooltipClasses(): string {
    const classes = ['tooltip-content'];

    if (this.position && POSITION_CLASSES[this.position]) {
      classes.push(POSITION_CLASSES[this.position]);
    } else {
      classes.push('tooltip-top');
    }

    if (this.color && COLOR_CLASSES[this.color]) {
      classes.push(COLOR_CLASSES[this.color]);
    }

    return classes.join(' ');
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._setupListeners();
    // Sync initial open state
    if (this.open) {
      this._setVisible(true);
    }
  }

  update(): void {
    super.update();
    // Sync open prop with visibility
    if (this.open) {
      this._setVisible(true);
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback?.();
    this._removeListeners();
  }

  private _setupListeners(): void {
    if (this.trigger === 'hover') {
      this.addEventListener('mouseenter', this._show.bind(this));
      this.addEventListener('mouseleave', this._hide.bind(this));
    } else if (this.trigger === 'click') {
      this.addEventListener('click', this._toggle.bind(this));
    }

    if (this.trigger === 'focus' || this.trigger === 'hover') {
      this.addEventListener('focusin', this._show.bind(this));
      this.addEventListener('focusout', this._hide.bind(this));
    }
  }

  private _removeListeners(): void {
    this.removeEventListener('mouseenter', this._show.bind(this));
    this.removeEventListener('mouseleave', this._hide.bind(this));
    this.removeEventListener('click', this._toggle.bind(this));
    this.removeEventListener('focusin', this._show.bind(this));
    this.removeEventListener('focusout', this._hide.bind(this));
  }

  render(): string {
    const tooltipClasses = this._getTooltipClasses();

    return `
      <div class="tooltip-wrapper" part="tooltip">
        <slot></slot>
        <div class="${tooltipClasses}" role="tooltip" part="content">
          ${this.content || ''}
          ${this.arrow ? '<span class="tooltip-arrow" part="arrow"></span>' : ''}
        </div>
      </div>
    `;
  }
}
