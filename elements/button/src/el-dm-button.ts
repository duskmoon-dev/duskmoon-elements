/**
 * DuskMoon Button Element
 *
 * A customizable button component with multiple variants and sizes.
 * Uses styles from @duskmoon-dev/core for consistent theming.
 *
 * @element el-dm-button
 *
 * @attr {string} variant - Button variant: primary, secondary, tertiary, ghost, outline, success, warning, error, info
 * @attr {string} size - Button size: xs, sm, md, lg
 * @attr {boolean} disabled - Whether the button is disabled
 * @attr {string} type - Button type: button, submit, reset
 * @attr {boolean} loading - Whether the button is in loading state
 * @attr {string} aria-label - Accessible name for the native button
 * @attr {string} aria-labelledby - IDs of elements naming the button in the host's DOM tree
 *
 * @slot - Default slot for button content
 * @slot prefix - Content before the main text
 * @slot suffix - Content after the main text
 *
 * @csspart button - The native button element
 * @csspart content - The content wrapper
 * @csspart prefix - The prefix slot wrapper
 * @csspart suffix - The suffix slot wrapper
 *
 * @fires click - Fired when button is clicked (native event)
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as buttonCSS } from '@duskmoon-dev/core/components/button';

// Map of variant attribute values to CSS classes
const VARIANT_CLASSES: Record<string, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  tertiary: 'btn-tertiary',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
  // Semantic colors
  success: 'btn-success',
  warning: 'btn-warning',
  error: 'btn-error',
  info: 'btn-info',
};

// Map of size attribute values to CSS classes
const SIZE_CLASSES: Record<string, string> = {
  xs: 'btn-xs',
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
};

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'ghost'
  | 'outline'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

// Strip @layer wrapper for Shadow DOM compatibility and add host styles
const coreStyles = buttonCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: inline-flex;
    vertical-align: middle;
  }

  :host([hidden]) {
    display: none !important;
  }

  /* Import core button styles */
  ${coreStyles}

  /* Web component specific adjustments */
  .btn {
    font-family: inherit;
  }

  .content {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  ::slotted(*) {
    display: inline-flex;
    align-items: center;
  }
`;

export class ElDmButton extends BaseElement {
  static get observedAttributes(): string[] {
    return [...super.observedAttributes, 'aria-label', 'aria-labelledby'];
  }

  static properties = {
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    type: { type: String, reflect: true, default: 'button' },
    loading: { type: Boolean, reflect: true },
  };

  /** Button variant */
  declare variant: ButtonVariant;

  /** Button size */
  declare size: ButtonSize;

  /** Whether the button is disabled */
  declare disabled: boolean;

  /** Button type (button, submit, reset) */
  declare type: 'button' | 'submit' | 'reset';

  /** Whether the button is in loading state */
  declare loading: boolean;

  private _labelObserver?: MutationObserver;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  /**
   * Handle click events
   */
  private _handleClick(event: MouseEvent): void {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Handle form submission
    if (this.type === 'submit') {
      const form = this._getAssociatedForm();
      if (form) {
        const submitter = this.ownerDocument.createElement('button');
        submitter.type = 'submit';
        submitter.hidden = true;

        for (const attribute of [
          'name',
          'value',
          'formaction',
          'formenctype',
          'formmethod',
          'formnovalidate',
          'formtarget',
        ]) {
          if (this.hasAttribute(attribute)) {
            submitter.setAttribute(attribute, this.getAttribute(attribute) ?? '');
          }
        }

        form.appendChild(submitter);
        try {
          form.requestSubmit(submitter);
        } finally {
          submitter.remove();
        }
      }
    } else if (this.type === 'reset') {
      const form = this._getAssociatedForm();
      if (form) {
        form.reset();
      }
    }
  }

  private _getAssociatedForm(): HTMLFormElement | null {
    const formId = this.getAttribute('form');
    if (formId) {
      const form = this.ownerDocument.getElementById(formId);
      return form?.tagName === 'FORM' ? (form as HTMLFormElement) : null;
    }

    return this.closest('form');
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this._handleClick.bind(this));
    this._observeLabels();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._labelObserver?.disconnect();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (oldValue === newValue || !this.isConnected) return;
    if (name === 'aria-label' || name === 'aria-labelledby') {
      this._syncLabel();
      if (name === 'aria-labelledby') this._observeLabels();
    }
  }

  protected update(): void {
    super.update();
    this._syncLabel();
  }

  private _observeLabels(): void {
    this._labelObserver?.disconnect();
    if (!this.getAttribute('aria-labelledby')?.trim()) return;
    this._labelObserver ??= new MutationObserver(() => this._syncLabel());
    this._labelObserver.observe(this.getRootNode(), {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['id', 'aria-label'],
    });
  }

  private _syncLabel(): void {
    const button = this.shadowRoot.querySelector('button');
    if (!button) return;

    const root = this.getRootNode() as Document | ShadowRoot;
    const ids = this.getAttribute('aria-labelledby')?.trim().split(/\s+/) ?? [];
    const labels = ids
      .map((id) => root.getElementById?.(id))
      .filter((label): label is HTMLElement => !!label);
    let name = this.getAttribute('aria-label');

    // ID references cannot cross into a shadow root; element references can.
    if ('ariaLabelledByElements' in button) {
      button.ariaLabelledByElements = labels;
    } else if (labels.length) {
      name = labels.map((label) => label.getAttribute('aria-label') ?? label.textContent).join(' ');
    }

    if (name === null) {
      button.removeAttribute('aria-label');
    } else {
      button.setAttribute('aria-label', name);
    }
  }

  /**
   * Build CSS class string for the button
   */
  private _getButtonClasses(): string {
    const classes = ['btn'];

    // Add variant class (default to primary)
    const variantClass = VARIANT_CLASSES[this.variant] || 'btn-primary';
    classes.push(variantClass);

    // Add size class if specified
    if (this.size && SIZE_CLASSES[this.size]) {
      classes.push(SIZE_CLASSES[this.size]);
    }

    // Add loading class
    if (this.loading) {
      classes.push('btn-loading');
    }

    return classes.join(' ');
  }

  render(): string {
    const isDisabled = this.disabled || this.loading;
    const buttonClasses = this._getButtonClasses();

    return `
      <button
        class="${buttonClasses}"
        part="button"
        type="${this.type || 'button'}"
        ${isDisabled ? 'disabled' : ''}
        aria-busy="${this.loading ? 'true' : 'false'}"
      >
        <span class="content" part="content">
          <slot name="prefix" part="prefix"></slot>
          <slot></slot>
          <slot name="suffix" part="suffix"></slot>
        </span>
      </button>
    `;
  }
}
