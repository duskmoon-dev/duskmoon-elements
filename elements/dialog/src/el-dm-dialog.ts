/**
 * DuskMoon Dialog Element
 *
 * A modal dialog component for displaying content that requires user attention.
 * Uses styles from @duskmoon-dev/core for consistent theming.
 *
 * @element el-dm-dialog
 *
 * @attr {boolean} open - Whether the dialog is open
 * @attr {string} size - Dialog size: sm, md, lg, xl, full
 * @attr {boolean} dismissible - Whether clicking backdrop closes dialog
 * @attr {boolean} no-backdrop - Hide the backdrop
 *
 * @slot - Default slot for dialog content
 * @slot header - Dialog header/title
 * @slot footer - Dialog footer/actions
 *
 * @csspart dialog - The dialog container
 * @csspart backdrop - The backdrop overlay
 * @csspart content - The content wrapper
 * @csspart header - The header section
 * @csspart body - The body section
 * @csspart footer - The footer section
 * @csspart close - The close button
 *
 * @fires open - Fired when dialog opens
 * @fires close - Fired when dialog closes
 */

import { BaseElement, css, animationStyles } from '@duskmoon-dev/el-base';
import { css as dialogCSS } from '@duskmoon-dev/core/components/dialog';

const SIZE_CLASSES: Record<string, string> = {
  sm: 'dialog-sm',
  md: '',
  lg: 'dialog-lg',
  xl: 'dialog-xl',
  full: 'dialog-fullscreen',
};

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const coreStyles = dialogCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: contents;
  }

  :host([hidden]) {
    display: none !important;
  }

  ${coreStyles}

  .dialog-wrapper {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 200ms ease,
      visibility 200ms ease;
  }

  .dialog-wrapper.open {
    opacity: 1;
    visibility: visible;
  }

  .dialog-backdrop {
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .dialog {
    position: relative;
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    max-width: 90vw;
    min-width: 320px;
    background-color: var(--color-surface);
    border-radius: 1rem;
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
    transform: scale(0.95);
    transition: transform 200ms ease;
    font-family: inherit;
  }

  .dialog-wrapper.open .dialog {
    transform: scale(1);
  }

  .dialog-sm {
    max-width: 400px;
  }
  .dialog-lg {
    max-width: 800px;
  }
  .dialog-xl {
    max-width: 1140px;
  }
  .dialog-fullscreen {
    max-width: 100vw;
    max-height: 100vh;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }

  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--color-outline);
  }

  .dialog-body {
    flex: 1;
    padding: 1.5rem;
    overflow-y: auto;
  }

  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--color-outline);
  }

  .dialog-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: none;
    background: transparent;
    border-radius: 0.5rem;
    cursor: pointer;
    color: var(--color-on-surface);
    opacity: 0.7;
    transition:
      opacity 150ms ease,
      background-color 150ms ease;
  }

  .dialog-close:hover {
    opacity: 1;
    background-color: var(--color-surface-variant);
  }
`;

export class ElDmDialog extends BaseElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
    dismissible: { type: Boolean, reflect: true, default: true },
    noBackdrop: { type: Boolean, reflect: true, attribute: 'no-backdrop' },
  };

  declare open: boolean;
  declare size: DialogSize;
  declare dismissible: boolean;
  declare noBackdrop: boolean;

  constructor() {
    super();
    this.attachStyles([styles, animationStyles]);
  }

  private _handleBackdropClick(event: Event): void {
    if (this.dismissible && event.target === event.currentTarget) {
      this.close();
    }
  }

  private _handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.dismissible) {
      this.close();
    }
  };

  private _getDialogClasses(): string {
    const classes = ['dialog'];
    if (this.size && SIZE_CLASSES[this.size]) {
      classes.push(SIZE_CLASSES[this.size]);
    }
    return classes.join(' ');
  }

  show(): void {
    this.open = true;
    document.addEventListener('keydown', this._handleKeyDown);
    document.body.style.overflow = 'hidden';
    this.emit('open');
  }

  close(): void {
    this.open = false;
    document.removeEventListener('keydown', this._handleKeyDown);
    document.body.style.overflow = '';
    this.emit('close');
  }

  toggle(): void {
    if (this.open) {
      this.close();
    } else {
      this.show();
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback?.();
    document.removeEventListener('keydown', this._handleKeyDown);
    document.body.style.overflow = '';
  }

  render(): string {
    const dialogClasses = this._getDialogClasses();

    return `
      <div class="dialog-wrapper ${this.open ? 'open' : ''}" part="wrapper">
        ${!this.noBackdrop ? '<div class="dialog-backdrop" part="backdrop"></div>' : ''}
        <div class="${dialogClasses}" role="dialog" aria-modal="true" part="dialog">
          <div class="dialog-header" part="header">
            <slot name="header"></slot>
            ${this.dismissible ? '<button class="dialog-close" part="close" aria-label="Close">✕</button>' : ''}
          </div>
          <div class="dialog-body" part="body">
            <slot></slot>
          </div>
          <div class="dialog-footer" part="footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    `;
  }

  update(): void {
    super.update();
    const backdrop = this.shadowRoot?.querySelector('.dialog-backdrop');
    backdrop?.addEventListener('click', this._handleBackdropClick.bind(this));

    const closeBtn = this.shadowRoot?.querySelector('.dialog-close');
    closeBtn?.addEventListener('click', () => this.close());
  }
}
