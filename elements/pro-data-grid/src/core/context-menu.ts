/**
 * Context menu engine — right-click context menu for the data grid.
 *
 * Supports default items (copy, paste, export), custom items,
 * separators, sub-menus, conditional disable, and keyboard shortcut labels.
 */

// ─── Public Types ────────────────────────────

export interface ContextMenuItem {
  name: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean | (() => boolean);
  action?: () => void;
  subMenu?: ContextMenuItem[];
  separator?: boolean;
}

export interface ContextMenuConfig {
  items?: ContextMenuItem[];
  suppressDefaultItems?: boolean;
}

export interface ContextMenuState {
  open: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
}

// ─── ContextMenu Class ───────────────────────

export class ContextMenu {
  #state: ContextMenuState = { open: false, x: 0, y: 0, items: [] };
  #customItems: ContextMenuItem[] = [];
  #suppressDefaultItems = false;

  get isOpen(): boolean {
    return this.#state.open;
  }

  get state(): ContextMenuState {
    return { ...this.#state, items: [...this.#state.items] };
  }

  configure(config: ContextMenuConfig): void {
    if (config.items !== undefined) this.#customItems = config.items;
    if (config.suppressDefaultItems !== undefined) {
      this.#suppressDefaultItems = config.suppressDefaultItems;
    }
  }

  /**
   * Get default menu items.
   */
  getDefaultItems(): ContextMenuItem[] {
    return [
      { name: 'copy', label: 'Copy', shortcut: 'Ctrl+C', action: undefined },
      { name: 'copyWithHeaders', label: 'Copy with Headers', action: undefined },
      { name: 'separator1', label: '', separator: true },
      { name: 'paste', label: 'Paste', shortcut: 'Ctrl+V', action: undefined },
      { name: 'separator2', label: '', separator: true },
      {
        name: 'export',
        label: 'Export',
        subMenu: [
          { name: 'exportCsv', label: 'CSV Export', action: undefined },
          { name: 'exportExcel', label: 'Excel Export', action: undefined },
          { name: 'exportJson', label: 'JSON Export', action: undefined },
        ],
      },
    ];
  }

  /**
   * Open the context menu at the specified position.
   */
  open(x: number, y: number): void {
    const items: ContextMenuItem[] = [];

    if (!this.#suppressDefaultItems) {
      items.push(...this.getDefaultItems());
    }

    if (this.#customItems.length > 0) {
      if (items.length > 0) {
        items.push({ name: 'customSeparator', label: '', separator: true });
      }
      items.push(...this.#customItems);
    }

    this.#state = { open: true, x, y, items };
  }

  /**
   * Close the context menu.
   */
  close(): void {
    this.#state = { open: false, x: 0, y: 0, items: [] };
  }

  /**
   * Execute a menu item's action by name.
   */
  executeItem(name: string): boolean {
    const item = this.#findItem(this.#state.items, name);
    if (!item || !item.action) return false;

    const disabled = typeof item.disabled === 'function' ? item.disabled() : item.disabled;
    if (disabled) return false;

    item.action();
    this.close();
    return true;
  }

  /**
   * Check if a menu item is disabled.
   */
  isItemDisabled(name: string): boolean {
    const item = this.#findItem(this.#state.items, name);
    if (!item) return true;
    return typeof item.disabled === 'function' ? item.disabled() : !!item.disabled;
  }

  /**
   * Render the context menu as an HTML string.
   */
  render(): string {
    if (!this.#state.open) return '';

    return `<div class="grid-context-menu" style="left:${this.#state.x}px;top:${this.#state.y}px">
      ${this.#state.items.map((item) => this.#renderItem(item)).join('')}
    </div>`;
  }

  #renderItem(item: ContextMenuItem): string {
    if (item.separator) {
      return '<div class="context-menu-separator"></div>';
    }

    const disabled = typeof item.disabled === 'function' ? item.disabled() : item.disabled;
    const disabledClass = disabled ? ' context-menu-item-disabled' : '';
    const hasSubMenu = item.subMenu && item.subMenu.length > 0;

    let html = `<div class="context-menu-item${disabledClass}" data-action="${item.name}">`;
    if (item.icon) {
      html += `<span class="context-menu-icon">${item.icon}</span>`;
    }
    html += `<span class="context-menu-label">${item.label}</span>`;
    if (item.shortcut) {
      html += `<span class="context-menu-shortcut">${item.shortcut}</span>`;
    }
    if (hasSubMenu) {
      html += '<span class="context-menu-arrow">&#9654;</span>';
      html += '<div class="context-menu-submenu">';
      html += item.subMenu!.map((sub) => this.#renderItem(sub)).join('');
      html += '</div>';
    }
    html += '</div>';

    return html;
  }

  #findItem(items: ContextMenuItem[], name: string): ContextMenuItem | undefined {
    for (const item of items) {
      if (item.name === name) return item;
      if (item.subMenu) {
        const found = this.#findItem(item.subMenu, name);
        if (found) return found;
      }
    }
    return undefined;
  }
}
