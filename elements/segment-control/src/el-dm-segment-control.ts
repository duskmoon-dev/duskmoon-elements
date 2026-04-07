/**
 * @duskmoon-dev/el-segment-control
 *
 * A segmented button/toggle group component.
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';

export type SegmentControlColor =
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

  .segment-control {
    display: inline-flex;
    align-items: stretch;
    color: var(--color-on-surface);
    background-color: var(--color-surface-container);
    border: 1px solid var(--color-outline);
    border-radius: 1.25rem;
    padding: 0.25rem;
    gap: 0.25rem;
  }

  /* Slotted button base styles */
  ::slotted(button) {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.25rem;
    color: var(--color-on-surface);
    background-color: transparent;
    border: none;
    border-radius: 1rem;
    cursor: pointer;
    transition: background-color 150ms ease-in-out, color 150ms ease-in-out;
    user-select: none;
    white-space: nowrap;
  }

  ::slotted(button:hover:not(:disabled):not(.active)) {
    background-color: var(--color-surface-container-high);
  }

  ::slotted(button:focus-visible) {
    outline: none;
    box-shadow: color-mix(in oklch, currentcolor 20%, transparent) 0px 0px 0px 3px;
  }

  ::slotted(button:disabled) {
    opacity: 0.38;
    cursor: not-allowed;
  }

  ::slotted(button.active) {
    background-color: var(--color-primary-container);
    color: var(--color-on-primary-container);
  }

  /* Color variants */
  .segment-control-primary ::slotted(button.active) {
    background-color: var(--color-primary);
    color: var(--color-primary-content);
  }

  .segment-control-secondary ::slotted(button.active) {
    background-color: var(--color-secondary-container);
    color: var(--color-on-secondary-container);
  }

  .segment-control-tertiary ::slotted(button.active) {
    background-color: var(--color-tertiary-container);
    color: var(--color-on-tertiary-container);
  }

  .segment-control-success ::slotted(button.active) {
    background-color: var(--color-success-container);
    color: var(--color-on-success-container);
  }

  .segment-control-warning ::slotted(button.active) {
    background-color: var(--color-warning-container);
    color: var(--color-on-warning-container);
  }

  .segment-control-error ::slotted(button.active) {
    background-color: var(--color-error-container);
    color: var(--color-on-error-container);
  }

  @media (prefers-reduced-motion: reduce) {
    ::slotted(button) {
      transition: none;
    }
  }
`;

export class ElDmSegmentControl extends BaseElement {
  static properties = {
    color: { type: String, reflect: true, default: 'primary' },
  };

  declare color: SegmentControlColor;

  #handleClick = (e: Event) => {
    const target = e.currentTarget as HTMLElement;
    if (target.hasAttribute('disabled')) return;

    // Deactivate all siblings
    const items = this.querySelectorAll('button');
    items.forEach((item) => item.classList.remove('active'));

    // Activate clicked item
    target.classList.add('active');

    this.emit('change', { value: target.textContent?.trim() ?? '' });
  };

  #handleSlotChange = () => {
    const slot = this.shadowRoot!.querySelector('slot');
    if (!slot) return;

    const nodes = slot.assignedElements({ flatten: true });
    nodes.forEach((node) => {
      if (node instanceof HTMLElement) {
        node.removeEventListener('click', this.#handleClick);
        node.addEventListener('click', this.#handleClick);
      }
    });
  };

  constructor() {
    super();
    this.attachStyles(styles);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.shadowRoot!.addEventListener('slotchange', this.#handleSlotChange);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.shadowRoot!.removeEventListener('slotchange', this.#handleSlotChange);
    // Clean up click listeners
    const items = this.querySelectorAll('button');
    items.forEach((item) => {
      item.removeEventListener('click', this.#handleClick);
    });
  }

  render(): string {
    const colorClass = `segment-control-${this.color || 'primary'}`;
    return `<div class="segment-control ${colorClass}"><slot></slot></div>`;
  }
}

export function register(): void {
  if (!customElements.get('el-dm-segment-control')) {
    customElements.define('el-dm-segment-control', ElDmSegmentControl);
  }
}
