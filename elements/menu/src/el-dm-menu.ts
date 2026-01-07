/**
 * DuskMoon Menu Element
 *
 * A dropdown menu component with menu items supporting keyboard navigation.
 *
 * @element el-dm-menu
 *
 * @attr {boolean} open - Whether the menu is open
 * @attr {string} anchor - Element ref or CSS selector for the anchor element
 * @attr {string} placement - Menu placement: top, bottom, left, right, top-start, top-end, bottom-start, bottom-end
 *
 * @slot - Default slot for menu items
 *
 * @csspart menu - The menu container
 * @csspart items - The menu items wrapper
 *
 * @fires open - Fired when the menu opens
 * @fires close - Fired when the menu closes
 * @fires select - Fired when a menu item is selected (detail: { value: string })
 */

import { BaseElement, css } from '@duskmoon-dev/el-core';

export type MenuPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end';

const menuStyles = css`
  :host {
    display: inline-block;
    position: relative;
  }

  :host([hidden]) {
    display: none !important;
  }

  .menu-container {
    position: absolute;
    z-index: 1000;
    min-width: 160px;
    max-width: 320px;
    background-color: var(--color-surface, #ffffff);
    border: 1px solid var(--color-outline-variant, #e0e0e0);
    border-radius: 0.5rem;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    padding: 0.25rem 0;
    opacity: 0;
    visibility: hidden;
    transform: scale(0.95);
    transform-origin: top left;
    transition:
      opacity 150ms ease,
      visibility 150ms ease,
      transform 150ms ease;
    font-family: inherit;
  }

  .menu-container.visible {
    opacity: 1;
    visibility: visible;
    transform: scale(1);
  }

  /* Placement styles */
  .placement-bottom,
  .placement-bottom-start,
  .placement-bottom-end {
    top: 100%;
    margin-top: 0.25rem;
    transform-origin: top;
  }

  .placement-bottom {
    left: 50%;
    transform: translateX(-50%) scale(0.95);
  }

  .placement-bottom.visible {
    transform: translateX(-50%) scale(1);
  }

  .placement-bottom-start {
    left: 0;
  }

  .placement-bottom-end {
    right: 0;
    left: auto;
  }

  .placement-top,
  .placement-top-start,
  .placement-top-end {
    bottom: 100%;
    margin-bottom: 0.25rem;
    transform-origin: bottom;
  }

  .placement-top {
    left: 50%;
    transform: translateX(-50%) scale(0.95);
  }

  .placement-top.visible {
    transform: translateX(-50%) scale(1);
  }

  .placement-top-start {
    left: 0;
  }

  .placement-top-end {
    right: 0;
    left: auto;
  }

  .placement-left {
    right: 100%;
    top: 0;
    margin-right: 0.25rem;
    transform-origin: right;
  }

  .placement-right {
    left: 100%;
    top: 0;
    margin-left: 0.25rem;
    transform-origin: left;
  }

  .items-wrapper {
    display: flex;
    flex-direction: column;
  }

  ::slotted(el-dm-menu-item) {
    display: block;
  }

  ::slotted([role='separator']) {
    height: 1px;
    background-color: var(--color-outline-variant, #e0e0e0);
    margin: 0.25rem 0;
  }
`;

export class ElDmMenu extends BaseElement {
  static properties = {
    open: { type: Boolean, reflect: true, default: false },
    anchor: { type: String, reflect: true },
    placement: { type: String, reflect: true, default: 'bottom-start' },
  };

  declare open: boolean;
  declare anchor: string;
  declare placement: MenuPlacement;

  private _anchorElement: HTMLElement | null = null;
  private _focusedIndex = -1;
  private _boundHandleDocumentClick: (e: MouseEvent) => void;
  private _boundHandleKeydown: (e: KeyboardEvent) => void;

  constructor() {
    super();
    this.attachStyles(menuStyles);
    this._boundHandleDocumentClick = this._handleDocumentClick.bind(this);
    this._boundHandleKeydown = this._handleKeydown.bind(this);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._setupAnchor();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback?.();
    this._removeGlobalListeners();
  }

  private _setupAnchor(): void {
    if (this.anchor) {
      this._anchorElement =
        document.querySelector(this.anchor) ||
        this.closest(this.anchor) ||
        document.getElementById(this.anchor);
    }
  }

  private _addGlobalListeners(): void {
    document.addEventListener('click', this._boundHandleDocumentClick);
    document.addEventListener('keydown', this._boundHandleKeydown);
  }

  private _removeGlobalListeners(): void {
    document.removeEventListener('click', this._boundHandleDocumentClick);
    document.removeEventListener('keydown', this._boundHandleKeydown);
  }

  private _handleDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;
    if (!this.contains(target) && !this._anchorElement?.contains(target)) {
      this.hide();
    }
  }

  private _handleKeydown(event: KeyboardEvent): void {
    if (!this.open) return;

    const items = this._getMenuItems();
    if (items.length === 0) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.hide();
        this._anchorElement?.focus();
        break;

      case 'ArrowDown':
        event.preventDefault();
        this._focusItem(this._getNextFocusableIndex(this._focusedIndex, 1, items));
        break;

      case 'ArrowUp':
        event.preventDefault();
        this._focusItem(this._getNextFocusableIndex(this._focusedIndex, -1, items));
        break;

      case 'Home':
        event.preventDefault();
        this._focusItem(this._getNextFocusableIndex(-1, 1, items));
        break;

      case 'End':
        event.preventDefault();
        this._focusItem(this._getNextFocusableIndex(items.length, -1, items));
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this._focusedIndex >= 0 && this._focusedIndex < items.length) {
          const item = items[this._focusedIndex] as ElDmMenuItem;
          if (!item.disabled) {
            this._selectItem(item);
          }
        }
        break;

      case 'Tab':
        this.hide();
        break;
    }
  }

  private _getMenuItems(): Element[] {
    const slot = this.shadowRoot?.querySelector('slot');
    if (!slot) return [];
    return slot
      .assignedElements()
      .filter((el) => el.tagName === 'EL-DM-MENU-ITEM' && !el.hasAttribute('hidden'));
  }

  private _getNextFocusableIndex(currentIndex: number, direction: number, items: Element[]): number {
    let nextIndex = currentIndex + direction;

    while (nextIndex >= 0 && nextIndex < items.length) {
      const item = items[nextIndex] as ElDmMenuItem;
      if (!item.disabled) {
        return nextIndex;
      }
      nextIndex += direction;
    }

    // Wrap around
    if (direction > 0) {
      return this._getNextFocusableIndex(-1, 1, items);
    } else {
      return this._getNextFocusableIndex(items.length, -1, items);
    }
  }

  private _focusItem(index: number): void {
    const items = this._getMenuItems();
    if (index < 0 || index >= items.length) return;

    // Remove focus from previous item
    if (this._focusedIndex >= 0 && this._focusedIndex < items.length) {
      (items[this._focusedIndex] as ElDmMenuItem).focused = false;
    }

    // Focus new item
    this._focusedIndex = index;
    const item = items[index] as ElDmMenuItem;
    item.focused = true;
    item.focus();
  }

  private _selectItem(item: ElDmMenuItem): void {
    this.emit('select', { value: item.value || item.textContent?.trim() });
    this.hide();
  }

  private _updatePosition(): void {
    const menuContainer = this.shadowRoot?.querySelector('.menu-container') as HTMLElement;
    if (!menuContainer) return;

    // Check if menu would go off screen and flip if necessary
    requestAnimationFrame(() => {
      const rect = menuContainer.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let finalPlacement = this.placement;

      // Flip vertical placement if needed
      if (finalPlacement.startsWith('bottom') && rect.bottom > viewportHeight) {
        finalPlacement = finalPlacement.replace('bottom', 'top') as MenuPlacement;
      } else if (finalPlacement.startsWith('top') && rect.top < 0) {
        finalPlacement = finalPlacement.replace('top', 'bottom') as MenuPlacement;
      }

      // Flip horizontal placement if needed
      if (finalPlacement === 'right' && rect.right > viewportWidth) {
        finalPlacement = 'left';
      } else if (finalPlacement === 'left' && rect.left < 0) {
        finalPlacement = 'right';
      }

      // Update class if flipped
      if (finalPlacement !== this.placement) {
        menuContainer.className = `menu-container placement-${finalPlacement}${this.open ? ' visible' : ''}`;
      }
    });
  }

  /**
   * Show the menu
   */
  show(): void {
    if (this.open) return;
    this.open = true;
    this._focusedIndex = -1;
    this._addGlobalListeners();
    this._updatePosition();
    this.emit('open');

    // Focus first item after menu opens
    requestAnimationFrame(() => {
      const items = this._getMenuItems();
      if (items.length > 0) {
        this._focusItem(this._getNextFocusableIndex(-1, 1, items));
      }
    });
  }

  /**
   * Hide the menu
   */
  hide(): void {
    if (!this.open) return;
    this.open = false;
    this._focusedIndex = -1;
    this._removeGlobalListeners();
    this.emit('close');

    // Clear focus from items
    const items = this._getMenuItems();
    items.forEach((item) => {
      (item as ElDmMenuItem).focused = false;
    });
  }

  /**
   * Toggle the menu open/closed
   */
  toggle(): void {
    if (this.open) {
      this.hide();
    } else {
      this.show();
    }
  }

  update(): void {
    super.update?.();
    const menuContainer = this.shadowRoot?.querySelector('.menu-container');
    if (menuContainer) {
      menuContainer.classList.toggle('visible', this.open);
      if (this.open) {
        this._updatePosition();
      }
    }
  }

  render(): string {
    const placementClass = `placement-${this.placement || 'bottom-start'}`;

    return `
      <slot name="trigger"></slot>
      <div
        class="menu-container ${placementClass}${this.open ? ' visible' : ''}"
        part="menu"
        role="menu"
        aria-hidden="${!this.open}"
      >
        <div class="items-wrapper" part="items">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

/**
 * DuskMoon Menu Item Element
 *
 * A menu item component for use within el-dm-menu.
 *
 * @element el-dm-menu-item
 *
 * @attr {string} value - The value associated with this item
 * @attr {boolean} disabled - Whether the item is disabled
 * @attr {boolean} focused - Whether the item is currently focused (internal)
 *
 * @slot - Default slot for item content
 * @slot icon - Slot for an icon before the content
 *
 * @csspart item - The menu item container
 * @csspart icon - The icon wrapper
 * @csspart content - The content wrapper
 */

const menuItemStyles = css`
  :host {
    display: block;
  }

  :host([hidden]) {
    display: none !important;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
    color: var(--color-on-surface, #1f1f1f);
    background-color: transparent;
    border: none;
    width: 100%;
    text-align: left;
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-family: inherit;
    transition:
      background-color 150ms ease,
      color 150ms ease;
    outline: none;
  }

  .menu-item:hover:not(.disabled) {
    background-color: var(--color-surface-container-highest, #f5f5f5);
  }

  .menu-item:focus:not(.disabled),
  .menu-item.focused:not(.disabled) {
    background-color: var(--color-surface-container-highest, #f5f5f5);
    outline: 2px solid var(--color-primary, #6750a4);
    outline-offset: -2px;
  }

  .menu-item.disabled {
    cursor: not-allowed;
    opacity: 0.5;
    color: var(--color-on-surface-variant, #49454f);
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
  }

  .icon-wrapper:empty {
    display: none;
  }

  .content-wrapper {
    flex: 1;
    min-width: 0;
  }

  ::slotted(svg),
  ::slotted(img) {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

export class ElDmMenuItem extends BaseElement {
  static properties = {
    value: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true, default: false },
    focused: { type: Boolean, reflect: true, default: false },
  };

  declare value: string;
  declare disabled: boolean;
  declare focused: boolean;

  constructor() {
    super();
    this.attachStyles(menuItemStyles);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'menuitem');
    this.setAttribute('tabindex', '-1');
    this.addEventListener('click', this._handleClick.bind(this));
  }

  private _handleClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Dispatch select event on parent menu
    const menu = this.closest('el-dm-menu') as ElDmMenu;
    if (menu) {
      menu.dispatchEvent(
        new CustomEvent('select', {
          bubbles: true,
          composed: true,
          detail: { value: this.value || this.textContent?.trim() },
        }),
      );
      menu.hide();
    }
  }

  update(): void {
    super.update?.();
    this.setAttribute('aria-disabled', String(this.disabled));

    const itemEl = this.shadowRoot?.querySelector('.menu-item');
    if (itemEl) {
      itemEl.classList.toggle('disabled', this.disabled);
      itemEl.classList.toggle('focused', this.focused);
    }
  }

  render(): string {
    return `
      <div
        class="menu-item${this.disabled ? ' disabled' : ''}${this.focused ? ' focused' : ''}"
        part="item"
      >
        <span class="icon-wrapper" part="icon">
          <slot name="icon"></slot>
        </span>
        <span class="content-wrapper" part="content">
          <slot></slot>
        </span>
      </div>
    `;
  }
}
