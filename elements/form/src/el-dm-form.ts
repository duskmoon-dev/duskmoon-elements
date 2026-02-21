/**
 * DuskMoon Form Element
 *
 * A form wrapper component that provides consistent styling and validation states
 * for form controls. Uses styles from @duskmoon-dev/core for consistent theming.
 *
 * @element el-dm-form
 *
 * @attr {string} validation-state - Validation state: default, error, success
 * @attr {string} gap - Gap between form fields (CSS length, default '1rem')
 * @attr {boolean} disabled - Whether the form is disabled
 *
 * @slot - Default slot for form content
 *
 * @csspart form - The form container
 *
 * @fires submit - Fired when the form is submitted
 * @fires reset - Fired when the form is reset
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as formCSS } from '@duskmoon-dev/core/components/form';

export type FormValidationState = 'default' | 'error' | 'success';

// Strip @layer wrapper for Shadow DOM compatibility
const coreStyles = formCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: block;
  }

  :host([hidden]) {
    display: none !important;
  }

  ${coreStyles}

  /* Web component specific adjustments */
  .form {
    display: flex;
    flex-direction: column;
    gap: var(--form-gap, 1rem);
    font-family: inherit;
  }

  :host([disabled]) {
    opacity: 0.6;
    pointer-events: none;
  }

  /* Form control wrapper */
  .form-control {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 0;
  }

  .form-control.error .label-text,
  .form-control.error .helper-text {
    color: var(--color-error);
  }

  .form-control.success .label-text,
  .form-control.success .helper-text {
    color: var(--color-success);
  }

  /* Label */
  .label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .label-text {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-on-surface);
  }

  .label-text.required::after {
    content: ' *';
    color: var(--color-error);
  }

  /* Helper text */
  .helper-text {
    font-size: 0.75rem;
    color: var(--color-on-surface-variant, var(--color-on-surface));
    opacity: 0.7;
  }

  .helper-text.error {
    color: var(--color-error);
    opacity: 1;
  }

  .helper-text.success {
    color: var(--color-success);
    opacity: 1;
  }
`;

export class ElDmForm extends BaseElement {
  static properties = {
    validationState: {
      type: String,
      reflect: true,
      attribute: 'validation-state',
      default: 'default',
    },
    gap: { type: String, reflect: true, default: '1rem' },
    disabled: { type: Boolean, reflect: true },
  };

  declare validationState: FormValidationState;
  declare gap: string;
  declare disabled: boolean;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  private _handleSubmit(e: Event): void {
    e.preventDefault();
    if (this.disabled) return;
    this.emit('submit', { form: this });
  }

  private _handleReset(e: Event): void {
    e.preventDefault();
    if (this.disabled) return;
    this.emit('reset', { form: this });
  }

  render(): string {
    return `
      <form class="form" part="form" style="--form-gap: ${this.gap}">
        <slot></slot>
      </form>
    `;
  }

  update(): void {
    super.update();
    const form = this.shadowRoot?.querySelector('form');
    if (form) {
      form.addEventListener('submit', this._handleSubmit.bind(this));
      form.addEventListener('reset', this._handleReset.bind(this));
    }
  }

  /**
   * Submit the form programmatically
   */
  submit(): void {
    const form = this.shadowRoot?.querySelector('form');
    if (form && !this.disabled) {
      form.requestSubmit();
    }
  }

  /**
   * Reset the form programmatically
   */
  reset(): void {
    const form = this.shadowRoot?.querySelector('form');
    if (form && !this.disabled) {
      form.reset();
      this.emit('reset', { form: this });
    }
  }
}
