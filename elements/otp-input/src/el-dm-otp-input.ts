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

  constructor() {
    super();
    this.attachStyles(styles);
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
