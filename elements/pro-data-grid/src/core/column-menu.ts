/**
 * Column menu — popup menu for column filter, sort, and visibility controls.
 *
 * Renders a small popup anchored to a header cell with tabs:
 * - Filter tab: column-specific filter controls
 * - General tab: sort, hide, pin, auto-size
 * - Columns tab: toggle visibility of other columns
 */

import type { ColumnDef, FilterModel } from '../types.js';

export interface ColumnMenuConfig {
  field: string;
  column: ColumnDef;
  anchorRect: DOMRect;
  currentFilter?: FilterModel;
  allColumns: ColumnDef[];
}

export interface ColumnMenuAction {
  type:
    | 'sort-asc'
    | 'sort-desc'
    | 'clear-sort'
    | 'hide-column'
    | 'auto-size'
    | 'pin-left'
    | 'pin-right'
    | 'unpin'
    | 'apply-filter'
    | 'clear-filter'
    | 'toggle-column';
  field: string;
  filterModel?: FilterModel;
  targetField?: string;
  visible?: boolean;
}

export class ColumnMenu {
  #container: HTMLElement | null = null;
  #config: ColumnMenuConfig | null = null;
  #onAction: ((action: ColumnMenuAction) => void) | null = null;
  #onClose: (() => void) | null = null;

  get isOpen(): boolean {
    return this.#container !== null;
  }

  open(
    host: ShadowRoot,
    config: ColumnMenuConfig,
    onAction: (action: ColumnMenuAction) => void,
    onClose: () => void,
  ): void {
    this.close();
    this.#config = config;
    this.#onAction = onAction;
    this.#onClose = onClose;

    this.#container = document.createElement('div');
    this.#container.className = 'grid-column-menu';
    this.#container.setAttribute('role', 'menu');
    this.#container.setAttribute('aria-label', `Column menu: ${config.column.header}`);

    this.#renderMenu();
    this.#positionMenu(config.anchorRect);

    host.appendChild(this.#container);

    // Close on outside click (next tick to avoid immediate close)
    requestAnimationFrame(() => {
      document.addEventListener('mousedown', this.#handleOutsideClick);
    });
  }

  close(): void {
    if (this.#container) {
      this.#container.remove();
      this.#container = null;
      document.removeEventListener('mousedown', this.#handleOutsideClick);
      this.#onClose?.();
    }
    this.#config = null;
    this.#onAction = null;
    this.#onClose = null;
  }

  #handleOutsideClick = (e: Event) => {
    if (this.#container && !this.#container.contains(e.target as Node)) {
      this.close();
    }
  };

  #positionMenu(anchor: DOMRect): void {
    if (!this.#container) return;
    const menu = this.#container;
    menu.style.position = 'absolute';
    menu.style.top = `${anchor.bottom}px`;
    menu.style.left = `${anchor.left}px`;
    menu.style.zIndex = '1000';
  }

  #renderMenu(): void {
    if (!this.#container || !this.#config) return;
    const { column, field, allColumns } = this.#config;

    this.#container.innerHTML = `
      <div class="grid-column-menu-section">
        ${
          column.sortable !== false
            ? `
          <button class="grid-column-menu-item" data-action="sort-asc">
            <span class="grid-menu-icon">↑</span> Sort Ascending
          </button>
          <button class="grid-column-menu-item" data-action="sort-desc">
            <span class="grid-menu-icon">↓</span> Sort Descending
          </button>
          <button class="grid-column-menu-item" data-action="clear-sort">
            <span class="grid-menu-icon">⊘</span> Clear Sort
          </button>
          <div class="grid-column-menu-divider"></div>
        `
            : ''
        }
        ${
          column.filterable !== false
            ? `
          <div class="grid-column-menu-filter">
            <label class="grid-column-menu-label">Filter</label>
            <input class="grid-column-menu-filter-input"
                   type="text"
                   placeholder="Filter..."
                   data-action="filter-input"
                   aria-label="Filter ${this.#escapeHtml(column.header)}" />
            <div class="grid-column-menu-filter-actions">
              <button class="grid-column-menu-btn" data-action="apply-filter">Apply</button>
              <button class="grid-column-menu-btn" data-action="clear-filter">Clear</button>
            </div>
          </div>
          <div class="grid-column-menu-divider"></div>
        `
            : ''
        }
        <button class="grid-column-menu-item" data-action="auto-size">
          <span class="grid-menu-icon">⇔</span> Auto Size
        </button>
        ${
          column.lockVisible
            ? ''
            : `
          <button class="grid-column-menu-item" data-action="hide-column">
            <span class="grid-menu-icon">👁</span> Hide Column
          </button>
        `
        }
        <button class="grid-column-menu-item" data-action="pin-left">
          <span class="grid-menu-icon">◀</span> Pin Left
        </button>
        <button class="grid-column-menu-item" data-action="pin-right">
          <span class="grid-menu-icon">▶</span> Pin Right
        </button>
        <button class="grid-column-menu-item" data-action="unpin">
          <span class="grid-menu-icon">⊘</span> Unpin
        </button>
        <div class="grid-column-menu-divider"></div>
        <div class="grid-column-menu-columns">
          <label class="grid-column-menu-label">Columns</label>
          ${allColumns
            .map(
              (c) => `
            <label class="grid-column-menu-column-item">
              <input type="checkbox"
                     data-action="toggle-column"
                     data-target-field="${c.field}"
                     ${!c.hidden ? 'checked' : ''}
                     ${c.lockVisible ? 'disabled' : ''} />
              ${this.#escapeHtml(c.header)}
            </label>
          `,
            )
            .join('')}
        </div>
      </div>
    `;

    // Attach click handlers
    this.#container.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('[data-action]') as HTMLElement | null;
      if (!btn) return;
      this.#handleAction(btn.dataset.action!, btn);
    });

    // Attach checkbox change handlers
    this.#container.addEventListener('change', (e) => {
      const checkbox = e.target as HTMLInputElement;
      if (checkbox.dataset.action === 'toggle-column') {
        this.#onAction?.({
          type: 'toggle-column',
          field,
          targetField: checkbox.dataset.targetField,
          visible: checkbox.checked,
        });
      }
    });
  }

  #handleAction(action: string, _element: HTMLElement): void {
    if (!this.#config) return;
    const { field } = this.#config;

    switch (action) {
      case 'sort-asc':
        this.#onAction?.({ type: 'sort-asc', field });
        this.close();
        break;
      case 'sort-desc':
        this.#onAction?.({ type: 'sort-desc', field });
        this.close();
        break;
      case 'clear-sort':
        this.#onAction?.({ type: 'clear-sort', field });
        this.close();
        break;
      case 'hide-column':
        this.#onAction?.({ type: 'hide-column', field });
        this.close();
        break;
      case 'auto-size':
        this.#onAction?.({ type: 'auto-size', field });
        this.close();
        break;
      case 'pin-left':
        this.#onAction?.({ type: 'pin-left', field });
        this.close();
        break;
      case 'pin-right':
        this.#onAction?.({ type: 'pin-right', field });
        this.close();
        break;
      case 'unpin':
        this.#onAction?.({ type: 'unpin', field });
        this.close();
        break;
      case 'apply-filter': {
        const input = this.#container?.querySelector(
          '.grid-column-menu-filter-input',
        ) as HTMLInputElement | null;
        if (input && input.value.trim()) {
          this.#onAction?.({
            type: 'apply-filter',
            field,
            filterModel: {
              type: 'text',
              operator: 'contains',
              value: input.value.trim(),
            },
          });
        }
        this.close();
        break;
      }
      case 'clear-filter':
        this.#onAction?.({ type: 'clear-filter', field });
        this.close();
        break;
    }
  }

  #escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
