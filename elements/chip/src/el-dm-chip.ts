/**
 * DuskMoon Chip Element
 *
 * A chip component for displaying tags, filters, or selections.
 * Uses styles from @duskmoon-dev/core for consistent theming.
 *
 * @element el-dm-chip
 *
 * @attr {string} variant - Chip variant: filled, outlined, soft
 * @attr {string} color - Chip color: primary, secondary, tertiary, success, warning, error, info
 * @attr {string} size - Chip size: sm, md, lg
 * @attr {boolean} deletable - Whether the chip shows a delete button
 * @attr {boolean} selected - Whether the chip is in selected state
 * @attr {boolean} disabled - Whether the chip is disabled
 *
 * @slot - Default slot for chip content
 * @slot icon - Slot for leading icon
 *
 * @csspart chip - The chip container
 * @csspart icon - The icon container
 * @csspart delete - The delete button
 *
 * @fires delete - Fired when delete button is clicked
 * @fires click - Fired when chip is clicked
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as chipCSS } from '@duskmoon-dev/core/components/chip';

const VARIANT_CLASSES: Record<string, string> = {
  filled: '',
  outlined: 'chip-outlined',
  soft: 'chip-soft',
};

const COLOR_CLASSES: Record<string, string> = {
  primary: 'chip-primary',
  secondary: 'chip-secondary',
  tertiary: 'chip-tertiary',
  success: 'chip-success',
  warning: 'chip-warning',
  error: 'chip-error',
  info: 'chip-info',
};

const SIZE_CLASSES: Record<string, string> = {
  sm: 'chip-sm',
  md: '',
  lg: 'chip-lg',
};

export type ChipVariant = 'filled' | 'outlined' | 'soft';
export type ChipColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';
export type ChipSize = 'sm' | 'md' | 'lg';

// Strip @layer wrapper for Shadow DOM compatibility
const coreStyles = chipCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: inline-flex;
    vertical-align: middle;
  }

  :host([hidden]) {
    display: none !important;
  }

  ${coreStyles}

  .chip {
    font-family: inherit;
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    line-height: 1.25rem;
    cursor: pointer;
    transition: all 150ms ease;
    background-color: var(--color-surface-variant);
    color: var(--color-on-surface);
    border: 1px solid transparent;
  }

  .chip:hover {
    background-color: var(--color-surface-container);
  }

  .chip-sm {
    padding: 0.125rem 0.5rem;
    font-size: 0.75rem;
  }

  .chip-lg {
    padding: 0.375rem 1rem;
    font-size: 1rem;
  }

  .chip-outlined {
    background-color: transparent;
    border-color: var(--color-outline);
  }

  .chip-outlined:hover {
    background-color: var(--color-surface-variant);
  }

  .chip-primary {
    background-color: var(--color-primary);
    color: var(--color-on-primary);
  }

  .chip-secondary {
    background-color: var(--color-secondary);
    color: var(--color-on-secondary);
  }

  .chip-tertiary {
    background-color: var(--color-tertiary);
    color: var(--color-on-tertiary);
  }

  .chip-success {
    background-color: var(--color-success);
    color: var(--color-on-success);
  }

  .chip-warning {
    background-color: var(--color-warning);
    color: var(--color-on-warning);
  }

  .chip-error {
    background-color: var(--color-error);
    color: var(--color-on-error);
  }

  .chip-info {
    background-color: var(--color-info);
    color: var(--color-on-info);
  }

  .chip-selected {
    background-color: var(--color-primary);
    color: var(--color-on-primary);
  }

  :host([disabled]) .chip {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  .chip-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
  }

  .chip-delete {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    margin-left: 0.25rem;
    margin-right: -0.25rem;
    border-radius: 50%;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 150ms ease;
  }

  .chip-delete:hover {
    opacity: 1;
  }

  .chip-delete svg {
    width: 0.75rem;
    height: 0.75rem;
  }
`;

export class ElDmChip extends BaseElement {
  static properties = {
    variant: { type: String, reflect: true, default: 'filled' },
    color: { type: String, reflect: true },
    size: { type: String, reflect: true },
    deletable: { type: Boolean, reflect: true },
    selected: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  declare variant: ChipVariant;
  declare color: ChipColor;
  declare size: ChipSize;
  declare deletable: boolean;
  declare selected: boolean;
  declare disabled: boolean;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  private _handleDelete(event: Event): void {
    event.stopPropagation();
    if (!this.disabled) {
      this.emit('delete');
    }
  }

  private _handleClick(): void {
    if (!this.disabled) {
      this.emit('click');
    }
  }

  private _getChipClasses(): string {
    const classes = ['chip'];

    if (this.variant && VARIANT_CLASSES[this.variant]) {
      classes.push(VARIANT_CLASSES[this.variant]);
    }

    if (this.color && COLOR_CLASSES[this.color]) {
      classes.push(COLOR_CLASSES[this.color]);
    }

    if (this.size && SIZE_CLASSES[this.size]) {
      classes.push(SIZE_CLASSES[this.size]);
    }

    if (this.selected) {
      classes.push('chip-selected');
    }

    return classes.join(' ');
  }

  render(): string {
    const chipClasses = this._getChipClasses();
    const deleteIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>`;

    return `
      <span class="${chipClasses}" part="chip" role="button" tabindex="0">
        <span class="chip-icon" part="icon">
          <slot name="icon"></slot>
        </span>
        <slot></slot>
        ${this.deletable ? `<span class="chip-delete" part="delete">${deleteIcon}</span>` : ''}
      </span>
    `;
  }

  update(): void {
    super.update();

    const chip = this.shadowRoot?.querySelector('.chip');
    chip?.addEventListener('click', this._handleClick.bind(this));

    const deleteBtn = this.shadowRoot?.querySelector('.chip-delete');
    deleteBtn?.addEventListener('click', this._handleDelete.bind(this));
  }
}
