/**
 * @duskmoon-dev/el-otp-input
 *
 * A one-time password (OTP) input component for verification codes.
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as otpInputCSS } from '@duskmoon-dev/core/components/otp-input';

const coreStyles = otpInputCSS
  .replace(/@layer\s+components\s*\{/, '')
  .replace(/\}\s*$/, '');

export type OtpInputColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'error';

const styles = css`
  :host {
    display: inline-flex;
    vertical-align: middle;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreStyles}
`;

export class ElDmOtpInput extends BaseElement {
  static properties = {
    length: { type: Number, reflect: true, default: 6 },
    color: { type: String, reflect: true, default: 'primary' },
    disabled: { type: Boolean, reflect: true },
  };

  declare length: number;
  declare color: OtpInputColor;
  declare disabled: boolean;

  #listening = false;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  override update(): void {
    super.update();
    if (!this.#listening && this.shadowRoot) {
      this.#listening = true;
      this.shadowRoot.addEventListener('input', this.#onInput.bind(this));
      this.shadowRoot.addEventListener('keydown', this.#onKeydown.bind(this) as EventListener);
    }
  }

  #onInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (!input.classList.contains('otp-input-field')) return;
    if (input.value.length === 1) {
      const next = input.nextElementSibling as HTMLInputElement | null;
      next?.focus();
    }
  }

  #onKeydown(e: KeyboardEvent): void {
    const input = e.target as HTMLInputElement;
    if (!input.classList.contains('otp-input-field')) return;
    if (e.key === 'Backspace' && input.value === '') {
      const prev = input.previousElementSibling as HTMLInputElement | null;
      prev?.focus();
    }
  }

  render(): string {
    const len = this.length || 6;
    const colorClass = `otp-input-${this.color || 'primary'}`;
    const fields = Array.from(
      { length: len },
      () =>
        `<input type="text" maxlength="1" class="otp-input-field" ${this.disabled ? 'disabled' : ''} />`
    ).join('');
    return `<div class="otp-input ${colorClass}">${fields}</div>`;
  }
}

export function register(): void {
  if (!customElements.get('el-dm-otp-input')) {
    customElements.define('el-dm-otp-input', ElDmOtpInput);
  }
}
