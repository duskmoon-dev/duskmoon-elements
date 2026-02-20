/**
 * DuskMoon Drawer Element
 *
 * A side navigation drawer/sidebar component for displaying navigation or content panels.
 * Supports left/right positioning, modal mode with backdrop, and smooth slide animations.
 * Uses styles from @duskmoon-dev/core for consistent theming.
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
import { css as drawerCSS } from '@duskmoon-dev/core/components/drawer';

export type DrawerPosition = 'left' | 'right';

// Strip @layer wrapper for Shadow DOM compatibility
const coreStyles = drawerCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: contents;
  }

  :host([hidden]) {
    display: none !important;
  }

  /* Import core drawer styles */
  ${coreStyles}

  /* Web component specific: wrapper for positioning context */
  .drawer-wrapper {
    position: fixed;
    inset: 0;
    z-index: 1000;
    pointer-events: none;
  }

  .drawer-wrapper.open {
    pointer-events: auto;
  }

  /* Override core's fixed positioning — our wrapper handles it */
  .drawer {
    position: absolute;
    width: var(--drawer-width, 280px);
    font-family: inherit;
    pointer-events: auto;
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
    const openClass = this.open ? 'drawer-open' : '';
    const widthStyle = this.width ? `--drawer-width: ${this.width}` : '';

    return `
      <div class="drawer-wrapper ${this.open ? 'open' : ''}" part="wrapper">
        ${this.modal ? `<div class="drawer-backdrop ${this.open ? 'drawer-backdrop-show' : ''}" part="backdrop"></div>` : ''}
        <div
          class="drawer ${positionClass} ${openClass}"
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
