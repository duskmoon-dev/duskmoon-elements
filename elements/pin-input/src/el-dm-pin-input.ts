/**
 * @duskmoon-dev/el-pin-input
 *
 * A PIN input component for secure PIN entry.
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as pinInputCSS } from '@duskmoon-dev/core/components/pin-input';

const coreStyles = pinInputCSS
  .replace(/@layer\s+components\s*\{/, '')
  .replace(/\}\s*$/, '');

export type PinInputColor =
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

export class ElDmPinInput extends BaseElement {
  static properties = {
    length: { type: Number, reflect: true, default: 4 },
    color: { type: String, reflect: true, default: 'primary' },
    disabled: { type: Boolean, reflect: true },
    masked: { type: Boolean, reflect: true, default: true },
  };

  declare length: number;
  declare color: PinInputColor;
  declare disabled: boolean;
  declare masked: boolean;

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
    if (!input.classList.contains('pin-input-field')) return;
    if (input.value.length === 1) {
      const next = input.nextElementSibling as HTMLInputElement | null;
      next?.focus();
    }
  }

  #onKeydown(e: KeyboardEvent): void {
    const input = e.target as HTMLInputElement;
    if (!input.classList.contains('pin-input-field')) return;
    if (e.key === 'Backspace' && input.value === '') {
      const prev = input.previousElementSibling as HTMLInputElement | null;
      prev?.focus();
    }
  }

  render(): string {
    const len = this.length || 4;
    const colorClass = `pin-input-${this.color || 'primary'}`;
    const inputType = this.masked !== false ? 'password' : 'text';
    const fields = Array.from(
      { length: len },
      () =>
        `<input type="${inputType}" maxlength="1" class="pin-input-field" ${this.disabled ? 'disabled' : ''} />`
    ).join('');
    return `<div class="pin-input ${colorClass}">${fields}</div>`;
  }
}

export function register(): void {
  if (!customElements.get('el-dm-pin-input')) {
    customElements.define('el-dm-pin-input', ElDmPinInput);
  }
}
