import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as validatorCSS } from '@duskmoon-dev/core/components/validator';

export type ValidatorState = 'error' | 'success' | 'warning' | 'info';
const STATES = new Set(['error', 'success', 'warning', 'info']);
const coreStyles = validatorCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
const styles = css`
  :host {
    display: block;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreStyles}
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  ::slotted([slot='hint']) {
    font-size: 0.75rem;
    color: var(--color-on-surface-variant);
  }
  ::slotted([slot='error']) {
    display: none;
    font-size: 0.75rem;
    color: var(--color-error);
  }
  :host([state='error']) ::slotted([slot='error']) {
    display: block;
  }
  ::slotted([aria-invalid='true']),
  ::slotted(.validator:user-invalid) {
    color: var(--color-error);
    border-color: var(--color-error);
  }
  ::slotted(.validator.validator-success:user-valid) {
    color: var(--color-success);
    border-color: var(--color-success);
  }
`;

export class ElDmValidator extends BaseElement {
  static properties = { state: { type: String, reflect: true } };
  declare state: ValidatorState;
  constructor() {
    super();
    this.attachStyles(styles);
  }
  render(): string {
    const state = STATES.has(this.state) ? ` form-group-${this.state}` : '';
    return `<div class="form-group${state}" part="group"><slot></slot><slot name="hint"></slot><slot name="error"></slot></div>`;
  }
}
