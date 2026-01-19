/**
 * DuskMoon Switch Element
 *
 * A toggle switch component for binary choices.
 *
 * @element el-dm-switch
 *
 * @attr {boolean} value - Whether the switch is on (true/false)
 * @attr {boolean} disabled - Whether the switch is disabled
 * @attr {string} size - Switch size: sm, md, lg
 * @attr {string} color - Switch color: primary, secondary, tertiary, success, warning, error, info
 * @attr {string} label - Label text for the switch
 * @attr {string} label-position - Label position: left, right
 * @attr {string} name - Form input name
 *
 * @csspart switch - The switch container
 * @csspart track - The switch track
 * @csspart thumb - The switch thumb/handle
 * @csspart label - The label element
 *
 * @fires change - Fired when the switch state changes
 * @fires input - Fired when the switch is toggled
 */

import { BaseElement, css } from '@duskmoon-dev/el-core';

export type SwitchSize = 'sm' | 'md' | 'lg';
export type SwitchColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

// Map of size attribute values to CSS classes
const SIZE_CLASSES: Record<string, string> = {
  sm: 'switch-sm',
  md: '',
  lg: 'switch-lg',
};

// Map of color attribute values to CSS classes
const COLOR_CLASSES: Record<string, string> = {
  primary: 'switch-primary',
  secondary: 'switch-secondary',
  tertiary: 'switch-tertiary',
  success: 'switch-success',
  warning: 'switch-warning',
  error: 'switch-error',
  info: 'switch-info',
};

const styles = css`
  :host {
    display: inline-flex;
    vertical-align: middle;
  }

  :host([hidden]) {
    display: none !important;
  }

  /* Base switch container */
  .switch {
    --switch-width: 3.25rem;
    --switch-height: 2rem;
    --switch-thumb-size: 1rem;
    --switch-color: var(--color-primary, oklch(60% 0.15 250));
    --switch-track-color: var(--color-surface-container-highest, #e0e0e0);
    --switch-border-color: var(--color-outline, #999);
    --switch-thumb-color: var(--color-outline, #999);

    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    user-select: none;
    font-family: inherit;
    font-size: 0.875rem;
    color: var(--color-on-surface, #1a1a1a);
  }

  /* Hide the actual checkbox */
  .switch-input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Track (the pill-shaped background) */
  .switch-track {
    position: relative;
    display: inline-grid;
    grid-template-columns: 0fr 1fr 1fr;
    align-items: center;
    width: var(--switch-width);
    height: var(--switch-height);
    padding: 0.25rem;
    background-color: var(--switch-track-color);
    border: 2px solid var(--switch-border-color);
    border-radius: var(--switch-height);
    transition:
      background-color 200ms ease-in-out,
      border-color 200ms ease-in-out,
      grid-template-columns 200ms ease-in-out;
  }

  /* Thumb (the circular knob) */
  .switch-thumb {
    grid-column: 2;
    width: var(--switch-thumb-size);
    height: var(--switch-thumb-size);
    background-color: var(--switch-thumb-color);
    border-radius: 50%;
    transition:
      background-color 200ms ease-in-out,
      width 200ms ease-in-out,
      margin 200ms ease-in-out;
  }

  /* Checked state */
  .switch-input:checked + .switch-track {
    grid-template-columns: 1fr 1fr 0fr;
    background-color: var(--switch-color);
    border-color: var(--switch-color);
  }

  .switch-input:checked + .switch-track .switch-thumb {
    background-color: var(--color-primary-content, white);
  }

  /* Hover state (unchecked) */
  .switch:hover .switch-input:not(:disabled):not(:checked) + .switch-track {
    background-color: var(--color-surface-container-high, #d0d0d0);
  }

  .switch:hover .switch-input:not(:disabled):not(:checked) + .switch-track .switch-thumb {
    background-color: var(--color-on-surface-variant, #666);
  }

  /* Hover state (checked) */
  .switch:hover .switch-input:checked:not(:disabled) + .switch-track {
    background-color: color-mix(in oklch, var(--switch-color), black 10%);
    border-color: color-mix(in oklch, var(--switch-color), black 10%);
  }

  /* Focus state */
  .switch-input:focus-visible + .switch-track {
    outline: 2px solid var(--switch-color);
    outline-offset: 2px;
  }

  /* Active/pressed state */
  .switch:active .switch-input:not(:disabled) + .switch-track .switch-thumb {
    width: calc(var(--switch-thumb-size) + 0.25rem);
  }

  .switch:active .switch-input:checked:not(:disabled) + .switch-track .switch-thumb {
    margin-left: -0.25rem;
  }

  /* Disabled state */
  .switch:has(.switch-input:disabled) {
    cursor: not-allowed;
    opacity: 0.38;
  }

  .switch-input:disabled + .switch-track {
    background-color: color-mix(
      in oklch,
      var(--color-surface-container-highest, #e0e0e0) 12%,
      transparent
    );
    border-color: color-mix(in oklch, var(--color-on-surface, #1a1a1a) 12%, transparent);
  }

  .switch-input:disabled + .switch-track .switch-thumb {
    background-color: color-mix(in oklch, var(--color-on-surface, #1a1a1a) 38%, transparent);
  }

  .switch-input:disabled:checked + .switch-track {
    background-color: color-mix(in oklch, var(--color-on-surface, #1a1a1a) 12%, transparent);
    border-color: transparent;
  }

  .switch-input:disabled:checked + .switch-track .switch-thumb {
    background-color: var(--color-surface, white);
  }

  /* Size variants */
  .switch-sm {
    --switch-width: 2.5rem;
    --switch-height: 1.5rem;
    --switch-thumb-size: 0.75rem;
  }

  .switch-lg {
    --switch-width: 4rem;
    --switch-height: 2.5rem;
    --switch-thumb-size: 1.25rem;
  }

  /* Color variants */
  .switch-primary {
    --switch-color: var(--color-primary, oklch(60% 0.15 250));
  }

  .switch-secondary {
    --switch-color: var(--color-secondary, oklch(55% 0.1 250));
  }

  .switch-tertiary {
    --switch-color: var(--color-tertiary, oklch(50% 0.12 300));
  }

  .switch-success {
    --switch-color: var(--color-success, oklch(60% 0.15 145));
  }

  .switch-warning {
    --switch-color: var(--color-warning, oklch(75% 0.15 85));
  }

  .switch-error {
    --switch-color: var(--color-error, oklch(55% 0.2 25));
  }

  .switch-info {
    --switch-color: var(--color-info, oklch(60% 0.15 250));
  }

  /* Label text */
  .switch-label {
    color: var(--color-on-surface, #1a1a1a);
  }

  .switch-label-left {
    order: -1;
  }

  /* Reduce motion */
  @media (prefers-reduced-motion: reduce) {
    .switch-track,
    .switch-thumb {
      transition: none;
    }
  }
`;

export class ElDmSwitch extends BaseElement {
  static properties = {
    value: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
    color: { type: String, reflect: true },
    label: { type: String, reflect: true },
    labelPosition: { type: String, reflect: true, attribute: 'label-position' },
    name: { type: String, reflect: true },
  };

  /** Whether the switch is on (true/false) */
  declare value: boolean;

  /** Whether the switch is disabled */
  declare disabled: boolean;

  /** Switch size */
  declare size: SwitchSize;

  /** Switch color */
  declare color: SwitchColor;

  /** Label text */
  declare label: string;

  /** Label position */
  declare labelPosition: 'left' | 'right';

  /** Form input name */
  declare name: string;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  /**
   * Handle switch toggle
   */
  private _handleChange(event: Event): void {
    if (this.disabled) {
      event.preventDefault();
      return;
    }

    const input = event.target as HTMLInputElement;
    this.value = input.checked;

    this.emit('change', { value: this.value });
    this.emit('input', { value: this.value });
  }

  /**
   * Handle keyboard interaction
   */
  private _handleKeyDown(event: KeyboardEvent): void {
    if (this.disabled) return;

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.value = !this.value;
      this.emit('change', { value: this.value });
      this.emit('input', { value: this.value });
    }
  }

  /**
   * Build CSS class string for the switch
   */
  private _getSwitchClasses(): string {
    const classes = ['switch'];

    // Add size class
    if (this.size && SIZE_CLASSES[this.size]) {
      classes.push(SIZE_CLASSES[this.size]);
    }

    // Add color class
    if (this.color && COLOR_CLASSES[this.color]) {
      classes.push(COLOR_CLASSES[this.color]);
    }

    return classes.join(' ');
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('keydown', this._handleKeyDown.bind(this));
  }

  render(): string {
    const switchClasses = this._getSwitchClasses();
    const labelClass =
      this.labelPosition === 'left' ? 'switch-label switch-label-left' : 'switch-label';

    return `
      <label class="${switchClasses}" part="switch">
        <input
          type="checkbox"
          class="switch-input"
          ${this.value ? 'checked' : ''}
          ${this.disabled ? 'disabled' : ''}
          ${this.name ? `name="${this.name}"` : ''}
          value="${this.value ? 'true' : 'false'}"
          role="switch"
          aria-checked="${this.value ? 'true' : 'false'}"
        />
        <span class="switch-track" part="track">
          <span class="switch-thumb" part="thumb"></span>
        </span>
        ${this.label ? `<span class="${labelClass}" part="label">${this.label}</span>` : ''}
      </label>
    `;
  }

  update(): void {
    super.update();
    const input = this.shadowRoot?.querySelector('input');
    if (input) {
      input.addEventListener('change', this._handleChange.bind(this));
    }
  }
}
