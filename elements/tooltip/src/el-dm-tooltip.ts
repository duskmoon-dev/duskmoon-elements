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

import { BaseElement, css } from '@duskmoon-dev/el-core';
import { css as tooltipCSS } from '@duskmoon-dev/core/components/tooltip';

const POSITION_CLASSES: Record<string, string> = {
  top: 'tooltip-top',
  bottom: 'tooltip-bottom',
  left: 'tooltip-left',
  right: 'tooltip-right',
};

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipTrigger = 'hover' | 'click' | 'focus';

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
    transition: opacity 150ms ease, visibility 150ms ease;
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
`;

export class ElDmTooltip extends BaseElement {
  static properties = {
    content: { type: String, reflect: true },
    position: { type: String, reflect: true, default: 'top' },
    trigger: { type: String, reflect: true, default: 'hover' },
    delay: { type: Number, reflect: true, default: 0 },
    arrow: { type: Boolean, reflect: true, default: true },
    disabled: { type: Boolean, reflect: true },
  };

  declare content: string;
  declare position: TooltipPosition;
  declare trigger: TooltipTrigger;
  declare delay: number;
  declare arrow: boolean;
  declare disabled: boolean;

  private _showTimeout: number | null = null;
  private _isVisible = false;

  constructor() {
    super();
    this.attachStyles(styles);
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

    return classes.join(' ');
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._setupListeners();
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
