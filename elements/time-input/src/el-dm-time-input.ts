/**
 * @duskmoon-dev/el-time-input
 *
 * A time selection input component.
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as timeInputCSS } from '@duskmoon-dev/core/components/time-input';

const coreStyles = timeInputCSS
  .replace(/@layer\s+components\s*\{/, '')
  .replace(/\}\s*$/, '');

export type TimeInputColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'error';

const styles = css`
  :host {
    display: block;
    width: 100%;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreStyles}
`;

export class ElDmTimeInput extends BaseElement {
  static properties = {
    value: { type: String, reflect: true, default: '' },
    disabled: { type: Boolean, reflect: true },
    color: { type: String, reflect: true, default: 'primary' },
  };

  declare value: string;
  declare disabled: boolean;
  declare color: TimeInputColor;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    const colorClass = `time-input-${this.color || 'primary'}`;
    return `
      <div class="time-input ${colorClass}">
        <input type="time" class="time-input-field" value="${this.value || ''}" ${this.disabled ? 'disabled' : ''} />
      </div>
    `;
  }
}

export function register(): void {
  if (!customElements.get('el-dm-time-input')) {
    customElements.define('el-dm-time-input', ElDmTimeInput);
  }
}
