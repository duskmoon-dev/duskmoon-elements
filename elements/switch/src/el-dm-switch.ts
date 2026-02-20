/**
 * DuskMoon Switch Element
 *
 * A toggle switch component for binary choices.
 * Uses styles from @duskmoon-dev/core for consistent theming.
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
 * @csspart switch - The switch label container
 * @csspart label - The label element
 *
 * @fires change - Fired when the switch state changes
 * @fires input - Fired when the switch is toggled
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as switchCSS } from '@duskmoon-dev/core/components/switch';

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

// Strip @layer wrapper for Shadow DOM compatibility
const coreStyles = switchCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: inline-flex;
    vertical-align: middle;
  }

  :host([hidden]) {
    display: none !important;
  }

  /* Import core switch styles */
  ${coreStyles}

  /* Web component specific adjustments */
  .switch-label {
    font-family: inherit;
  }

  .switch-text-left {
    order: -1;
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
   * Build CSS class string for the switch input
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
    const textClass = this.labelPosition === 'left' ? 'switch-text-left' : '';

    return `
      <label class="switch-label" part="switch">
        <input
          type="checkbox"
          class="${switchClasses}"
          ${this.value ? 'checked' : ''}
          ${this.disabled ? 'disabled' : ''}
          ${this.name ? `name="${this.name}"` : ''}
          value="${this.value ? 'true' : 'false'}"
          role="switch"
          aria-checked="${this.value ? 'true' : 'false'}"
        />
        ${this.label ? `<span class="${textClass}" part="label">${this.label}</span>` : ''}
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
