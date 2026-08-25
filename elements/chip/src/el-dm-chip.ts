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
 * @attr {string} href - Renders the chip as a semantic link
 * @attr {string} target - Link browsing context
 * @attr {string} rel - Link relationship
 * @attr {boolean} clickable - Renders the chip as an action button
 * @attr {boolean} selectable - Renders the chip as a toggle button
 * @attr {boolean} deletable - Whether the chip shows a delete button
 * @attr {string} delete-label - Accessible name for the delete button
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
 * @fires dm-click - Fired when a clickable or linked chip is activated
 * @fires dm-change - Fired when a selectable chip changes state
 * @fires dm-delete - Fired when the delete button is activated
 * @fires delete - Deprecated alias for dm-delete
 * @fires click - Native click event from link and button modes
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

const DELETE_ICON = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>`;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function matchesSelector(target: EventTarget, selector: string): target is Element {
  return (
    typeof (target as Partial<Element>).matches === 'function' &&
    (target as Element).matches(selector)
  );
}

export type ChipVariant = 'filled' | 'outlined' | 'soft';
export type ChipColor =
  'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'info';
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
    cursor: default;
    transition: all 150ms ease;
    background-color: var(--color-surface-variant);
    color: var(--color-on-surface);
    border: 1px solid transparent;
  }

  a.chip,
  button.chip {
    appearance: none;
    text-decoration: none;
  }

  .chip-clickable {
    cursor: pointer;
  }

  a.chip:focus-visible,
  button.chip:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
    box-shadow: none;
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
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    margin-left: 0.25rem;
    margin-right: -0.25rem;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 150ms ease;
  }

  .chip-delete:hover {
    opacity: 1;
  }

  .chip-delete:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
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
    href: { type: String, reflect: true },
    target: { type: String, reflect: true },
    rel: { type: String, reflect: true },
    clickable: { type: Boolean, reflect: true },
    selectable: { type: Boolean, reflect: true },
    deletable: { type: Boolean, reflect: true },
    deleteLabel: {
      type: String,
      reflect: true,
      attribute: 'delete-label',
      default: 'Remove chip',
    },
    selected: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  declare variant: ChipVariant;
  declare color: ChipColor;
  declare size: ChipSize;
  declare href: string | undefined;
  declare target: string | undefined;
  declare rel: string | undefined;
  declare clickable: boolean;
  declare selectable: boolean;
  declare deletable: boolean;
  declare deleteLabel: string;
  declare selected: boolean;
  declare disabled: boolean;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.shadowRoot.addEventListener('click', this._handleShadowClick);
  }

  disconnectedCallback(): void {
    this.shadowRoot.removeEventListener('click', this._handleShadowClick);
    super.disconnectedCallback();
  }

  private _handleShadowClick = (event: Event): void => {
    const eventPath = event.composedPath();
    const deleteButton = eventPath.find((target) => matchesSelector(target, '.chip-delete')) as
      HTMLButtonElement | undefined;

    if (deleteButton) {
      event.stopPropagation();
      if (this.disabled || deleteButton.disabled) return;

      this.emit('dm-delete');
      this.emit('delete');
      return;
    }

    const chip = eventPath.find((target) => matchesSelector(target, '.chip')) as
      HTMLElement | undefined;
    if (!chip) return;

    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (this.deletable) return;

    if (this.hasAttribute('href')) {
      if (!this.emit('dm-click')) event.preventDefault();
      return;
    }

    if (this.selectable) {
      this.selected = !this.selected;
      this.emit('dm-change', { selected: this.selected });
      return;
    }

    if (this.clickable && !this.emit('dm-click')) event.preventDefault();
  };

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

    if (
      !this.disabled &&
      !this.deletable &&
      (this.hasAttribute('href') || this.selectable || this.clickable)
    ) {
      classes.push('chip-clickable');
    }

    return classes.join(' ');
  }

  private _renderContent(): string {
    return `
      <span class="chip-icon" part="icon">
        <slot name="icon"></slot>
      </span>
      <slot></slot>
    `;
  }

  render(): string {
    const chipClasses = this._getChipClasses();
    const content = this._renderContent();

    if (this.deletable) {
      const deleteLabel = escapeHtml(this.deleteLabel || 'Remove chip');
      return `
        <span class="${chipClasses}" part="chip"${this.disabled ? ' aria-disabled="true"' : ''}>
          ${content}
          <button
            class="chip-delete"
            part="delete"
            type="button"
            aria-label="${deleteLabel}"
            ${this.disabled ? 'disabled' : ''}
          >${DELETE_ICON}</button>
        </span>
      `;
    }

    if (this.hasAttribute('href')) {
      if (this.disabled) {
        return `
          <span class="${chipClasses}" part="chip" aria-disabled="true">${content}</span>
        `;
      }

      const href = escapeHtml(this.href ?? '');
      const target = this.target ? ` target="${escapeHtml(this.target)}"` : '';
      const rel = this.rel ? ` rel="${escapeHtml(this.rel)}"` : '';
      return `
        <a class="${chipClasses}" part="chip" href="${href}"${target}${rel}>${content}</a>
      `;
    }

    if (this.selectable) {
      return `
        <button
          class="${chipClasses}"
          part="chip"
          type="button"
          aria-pressed="${this.selected ? 'true' : 'false'}"
          ${this.disabled ? 'disabled' : ''}
        >${content}</button>
      `;
    }

    if (this.clickable) {
      return `
        <button
          class="${chipClasses}"
          part="chip"
          type="button"
          ${this.disabled ? 'disabled' : ''}
        >${content}</button>
      `;
    }

    return `
      <span class="${chipClasses}" part="chip">
        ${content}
      </span>
    `;
  }

  protected override update(): void {
    const activeElement = this.shadowRoot.activeElement;
    const activeSelector = activeElement?.classList.contains('chip-delete')
      ? '.chip-delete'
      : activeElement?.matches('a.chip, button.chip')
        ? '.chip'
        : undefined;

    super.update();

    if (activeSelector) {
      this.shadowRoot.querySelector<HTMLElement>(activeSelector)?.focus();
    }
  }
}
