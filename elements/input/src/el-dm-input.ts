/**
 * DuskMoon Input Element
 *
 * A text input component with label and validation states.
 * Uses styles from @duskmoon-dev/core for consistent theming.
 *
 * @element el-dm-input
 *
 * @attr {string} type - Input type: text, password, email, number, tel, url, search
 * @attr {string} value - Current input value
 * @attr {string} name - Form field name
 * @attr {string} label - Label text
 * @attr {string} placeholder - Placeholder text
 * @attr {boolean} disabled - Whether the input is disabled
 * @attr {boolean} readonly - Whether the input is readonly
 * @attr {boolean} required - Whether the input is required
 * @attr {string} size - Input size: sm, md, lg
 * @attr {string} validation-state - Validation state: valid, invalid, pending
 * @attr {string} error-message - Error message to display
 * @attr {string} helper-text - Helper text to display
 *
 * @slot prefix - Content before the input
 * @slot suffix - Content after the input
 *
 * @csspart container - The outer container
 * @csspart label - The label element
 * @csspart input-wrapper - The wrapper around the input
 * @csspart input - The native input element
 * @csspart prefix - The prefix slot wrapper
 * @csspart suffix - The suffix slot wrapper
 * @csspart helper - The helper text element
 * @csspart error - The error message element
 *
 * @fires dm-input - Fired when value changes during input
 * @fires dm-change - Fired when value changes and input loses focus
 * @fires dm-focus - Fired when input gains focus
 * @fires dm-blur - Fired when input loses focus
 */

import { BaseElement, css, validate } from '@duskmoon-dev/el-base';
import { css as inputCSS } from '@duskmoon-dev/core/components/input';
import type { Size, ValidationState, Validator, ValidationResult } from '@duskmoon-dev/el-base';

/**
 * Supported input types
 */
export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';

// Map of size attribute values to CSS classes
const SIZE_CLASSES: Record<string, string> = {
  sm: 'input-sm',
  md: '',
  lg: 'input-lg',
};

// Map of validation state to CSS classes
const VALIDATION_CLASSES: Record<string, string> = {
  valid: 'input-success',
  invalid: 'input-error',
  pending: '',
};

// Strip @layer wrapper for Shadow DOM compatibility
const coreStyles = inputCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: block;
  }

  :host([hidden]) {
    display: none !important;
  }

  /* Import core input styles */
  ${coreStyles}

  /* Form field container */
  .container {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  /* Label */
  .label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-on-surface);
  }

  .label.required::after {
    content: ' *';
    color: var(--color-error);
  }

  /* Input wrapper for prefix/suffix */
  .input-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid var(--color-outline);
    border-radius: 0.5rem;
    background-color: var(--color-surface);
    transition:
      border-color 150ms ease-in-out,
      box-shadow 150ms ease-in-out;
  }

  .input-wrapper:hover:not(.disabled) {
    border-color: var(--color-outline-variant);
  }

  .input-wrapper.focused {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px color-mix(in oklch, var(--color-primary) 10%, transparent);
  }

  .input-wrapper.disabled {
    background-color: var(--color-surface-container);
    cursor: not-allowed;
    opacity: 0.5;
  }

  /* Validation states for wrapper */
  .input-wrapper.valid {
    border-color: var(--color-success);
  }

  .input-wrapper.valid.focused {
    box-shadow: 0 0 0 3px color-mix(in oklch, var(--color-success) 10%, transparent);
  }

  .input-wrapper.invalid {
    border-color: var(--color-error);
  }

  .input-wrapper.invalid.focused {
    box-shadow: 0 0 0 3px color-mix(in oklch, var(--color-error) 10%, transparent);
  }

  /* Size variants for wrapper */
  :host(:not([size])) .input-wrapper,
  :host([size='md']) .input-wrapper {
    min-height: 2.5rem;
    padding: 0 0.75rem;
  }

  :host([size='sm']) .input-wrapper {
    min-height: 2rem;
    padding: 0 0.5rem;
  }

  :host([size='lg']) .input-wrapper {
    min-height: 3rem;
    padding: 0 1rem;
  }

  /* Native input - use base .input class but remove redundant styles */
  .input-wrapper .input {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    padding: 0;
    height: auto;
  }

  .input-wrapper .input:focus,
  .input-wrapper .input:focus-visible {
    box-shadow: none;
    border-color: transparent;
  }

  /* Prefix and suffix */
  .prefix,
  .suffix {
    display: none;
    flex-shrink: 0;
    color: var(--color-on-surface-variant);
  }

  .prefix.has-content,
  .suffix.has-content {
    display: flex;
    align-items: center;
  }

  /* Helper and error text */
  .helper,
  .error {
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }

  .helper {
    color: var(--color-on-surface-variant);
  }

  .error {
    color: var(--color-error);
  }

  /* Pending state spinner */
  .pending-indicator {
    display: none;
    width: 1em;
    height: 1em;
    border: 2px solid var(--color-outline);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  :host([validation-state='pending']) .pending-indicator {
    display: block;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export class ElDmInput extends BaseElement {
  static properties = {
    type: { type: String, reflect: true, default: 'text' },
    value: { type: String, reflect: true, default: '' },
    name: { type: String, reflect: true },
    label: { type: String, reflect: true },
    placeholder: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    readonly: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
    validationState: { type: String, reflect: true, attribute: 'validation-state' },
    errorMessage: { type: String, reflect: true, attribute: 'error-message' },
    helperText: { type: String, reflect: true, attribute: 'helper-text' },
  };

  /** Input type */
  declare type: InputType;

  /** Current value */
  declare value: string;

  /** Form field name */
  declare name: string;

  /** Label text */
  declare label: string;

  /** Placeholder text */
  declare placeholder: string;

  /** Whether the input is disabled */
  declare disabled: boolean;

  /** Whether the input is readonly */
  declare readonly: boolean;

  /** Whether the input is required */
  declare required: boolean;

  /** Input size */
  declare size: Size;

  /** Validation state */
  declare validationState: ValidationState;

  /** Error message */
  declare errorMessage: string;

  /** Helper text */
  declare helperText: string;

  /** Whether the input is focused */
  private _focused = false;

  private readonly _inputId = `input-${Math.random().toString(36).slice(2, 9)}`;

  /** Registered validators */
  private _validators: Validator[] = [];

  /**
   * Set the list of validators for this input.
   * Validators are run in order; the first failure wins.
   *
   * @example
   * ```ts
   * import { validators } from '@duskmoon-dev/el-base';
   * input.setValidators([
   *   validators.required('Email is required'),
   *   validators.email('Must be a valid email'),
   * ]);
   * ```
   */
  setValidators(rules: Validator[]): void {
    this._validators = rules;
  }

  /**
   * Run all registered validators against the current value.
   * Updates `validationState` and `errorMessage` automatically.
   *
   * @returns The validation result
   */
  validate(): ValidationResult {
    const result = validate(this.value ?? '', this._validators);
    this.validationState = result.state as ValidationState;
    this.errorMessage = result.message ?? '';
    return result;
  }

  constructor() {
    super();
    this.attachStyles(styles);
    this.shadowRoot.addEventListener('slotchange', this._handleSlotChange.bind(this));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._focused = false;
  }

  /**
   * Handle slot content changes
   */
  private _handleSlotChange(event: Event): void {
    const slot = event.target as HTMLSlotElement;
    const wrapper = slot.parentElement;
    if (wrapper) {
      const hasContent = slot.assignedNodes().length > 0;
      wrapper.classList.toggle('has-content', hasContent);
    }
  }

  /**
   * Handle input events
   */
  private _handleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;

    this.emit('dm-input', { value: this.value });
  }

  /**
   * Handle change events
   */
  private _handleChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;

    this.emit('dm-change', { value: this.value });
  }

  /**
   * Handle focus events
   */
  private _handleFocus(): void {
    this._focused = true;
    this.update();
    this.emit('dm-focus');
  }

  /**
   * Handle blur events
   */
  private _handleBlur(): void {
    this._focused = false;
    if (this._validators.length > 0) {
      this.validate();
    }
    this.update();
    this.emit('dm-blur');
  }

  /**
   * Focus the input element
   */
  focus(): void {
    const input = this.shadowRoot.querySelector('input');
    input?.focus();
  }

  /**
   * Blur the input element
   */
  blur(): void {
    const input = this.shadowRoot.querySelector('input');
    input?.blur();
  }

  /**
   * Select all text in the input
   */
  select(): void {
    const input = this.shadowRoot.querySelector('input');
    input?.select();
  }

  /**
   * Build CSS class string for the input
   */
  private _getInputClasses(): string {
    const classes = ['input', 'input-bordered'];

    // Add size class
    if (this.size && SIZE_CLASSES[this.size]) {
      classes.push(SIZE_CLASSES[this.size]);
    }

    // Add validation class
    if (this.validationState && VALIDATION_CLASSES[this.validationState]) {
      classes.push(VALIDATION_CLASSES[this.validationState]);
    }

    return classes.filter(Boolean).join(' ');
  }

  protected update(): void {
    let input = this.shadowRoot.querySelector('input');
    if (!input) {
      super.update();
      input = this.shadowRoot.querySelector('input')!;
      input.id = this._inputId;
      input.addEventListener('input', this._handleInput.bind(this));
      input.addEventListener('change', this._handleChange.bind(this));
      input.addEventListener('focus', this._handleFocus.bind(this));
      input.addEventListener('blur', this._handleBlur.bind(this));
    }

    // Keep the live control mounted: replacing it drops focus and native editing state.
    input.type = this.type || 'text';
    input.name = this.name || '';
    input.placeholder = this.placeholder || '';
    input.disabled = this.disabled;
    input.readOnly = this.readonly;
    input.required = this.required;
    input.className = this._getInputClasses();
    const value = this.value || '';
    if (input.value !== value) {
      const { selectionStart, selectionEnd, selectionDirection } = input;
      input.value = value;
      if (selectionStart !== null && selectionEnd !== null) {
        input.setSelectionRange(selectionStart, selectionEnd, selectionDirection || undefined);
      }
    }
    input.setAttribute('value', value);
    input.setAttribute('aria-invalid', String(this.validationState === 'invalid'));
    const showError = this.validationState === 'invalid' && !!this.errorMessage;
    const showHelper = !!this.helperText && this.validationState !== 'invalid';
    input.setAttribute('aria-describedby', showError ? 'error' : showHelper ? 'helper' : '');

    const wrapper = this.shadowRoot.querySelector('.input-wrapper')!;
    wrapper.className = [
      'input-wrapper',
      this._focused ? 'focused' : '',
      this.disabled ? 'disabled' : '',
      this.validationState || '',
    ]
      .filter(Boolean)
      .join(' ');

    const container = this.shadowRoot.querySelector('.container')!;
    let label = container.querySelector('label');
    if (this.label) {
      if (!label) {
        label = document.createElement('label');
        label.setAttribute('part', 'label');
        label.htmlFor = this._inputId;
        container.prepend(label);
      }
      label.className = this.required ? 'label required' : 'label';
      label.textContent = this.label;
    } else {
      label?.remove();
    }
    for (const [id, text] of [
      ['error', showError ? this.errorMessage : ''],
      ['helper', showHelper ? this.helperText : ''],
    ]) {
      let message = container.querySelector<HTMLElement>(`#${id}`);
      if (text) {
        if (!message) {
          message = document.createElement('span');
          message.id = id;
          message.className = id;
          message.setAttribute('part', id);
          if (id === 'error') message.setAttribute('role', 'alert');
          container.append(message);
        }
        if (message.textContent !== text) message.textContent = text;
      } else {
        message?.remove();
      }
    }
  }

  render(): string {
    return `
      <div class="container" part="container">
        <div class="input-wrapper" part="input-wrapper">
          <span class="prefix" part="prefix">
            <slot name="prefix"></slot>
          </span>
          <input part="input" />
          <span class="pending-indicator"></span>
          <span class="suffix" part="suffix">
            <slot name="suffix"></slot>
          </span>
        </div>
      </div>
    `;
  }
}
