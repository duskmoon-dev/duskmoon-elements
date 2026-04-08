/**
 * DuskMoon Circle Menu Element
 *
 * A CSS-only radial circular navigation menu with hamburger/X toggle.
 * Items fan out in a circle when opened. Uses the checkbox toggle pattern
 * from @duskmoon-dev/core internally.
 *
 * @element el-dm-circle-menu
 *
 * @attr {boolean} open - Whether the menu is expanded
 * @attr {string} color - Color variant: primary, secondary, tertiary, info, success, warning, error
 * @attr {string} size - Size: sm, md, lg
 *
 * @slot - Default slot for menu items (a or button elements)
 *
 * @csspart container - The outer circle-menu container
 * @csspart toggle - The toggle label element
 * @csspart list - The menu items list
 *
 * @fires toggle - Fired when the menu opens or closes (detail: { open: boolean })
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as circleMenuCSS } from '@duskmoon-dev/core/components/circle-menu';

const COLOR_CLASSES: Record<string, string> = {
  primary: 'circle-menu-primary',
  secondary: 'circle-menu-secondary',
  tertiary: 'circle-menu-tertiary',
  info: 'circle-menu-info',
  success: 'circle-menu-success',
  warning: 'circle-menu-warning',
  error: 'circle-menu-error',
};

const SIZE_CLASSES: Record<string, string> = {
  sm: 'circle-menu-sm',
  md: '',
  lg: 'circle-menu-lg',
};

export type CircleMenuColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';
export type CircleMenuSize = 'sm' | 'md' | 'lg';

// Strip @layer wrapper for Shadow DOM compatibility
const coreStyles = circleMenuCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: inline-flex;
    vertical-align: middle;
  }

  :host([hidden]) {
    display: none !important;
  }

  ${coreStyles}

  .circle-menu {
    font-family: inherit;
  }

  /* Hidden slot — items are cloned into the list */
  .slot-holder {
    display: none;
  }
`;

export class ElDmCircleMenu extends BaseElement {
  static properties = {
    open: { type: Boolean, reflect: true, default: false },
    color: { type: String, reflect: true },
    size: { type: String, reflect: true },
  };

  declare open: boolean;
  declare color: CircleMenuColor;
  declare size: CircleMenuSize;

  #toggleId = `cm-${Math.random().toString(36).slice(2, 8)}`;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  private _getContainerClasses(): string {
    const classes = ['circle-menu'];

    if (this.color && COLOR_CLASSES[this.color]) {
      classes.push(COLOR_CLASSES[this.color]);
    }

    if (this.size && SIZE_CLASSES[this.size]) {
      classes.push(SIZE_CLASSES[this.size]);
    }

    return classes.join(' ');
  }

  render(): string {
    const classes = this._getContainerClasses();
    return `
      <nav class="${classes}" part="container">
        <input
          type="checkbox"
          class="circle-menu-toggler"
          id="${this.#toggleId}"
          ${this.open ? 'checked' : ''}
          aria-label="Toggle menu"
        />
        <label class="circle-menu-label" for="${this.#toggleId}" part="toggle"></label>
        <ul class="circle-menu-list" part="list" role="menu"></ul>
      </nav>
      <div class="slot-holder"><slot></slot></div>
    `;
  }

  update(): void {
    super.update();
    this.#syncCheckbox();
    this.#syncItems();
    this.#attachToggleListener();
  }

  connectedCallback(): void {
    super.connectedCallback();

    const slot = this.shadowRoot?.querySelector('slot');
    slot?.addEventListener('slotchange', () => this.#syncItems());
  }

  #syncCheckbox(): void {
    const checkbox = this.shadowRoot?.querySelector(
      '.circle-menu-toggler',
    ) as HTMLInputElement | null;
    if (checkbox && checkbox.checked !== this.open) {
      checkbox.checked = this.open;
    }
  }

  #syncItems(): void {
    const list = this.shadowRoot?.querySelector('.circle-menu-list');
    const slot = this.shadowRoot?.querySelector('slot');
    if (!list || !slot) return;

    const assigned = slot.assignedElements();
    list.innerHTML = '';

    assigned.forEach((el) => {
      const li = document.createElement('li');
      li.className = 'circle-menu-item';
      li.setAttribute('role', 'menuitem');
      const clone = el.cloneNode(true) as HTMLElement;
      li.appendChild(clone);
      list.appendChild(li);
    });
  }

  #attachToggleListener(): void {
    const checkbox = this.shadowRoot?.querySelector(
      '.circle-menu-toggler',
    ) as HTMLInputElement | null;
    if (!checkbox) return;

    checkbox.addEventListener('change', () => {
      this.open = checkbox.checked;
      this.emit('toggle', { open: this.open });
    });
  }

  /**
   * Show the menu
   */
  show(): void {
    if (!this.open) {
      this.open = true;
      this.emit('toggle', { open: true });
    }
  }

  /**
   * Hide the menu
   */
  hide(): void {
    if (this.open) {
      this.open = false;
      this.emit('toggle', { open: false });
    }
  }

  /**
   * Toggle the menu open/closed
   */
  toggle(): void {
    this.open = !this.open;
    this.emit('toggle', { open: this.open });
  }
}
