/**
 * DuskMoon Alert Element
 *
 * A component for displaying important messages to users.
 * Uses styles from @duskmoon-dev/core for consistent theming.
 *
 * @element el-dm-alert
 *
 * @attr {string} type - Alert type: info, success, warning, error
 * @attr {string} variant - Alert variant: filled, outlined
 * @attr {boolean} dismissible - Whether the alert can be dismissed
 * @attr {boolean} compact - Use compact styling
 * @attr {string} title - Alert title
 *
 * @slot - Default slot for alert content
 * @slot icon - Custom icon slot
 * @slot actions - Action buttons slot
 *
 * @csspart alert - The alert container
 * @csspart icon - The icon wrapper
 * @csspart content - The content wrapper
 * @csspart title - The title element
 * @csspart close - The close button
 *
 * @fires dismiss - Fired when alert is dismissed
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as alertCSS } from '@duskmoon-dev/core/components/alert';

const TYPE_CLASSES: Record<string, string> = {
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error',
};

const VARIANT_CLASSES: Record<string, string> = {
  filled: 'alert-filled',
  outlined: 'alert-outlined',
};

export type AlertType = 'info' | 'success' | 'warning' | 'error';
export type AlertVariant = 'filled' | 'outlined';

const coreStyles = alertCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: block;
  }

  :host([hidden]) {
    display: none !important;
  }

  ${coreStyles}

  .alert {
    font-family: inherit;
  }
`;

export class ElDmAlert extends BaseElement {
  static properties = {
    type: { type: String, reflect: true, default: 'info' },
    variant: { type: String, reflect: true },
    dismissible: { type: Boolean, reflect: true },
    compact: { type: Boolean, reflect: true },
    title: { type: String, reflect: true },
  };

  declare type: AlertType;
  declare variant: AlertVariant;
  declare dismissible: boolean;
  declare compact: boolean;
  declare title: string;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  private _handleDismiss(): void {
    this.emit('dismiss');
    this.remove();
  }

  private _getAlertClasses(): string {
    const classes = ['alert'];

    if (this.type && TYPE_CLASSES[this.type]) {
      classes.push(TYPE_CLASSES[this.type]);
    }

    if (this.variant && VARIANT_CLASSES[this.variant]) {
      classes.push(VARIANT_CLASSES[this.variant]);
    }

    if (this.dismissible) {
      classes.push('alert-dismissible');
    }

    if (this.compact) {
      classes.push('alert-compact');
    }

    return classes.join(' ');
  }

  private _getDefaultIcon(): string {
    const icons: Record<string, string> = {
      info: 'ℹ',
      success: '✓',
      warning: '⚠',
      error: '✕',
    };
    return icons[this.type] || icons.info;
  }

  render(): string {
    const alertClasses = this._getAlertClasses();

    return `
      <div class="${alertClasses}" role="alert" part="alert">
        <span class="alert-icon" part="icon">
          <slot name="icon">${this._getDefaultIcon()}</slot>
        </span>
        <div class="alert-content" part="content">
          ${this.title ? `<div class="alert-title" part="title">${this.title}</div>` : ''}
          <div class="alert-description">
            <slot></slot>
          </div>
          <div class="alert-actions">
            <slot name="actions"></slot>
          </div>
        </div>
        ${this.dismissible ? `<button class="alert-close" part="close" aria-label="Dismiss">✕</button>` : ''}
      </div>
    `;
  }

  update(): void {
    super.update();
    if (this.dismissible) {
      const closeBtn = this.shadowRoot?.querySelector('.alert-close');
      closeBtn?.addEventListener('click', this._handleDismiss.bind(this));
    }
  }
}
