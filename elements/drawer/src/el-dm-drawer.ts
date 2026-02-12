/**
 * DuskMoon Drawer Element
 *
 * A side navigation drawer/sidebar component for displaying navigation or content panels.
 * Supports left/right positioning, modal mode with backdrop, and smooth slide animations.
 *
 * @element el-dm-drawer
 *
 * @attr {boolean} open - Whether the drawer is open
 * @attr {string} position - Drawer position: 'left' or 'right'
 * @attr {boolean} modal - Whether drawer shows backdrop and traps focus
 * @attr {string} width - Custom width for the drawer (CSS value)
 *
 * @slot - Default slot for drawer content
 * @slot header - Drawer header section
 * @slot footer - Drawer footer section
 *
 * @csspart drawer - The drawer container
 * @csspart backdrop - The backdrop overlay (modal mode)
 * @csspart content - The content wrapper
 * @csspart header - The header section
 * @csspart body - The body section
 * @csspart footer - The footer section
 *
 * @fires open - Fired when drawer opens
 * @fires close - Fired when drawer closes
 */

import { BaseElement, css, animationStyles } from '@duskmoon-dev/el-base';

export type DrawerPosition = 'left' | 'right';

const styles = css`
  :host {
    display: contents;
  }

  :host([hidden]) {
    display: none !important;
  }

  .drawer-wrapper {
    position: fixed;
    inset: 0;
    z-index: 1000;
    pointer-events: none;
  }

  .drawer-wrapper.open {
    pointer-events: auto;
  }

  .drawer-backdrop {
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 300ms ease,
      visibility 300ms ease;
  }

  .drawer-wrapper.open .drawer-backdrop {
    opacity: 1;
    visibility: visible;
  }

  .drawer {
    position: absolute;
    top: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    width: var(--drawer-width, 280px);
    max-width: 100vw;
    background-color: var(--color-surface);
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
    transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
    font-family: inherit;
    pointer-events: auto;
  }

  .drawer-left {
    left: 0;
    border-right: 1px solid var(--color-outline);
    transform: translateX(-100%);
  }

  .drawer-right {
    right: 0;
    border-left: 1px solid var(--color-outline);
    transform: translateX(100%);
  }

  .drawer-wrapper.open .drawer-left,
  .drawer-wrapper.open .drawer-right {
    transform: translateX(0);
  }

  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--color-outline);
    flex-shrink: 0;
  }

  .drawer-body {
    flex: 1;
    padding: 1rem 1.5rem;
    overflow-y: auto;
  }

  .drawer-footer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--color-outline);
    flex-shrink: 0;
  }

  .drawer-close {
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

  .drawer-close:hover {
    opacity: 1;
    background-color: var(--color-surface-variant);
  }

  .drawer-close:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  /* Non-modal drawer positioning */
  :host(:not([modal])) .drawer-wrapper {
    pointer-events: none;
  }

  :host(:not([modal])) .drawer {
    pointer-events: auto;
  }
`;

export class ElDmDrawer extends BaseElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    position: { type: String, reflect: true, default: 'left' },
    modal: { type: Boolean, reflect: true },
    width: { type: String, reflect: true },
  };

  declare open: boolean;
  declare position: DrawerPosition;
  declare modal: boolean;
  declare width: string;

  private _focusableElements: HTMLElement[] = [];
  private _previouslyFocused: HTMLElement | null = null;

  constructor() {
    super();
    this.attachStyles([styles, animationStyles]);
  }

  private _handleBackdropClick(event: Event): void {
    if (this.modal && event.target === event.currentTarget) {
      this.hide();
    }
  }

  private _handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.modal) {
      this.hide();
      return;
    }

    // Focus trap for modal mode
    if (event.key === 'Tab' && this.modal && this.open) {
      this._handleTabKey(event);
    }
  };

  private _handleTabKey(event: KeyboardEvent): void {
    const focusable = this._getFocusableElements();
    if (focusable.length === 0) return;

    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  private _getFocusableElements(): HTMLElement[] {
    const drawer = this.shadowRoot?.querySelector('.drawer');
    if (!drawer) return [];

    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    // Get focusable elements from shadow DOM
    const shadowFocusable = Array.from(
      drawer.querySelectorAll(focusableSelectors),
    ) as HTMLElement[];

    // Get focusable elements from slotted content
    const slots = drawer.querySelectorAll('slot');
    const slottedFocusable: HTMLElement[] = [];

    slots.forEach((slot) => {
      const assignedElements = slot.assignedElements({ flatten: true });
      assignedElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          if (el.matches(focusableSelectors)) {
            slottedFocusable.push(el);
          }
          slottedFocusable.push(
            ...(Array.from(el.querySelectorAll(focusableSelectors)) as HTMLElement[]),
          );
        }
      });
    });

    return [...shadowFocusable, ...slottedFocusable];
  }

  private _trapFocus(): void {
    this._previouslyFocused = document.activeElement as HTMLElement;
    this._focusableElements = this._getFocusableElements();

    // Focus first focusable element or the drawer itself
    requestAnimationFrame(() => {
      if (this._focusableElements.length > 0) {
        this._focusableElements[0].focus();
      } else {
        const drawer = this.shadowRoot?.querySelector('.drawer') as HTMLElement;
        drawer?.focus();
      }
    });
  }

  private _releaseFocus(): void {
    if (this._previouslyFocused && this._previouslyFocused.focus) {
      this._previouslyFocused.focus();
    }
    this._previouslyFocused = null;
  }

  show(): void {
    this.open = true;
    document.addEventListener('keydown', this._handleKeyDown);

    if (this.modal) {
      document.body.style.overflow = 'hidden';
      this._trapFocus();
    }

    this.emit('open');
  }

  hide(): void {
    this.open = false;
    document.removeEventListener('keydown', this._handleKeyDown);

    if (this.modal) {
      document.body.style.overflow = '';
      this._releaseFocus();
    }

    this.emit('close');
  }

  toggle(): void {
    if (this.open) {
      this.hide();
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
    const positionClass = this.position === 'right' ? 'drawer-right' : 'drawer-left';
    const widthStyle = this.width ? `--drawer-width: ${this.width}` : '';

    return `
      <div class="drawer-wrapper ${this.open ? 'open' : ''}" part="wrapper">
        ${this.modal ? '<div class="drawer-backdrop" part="backdrop"></div>' : ''}
        <div
          class="drawer ${positionClass}"
          role="dialog"
          aria-modal="${this.modal ? 'true' : 'false'}"
          style="${widthStyle}"
          tabindex="-1"
          part="drawer"
        >
          <div class="drawer-header" part="header">
            <slot name="header"></slot>
            <button class="drawer-close" part="close" aria-label="Close drawer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="drawer-body" part="body">
            <slot></slot>
          </div>
          <div class="drawer-footer" part="footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    `;
  }

  update(): void {
    super.update();

    const backdrop = this.shadowRoot?.querySelector('.drawer-backdrop');
    backdrop?.addEventListener('click', this._handleBackdropClick.bind(this));

    const closeBtn = this.shadowRoot?.querySelector('.drawer-close');
    closeBtn?.addEventListener('click', () => this.hide());
  }
}
