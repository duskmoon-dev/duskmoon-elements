/**
 * DuskMoon Navbar Element
 *
 * A primary navigation bar/header component with responsive design.
 * Uses custom styles with theme variables for consistent theming.
 *
 * @element el-dm-navbar
 *
 * @attr {boolean} fixed - Whether the navbar is fixed to the top
 * @attr {boolean} elevated - Whether the navbar has a shadow elevation
 * @attr {string} color - Navbar color: surface, primary, secondary, tertiary
 *
 * @slot start - Logo or brand content (left side)
 * @slot - Default slot for navigation items (center)
 * @slot end - Actions or icons (right side)
 *
 * @csspart navbar - The navbar container
 * @csspart content - The content wrapper
 * @csspart start - The start slot wrapper
 * @csspart center - The center/default slot wrapper
 * @csspart end - The end slot wrapper
 * @csspart hamburger - The mobile hamburger button
 * @csspart mobile-menu - The mobile menu container
 *
 * @fires menu-toggle - Fired when the mobile menu is toggled
 */

import { BaseElement, css } from '@duskmoon-dev/el-core';

export type NavbarColor = 'surface' | 'primary' | 'secondary' | 'tertiary';

const styles = css`
  :host {
    display: block;
    width: 100%;
  }

  :host([hidden]) {
    display: none !important;
  }

  :host([fixed]) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
  }

  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 4rem;
    padding: 0 1.5rem;
    background-color: var(--color-surface);
    color: var(--color-on-surface);
    font-family: inherit;
    transition:
      background-color 200ms ease,
      box-shadow 200ms ease;
  }

  /* Color variants */
  .navbar-primary {
    background-color: var(--color-primary);
    color: var(--color-on-primary);
  }

  .navbar-secondary {
    background-color: var(--color-secondary);
    color: var(--color-on-secondary);
  }

  .navbar-tertiary {
    background-color: var(--color-tertiary);
    color: var(--color-on-tertiary);
  }

  /* Elevated state */
  .navbar-elevated {
    box-shadow:
      0 4px 6px -1px rgb(0 0 0 / 0.1),
      0 2px 4px -2px rgb(0 0 0 / 0.1);
  }

  .navbar-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    gap: 1rem;
  }

  .navbar-start {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .navbar-center {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    justify-content: center;
  }

  .navbar-end {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  /* Hamburger button */
  .navbar-hamburger {
    display: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 2.5rem;
    height: 2.5rem;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 0.5rem;
    transition: background-color 150ms ease;
  }

  .navbar-hamburger:hover {
    background-color: var(--color-surface-variant, rgba(0, 0, 0, 0.1));
  }

  .navbar-hamburger:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .hamburger-line {
    display: block;
    width: 1.25rem;
    height: 2px;
    background-color: currentColor;
    border-radius: 1px;
    transition:
      transform 200ms ease,
      opacity 200ms ease;
  }

  .hamburger-line + .hamburger-line {
    margin-top: 4px;
  }

  /* Hamburger animation when open */
  .navbar-hamburger.open .hamburger-line:nth-child(1) {
    transform: translateY(6px) rotate(45deg);
  }

  .navbar-hamburger.open .hamburger-line:nth-child(2) {
    opacity: 0;
  }

  .navbar-hamburger.open .hamburger-line:nth-child(3) {
    transform: translateY(-6px) rotate(-45deg);
  }

  /* Mobile menu */
  .navbar-mobile-menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: inherit;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    padding: 1rem;
    flex-direction: column;
    gap: 0.5rem;
    opacity: 0;
    transform: translateY(-0.5rem);
    transition:
      opacity 200ms ease,
      transform 200ms ease;
    pointer-events: none;
  }

  .navbar-mobile-menu.open {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  /* Slotted content styling */
  ::slotted(*) {
    display: flex;
    align-items: center;
  }

  ::slotted(a) {
    text-decoration: none;
    color: inherit;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    transition: background-color 150ms ease;
  }

  ::slotted(a:hover) {
    background-color: var(--color-surface-variant, rgba(0, 0, 0, 0.1));
  }

  /* Responsive styles */
  @media (max-width: 768px) {
    .navbar-hamburger {
      display: flex;
    }

    .navbar-center {
      display: none;
    }

    .navbar-mobile-menu {
      display: flex;
    }
  }
`;

export class ElDmNavbar extends BaseElement {
  static properties = {
    fixed: { type: Boolean, reflect: true },
    elevated: { type: Boolean, reflect: true },
    color: { type: String, reflect: true },
  };

  /** Whether the navbar is fixed to the top */
  declare fixed: boolean;

  /** Whether the navbar has shadow elevation */
  declare elevated: boolean;

  /** Navbar color variant */
  declare color: NavbarColor;

  /** Internal state for mobile menu */
  private _mobileMenuOpen = false;

  /** Bound scroll handler for cleanup */
  private _scrollHandler: (() => void) | null = null;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  connectedCallback(): void {
    super.connectedCallback();

    // Add scroll listener for auto-elevation when fixed
    if (this.fixed) {
      this._scrollHandler = this._handleScroll.bind(this);
      window.addEventListener('scroll', this._scrollHandler, { passive: true });
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback?.();

    if (this._scrollHandler) {
      window.removeEventListener('scroll', this._scrollHandler);
      this._scrollHandler = null;
    }
  }

  /**
   * Handle scroll to auto-elevate fixed navbar
   */
  private _handleScroll(): void {
    if (!this.fixed) return;

    const shouldElevate = window.scrollY > 0;
    if (shouldElevate !== this.elevated) {
      this.elevated = shouldElevate;
    }
  }

  /**
   * Toggle mobile menu
   */
  private _toggleMobileMenu(): void {
    this._mobileMenuOpen = !this._mobileMenuOpen;
    this.emit('menu-toggle', { open: this._mobileMenuOpen });
    this.update();
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu(): void {
    if (this._mobileMenuOpen) {
      this._mobileMenuOpen = false;
      this.emit('menu-toggle', { open: false });
      this.update();
    }
  }

  /**
   * Open mobile menu
   */
  openMobileMenu(): void {
    if (!this._mobileMenuOpen) {
      this._mobileMenuOpen = true;
      this.emit('menu-toggle', { open: true });
      this.update();
    }
  }

  /**
   * Build CSS class string for the navbar
   */
  private _getNavbarClasses(): string {
    const classes = ['navbar'];

    if (this.color && this.color !== 'surface') {
      classes.push(`navbar-${this.color}`);
    }

    if (this.elevated) {
      classes.push('navbar-elevated');
    }

    return classes.join(' ');
  }

  render(): string {
    const navbarClasses = this._getNavbarClasses();
    const hamburgerClasses = this._mobileMenuOpen ? 'navbar-hamburger open' : 'navbar-hamburger';
    const mobileMenuClasses = this._mobileMenuOpen
      ? 'navbar-mobile-menu open'
      : 'navbar-mobile-menu';

    return `
      <nav class="${navbarClasses}" part="navbar" role="navigation">
        <div class="navbar-content" part="content">
          <div class="navbar-start" part="start">
            <slot name="start"></slot>
          </div>
          <div class="navbar-center" part="center">
            <slot></slot>
          </div>
          <div class="navbar-end" part="end">
            <slot name="end"></slot>
            <button
              class="${hamburgerClasses}"
              part="hamburger"
              type="button"
              aria-label="${this._mobileMenuOpen ? 'Close menu' : 'Open menu'}"
              aria-expanded="${this._mobileMenuOpen ? 'true' : 'false'}"
              aria-controls="mobile-menu"
            >
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
            </button>
          </div>
        </div>
        <div
          id="mobile-menu"
          class="${mobileMenuClasses}"
          part="mobile-menu"
          aria-hidden="${this._mobileMenuOpen ? 'false' : 'true'}"
        >
          <slot name="mobile"></slot>
        </div>
      </nav>
    `;
  }

  update(): void {
    super.update();

    // Attach click handler to hamburger button
    const hamburger = this.shadowRoot?.querySelector('.navbar-hamburger');
    hamburger?.addEventListener('click', this._toggleMobileMenu.bind(this));
  }
}
