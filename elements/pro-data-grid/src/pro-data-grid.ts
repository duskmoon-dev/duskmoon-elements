/**
 * ElDmProDataGrid — Enterprise-grade data grid web component.
 *
 * Phase 1 (MVP): Virtual scrolling, single/multi sort, basic rendering,
 * striped/bordered, loading/empty overlays, keyboard nav, ARIA grid roles.
 */

import { BaseElement } from '@duskmoon-dev/el-core';
import { VirtualScroller } from './core/virtual-scroller.js';
import { SortEngine } from './core/sort-engine.js';
import { ColumnController } from './core/column-controller.js';
import { KeyboardNav, type GridPosition } from './core/keyboard-nav.js';
import { FocusManager } from './core/focus-manager.js';
import { gridStyles } from './styles/grid.css.js';
import { headerStyles } from './styles/header.css.js';
import { cellStyles } from './styles/cells.css.js';
import type {
  Row,
  ColumnDef,
  SortItem,
  FilterModel,
  CellRendererParams,
  ColumnStateInternal,
} from './types.js';
import type { ElDmGridColumn } from './grid-column.js';
import type { ElDmGridColumnGroup } from './grid-column-group.js';

export class ElDmProDataGrid extends BaseElement {
  static properties = {
    rowHeight: { type: Number, reflect: true, attribute: 'row-height', default: 40 },
    headerHeight: { type: Number, reflect: true, attribute: 'header-height', default: 48 },
    pageSize: { type: Number, reflect: true, attribute: 'page-size', default: 0 },
    currentPage: { type: Number, reflect: true, attribute: 'current-page', default: 1 },
    selectionMode: { type: String, reflect: true, attribute: 'selection-mode', default: 'none' },
    sortMode: { type: String, reflect: true, attribute: 'sort-mode', default: 'client' },
    filterMode: { type: String, reflect: true, attribute: 'filter-mode', default: 'client' },
    editable: { type: Boolean, reflect: true, default: false },
    striped: { type: Boolean, reflect: true, default: false },
    bordered: { type: Boolean, reflect: true, default: false },
    loading: { type: Boolean, reflect: true, default: false },
    stickyHeader: { type: Boolean, reflect: true, attribute: 'sticky-header', default: true },
    rowKey: { type: String, reflect: true, attribute: 'row-key', default: 'id' },
    emptyText: { type: String, reflect: true, attribute: 'empty-text', default: 'No data' },
  };

  // ─── Private State ───────────────────────────

  #data: Row[] = [];
  #columns: ColumnDef[] = [];
  #sortModel: SortItem[] = [];
  #filterModel: Record<string, FilterModel> = {};
  #processedRows: Row[] = [];
  #selectedRowKeys = new Set<unknown>();

  // ─── Core Engines ────────────────────────────

  #scroller: VirtualScroller;
  #sortEngine = new SortEngine();
  #columnController = new ColumnController();
  #keyboardNav: KeyboardNav;
  #focusManager = new FocusManager();

  // ─── DOM References ──────────────────────────

  #viewport: HTMLElement | null = null;
  #scrollContainer: HTMLElement | null = null;
  #body: HTMLElement | null = null;
  #headerRow: HTMLElement | null = null;
  #resizeObserver: ResizeObserver | null = null;
  #animFrameId: number | null = null;
  #isRendering = false;

  constructor() {
    super();
    this.attachStyles([gridStyles, headerStyles, cellStyles]);

    this.#scroller = new VirtualScroller({
      rowHeight: (this as unknown as { rowHeight: number }).rowHeight ?? 40,
      viewportHeight: 0,
      totalRows: 0,
    });

    this.#keyboardNav = new KeyboardNav({
      rowCount: 0,
      colCount: 0,
      pageSize: 20,
      onNavigate: (pos) => this.#onNavigate(pos),
      onActivate: (pos) => this.#onActivate(pos),
      onSelect: (pos) => this.#onSelect(pos),
      onEscape: () => {},
    });
  }

  // ─── Public Properties ───────────────────────

  get data(): Row[] {
    return this.#data;
  }

  set data(value: Row[]) {
    this.#data = value;
    this.#processData();
    this.#renderContent();
  }

  get columns(): ColumnDef[] {
    return this.#columns;
  }

  set columns(value: ColumnDef[]) {
    this.#columns = value;
    this.#columnController.setColumns(value);
    this.#keyboardNav.updateBounds(
      this.#processedRows.length,
      this.#columnController.visibleColumns.length,
    );
    this.#renderContent();
  }

  get sortModel(): SortItem[] {
    return this.#sortModel;
  }

  set sortModel(value: SortItem[]) {
    this.#sortModel = value;
    this.#columnController.applySortModel(value);
    this.#processData();
    this.#renderContent();
    this.emit('sort-change', { sortModel: value });
  }

  get filterModel(): Record<string, FilterModel> {
    return this.#filterModel;
  }

  set filterModel(value: Record<string, FilterModel>) {
    this.#filterModel = value;
    this.#processData();
    this.#renderContent();
    this.emit('filter-change', { filterModel: value });
  }

  get selectedRows(): Row[] {
    const rowKey = (this as unknown as { rowKey: string }).rowKey ?? 'id';
    return this.#data.filter((r) => this.#selectedRowKeys.has(r[rowKey]));
  }

  // ─── Public Methods ──────────────────────────

  scrollToRow(index: number): void {
    if (!this.#viewport) return;
    const top = this.#scroller.getScrollTopForRow(index);
    this.#viewport.scrollTop = top;
  }

  selectAll(): void {
    const rowKey = (this as unknown as { rowKey: string }).rowKey ?? 'id';
    for (const row of this.#processedRows) {
      this.#selectedRowKeys.add(row[rowKey]);
    }
    this.#renderContent();
    this.emit('selection-change', {
      selectedRows: this.selectedRows,
      added: [...this.#processedRows],
      removed: [],
    });
  }

  deselectAll(): void {
    const removed = this.selectedRows;
    this.#selectedRowKeys.clear();
    this.#renderContent();
    this.emit('selection-change', {
      selectedRows: [],
      added: [],
      removed,
    });
  }

  autoSizeColumns(fields?: string[]): void {
    // Auto-size to fit container width
    if (this.#viewport) {
      this.#columnController.sizeColumnsToFit(this.#viewport.clientWidth);
      this.#renderContent();
    }
  }

  sizeColumnsToFit(): void {
    this.autoSizeColumns();
  }

  refreshLayout(): void {
    this.#updateViewportSize();
    this.#renderContent();
  }

  exportCsv(opts?: { filename?: string; selectedOnly?: boolean }): void {
    const rows = opts?.selectedOnly ? this.selectedRows : this.#processedRows;
    const visible = this.#columnController.visibleColumns;
    const headers = visible.map((c) => c.def.header).join(',');
    const body = rows
      .map((row) =>
        visible
          .map((c) => {
            const val = row[c.def.field];
            const str = val == null ? '' : String(val);
            return str.includes(',') || str.includes('"') || str.includes('\n')
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          })
          .join(','),
      )
      .join('\n');
    const csv = `${headers}\n${body}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = opts?.filename ?? 'export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ─── Lifecycle ───────────────────────────────

  override connectedCallback(): void {
    super.connectedCallback();
    this.#readColumnChildren();
    this.addEventListener('column-def-change', () => this.#readColumnChildren());
    this.#setupInitialRender();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#resizeObserver?.disconnect();
    if (this.#animFrameId !== null) {
      cancelAnimationFrame(this.#animFrameId);
    }
    this.#focusManager.detach();
  }

  // ─── Rendering (overrides BaseElement) ───────

  protected override update(): void {
    // Initial DOM creation — called once by BaseElement connectedCallback
    if (!this.#viewport) {
      this.shadowRoot.innerHTML = this.#renderShell();
      this.#cacheElements();
      this.#setupListeners();
    }
    this.#renderContent();
  }

  // Not using BaseElement's render() because we manage DOM manually for performance
  protected override render(): string | undefined {
    return undefined;
  }

  // ─── Private: Setup ──────────────────────────

  #setupInitialRender(): void {
    // Wait a frame to get layout dimensions
    requestAnimationFrame(() => {
      this.#updateViewportSize();
      this.#renderContent();
    });
  }

  #readColumnChildren(): void {
    // If programmatic columns are set, those take priority
    if (this.#columns.length > 0) return;

    const defs: ColumnDef[] = [];
    for (const child of Array.from(this.children)) {
      if (child.tagName === 'EL-DM-GRID-COLUMN') {
        defs.push((child as ElDmGridColumn).columnDef);
      } else if (child.tagName === 'EL-DM-GRID-COLUMN-GROUP') {
        const group = child as ElDmGridColumnGroup;
        for (const colDef of group.columnDefs) {
          defs.push(colDef);
        }
      }
    }

    if (defs.length > 0) {
      this.#columnController.setColumns(defs);
      this.#keyboardNav.updateBounds(
        this.#processedRows.length,
        this.#columnController.visibleColumns.length,
      );
    }
  }

  #renderShell(): string {
    const rowKey = (this as unknown as { rowKey: string }).rowKey ?? 'id';
    return `
      <div class="grid-wrapper" role="grid"
           aria-label="Data Grid"
           aria-rowcount="${this.#processedRows.length}"
           aria-colcount="${this.#columnController.visibleColumns.length}">
        <div class="grid-viewport">
          <div class="grid-header" role="row"></div>
          <div class="grid-scroll-container">
            <div class="grid-body" role="rowgroup"></div>
          </div>
        </div>
      </div>
    `;
  }

  #cacheElements(): void {
    this.#viewport = this.shadowRoot.querySelector('.grid-viewport');
    this.#scrollContainer = this.shadowRoot.querySelector('.grid-scroll-container');
    this.#body = this.shadowRoot.querySelector('.grid-body');
    this.#headerRow = this.shadowRoot.querySelector('.grid-header');

    if (this.#viewport) {
      this.#focusManager.attach(this.#viewport);

      if (typeof ResizeObserver !== 'undefined') {
        this.#resizeObserver = new ResizeObserver(() => {
          this.#updateViewportSize();
          this.#renderContent();
        });
        this.#resizeObserver.observe(this.#viewport);
      }
    }
  }

  #setupListeners(): void {
    // Scroll handler — uses requestAnimationFrame for smooth rendering
    this.#viewport?.addEventListener('scroll', () => {
      if (this.#animFrameId !== null) return;
      this.#animFrameId = requestAnimationFrame(() => {
        this.#animFrameId = null;
        this.#scroller.scrollTop = this.#viewport?.scrollTop ?? 0;
        this.#renderRows();
      });
    });

    // Keyboard navigation
    this.#viewport?.addEventListener('keydown', (e) => {
      this.#keyboardNav.handleKeyDown(e as KeyboardEvent);
    });

    // Header click for sorting
    this.#headerRow?.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('[data-field]') as HTMLElement | null;
      if (!target) return;
      const field = target.dataset.field;
      const sortable = target.hasAttribute('data-sortable');
      if (!field || !sortable) return;

      const multiSort = (e as MouseEvent).shiftKey;
      this.sortModel = this.#sortEngine.updateSortModel(this.#sortModel, field, multiSort);
    });

    // Row/cell click
    this.#body?.addEventListener('click', (e) => {
      const cell = (e.target as HTMLElement).closest('[data-grid-cell]') as HTMLElement | null;
      if (!cell) return;

      const rowIndex = Number(cell.dataset.rowIndex);
      const colIndex = Number(cell.dataset.colIndex);
      const field = cell.dataset.field ?? '';
      const row = this.#processedRows[rowIndex];
      if (!row) return;

      // Emit cell-click
      this.emit('cell-click', { row, field, value: row[field], rowIndex });

      // Handle selection
      this.#handleRowSelection(row, e as MouseEvent);

      // Update keyboard position
      this.#keyboardNav.position = { rowIndex, colIndex };
      this.#focusManager.focusCell(rowIndex, colIndex);
    });
  }

  // ─── Private: Data Processing ────────────────

  #processData(): void {
    let rows = [...this.#data];

    // Apply client-side sort
    const sortMode = (this as unknown as { sortMode: string }).sortMode ?? 'client';
    if (sortMode === 'client' && this.#sortModel.length > 0) {
      rows = this.#sortEngine.sort(
        rows,
        this.#sortModel,
        this.#columnController.columns.map((c) => c.def),
      );
    }

    this.#processedRows = rows;
    this.#scroller.totalRows = rows.length;
    this.#keyboardNav.updateBounds(rows.length, this.#columnController.visibleColumns.length);
  }

  #updateViewportSize(): void {
    if (!this.#viewport) return;
    const headerHeight = (this as unknown as { headerHeight: number }).headerHeight ?? 48;
    this.#scroller.viewportHeight = this.#viewport.clientHeight - headerHeight;
    this.#scroller.rowHeight = (this as unknown as { rowHeight: number }).rowHeight ?? 40;
  }

  // ─── Private: Rendering ──────────────────────

  #renderContent(): void {
    if (this.#isRendering) return;
    this.#isRendering = true;
    queueMicrotask(() => {
      this.#isRendering = false;
      this.#renderHeader();
      this.#renderRows();
      this.#renderOverlays();
      this.#updateAriaAttributes();
    });
  }

  #renderHeader(): void {
    if (!this.#headerRow) return;
    const visible = this.#columnController.visibleColumns;
    const headerHeight = (this as unknown as { headerHeight: number }).headerHeight ?? 48;

    this.#headerRow.style.height = `${headerHeight}px`;
    this.#headerRow.innerHTML = visible
      .map((col) => {
        const sortIndicator = this.#renderSortIndicator(col.sortDirection, col.sortIndex);
        return `
          <div class="grid-header-cell"
               role="columnheader"
               style="width:${col.width}px"
               data-field="${col.def.field}"
               ${col.def.sortable ? 'data-sortable' : ''}
               ${col.def.headerAlign ? `data-align="${col.def.headerAlign}"` : ''}
               aria-sort="${col.sortDirection === 'asc' ? 'ascending' : col.sortDirection === 'desc' ? 'descending' : 'none'}"
               tabindex="-1">
            <span class="grid-header-text">${this.#escapeHtml(col.def.header)}</span>
            ${sortIndicator}
            ${col.def.resizable !== false ? '<div class="grid-resize-handle"></div>' : ''}
          </div>
        `;
      })
      .join('');
  }

  #renderSortIndicator(direction: 'asc' | 'desc' | null, index: number | null): string {
    if (!direction) return '';
    const arrow = direction === 'asc' ? '↑' : '↓';
    const indexStr =
      index !== null && this.#sortModel.length > 1
        ? `<span class="grid-sort-index">${index + 1}</span>`
        : '';
    return `<span class="grid-sort-indicator"><span class="grid-sort-arrow">${arrow}</span>${indexStr}</span>`;
  }

  #renderRows(): void {
    if (!this.#body || !this.#scrollContainer) return;

    const { startIndex, endIndex, startOffset } = this.#scroller.getVisibleRange();
    const visible = this.#columnController.visibleColumns;
    const rowHeight = (this as unknown as { rowHeight: number }).rowHeight ?? 40;
    const rowKey = (this as unknown as { rowKey: string }).rowKey ?? 'id';

    // Set container height for scrollbar
    this.#scrollContainer.style.height = `${this.#scroller.totalContentHeight}px`;

    // Position body at the correct offset
    this.#body.style.transform = `translateY(${startOffset}px)`;

    // Build rows HTML
    const rowsHtml: string[] = [];
    for (let i = startIndex; i <= endIndex && i < this.#processedRows.length; i++) {
      const row = this.#processedRows[i];
      const isSelected = this.#selectedRowKeys.has(row[rowKey]);
      rowsHtml.push(this.#renderRow(row, i, visible, rowHeight, isSelected));
    }

    this.#body.innerHTML = rowsHtml.join('');
  }

  #renderRow(
    row: Row,
    rowIndex: number,
    columns: ColumnStateInternal[],
    rowHeight: number,
    isSelected: boolean,
  ): string {
    const cells = columns
      .map((col, colIndex) => {
        const value = row[col.def.field];
        const cellContent = this.#renderCellContent(value, row, col.def, rowIndex);
        return `
          <div class="grid-cell"
               role="gridcell"
               data-grid-cell
               data-row-index="${rowIndex}"
               data-col-index="${colIndex}"
               data-field="${col.def.field}"
               ${col.def.align ? `data-align="${col.def.align}"` : ''}
               style="width:${col.width}px;height:${rowHeight}px"
               tabindex="-1"
               aria-readonly="true">
            <span class="grid-cell-content">${cellContent}</span>
          </div>
        `;
      })
      .join('');

    return `
      <div class="grid-row" role="row"
           data-row-index="${rowIndex}"
           ${isSelected ? 'data-selected' : ''}
           aria-rowindex="${rowIndex + 1}"
           aria-selected="${isSelected}">
        ${cells}
      </div>
    `;
  }

  #renderCellContent(value: unknown, row: Row, column: ColumnDef, rowIndex: number): string {
    // Custom renderer takes priority
    if (column.renderer) {
      const params: CellRendererParams = {
        value,
        row,
        field: column.field,
        rowIndex,
        column,
      };
      const result = column.renderer(params);
      if (typeof result === 'string') return result;
      // HTMLElement — use its outerHTML
      if (result instanceof HTMLElement) return result.outerHTML;
    }

    if (value == null) return '';

    switch (column.type) {
      case 'boolean':
        return `<span class="grid-cell-boolean" ${value ? 'data-checked' : ''}></span>`;
      case 'number': {
        const num = Number(value);
        if (column.format) {
          return this.#formatNumber(num, column.format);
        }
        return this.#escapeHtml(String(num));
      }
      case 'date': {
        const date = new Date(String(value));
        if (column.format) {
          return this.#formatDate(date, column.format);
        }
        return this.#escapeHtml(date.toLocaleDateString());
      }
      default:
        return this.#escapeHtml(String(value));
    }
  }

  #renderOverlays(): void {
    const wrapper = this.shadowRoot.querySelector('.grid-wrapper');
    if (!wrapper) return;

    // Remove existing overlays
    wrapper.querySelector('.grid-loading-overlay')?.remove();
    wrapper.querySelector('.grid-empty-overlay')?.remove();

    const loading = (this as unknown as { loading: boolean }).loading;
    const emptyText = (this as unknown as { emptyText: string }).emptyText ?? 'No data';

    if (loading) {
      const overlay = document.createElement('div');
      overlay.className = 'grid-loading-overlay';
      overlay.innerHTML = '<div class="grid-loading-spinner"></div>';
      wrapper.appendChild(overlay);
      wrapper.setAttribute('aria-busy', 'true');
    } else {
      wrapper.removeAttribute('aria-busy');
    }

    if (!loading && this.#processedRows.length === 0) {
      const overlay = document.createElement('div');
      overlay.className = 'grid-empty-overlay';
      overlay.textContent = emptyText;
      wrapper.appendChild(overlay);
    }
  }

  #updateAriaAttributes(): void {
    const wrapper = this.shadowRoot.querySelector('[role="grid"]');
    if (!wrapper) return;
    wrapper.setAttribute('aria-rowcount', String(this.#processedRows.length));
    wrapper.setAttribute('aria-colcount', String(this.#columnController.visibleColumns.length));
  }

  // ─── Private: Selection ──────────────────────

  #handleRowSelection(row: Row, event: MouseEvent): void {
    const mode = (this as unknown as { selectionMode: string }).selectionMode ?? 'none';
    if (mode === 'none') return;

    const rowKey = (this as unknown as { rowKey: string }).rowKey ?? 'id';
    const key = row[rowKey];

    if (mode === 'single') {
      this.#selectedRowKeys.clear();
      this.#selectedRowKeys.add(key);
    } else if (mode === 'multiple') {
      if (this.#selectedRowKeys.has(key)) {
        this.#selectedRowKeys.delete(key);
      } else {
        this.#selectedRowKeys.add(key);
      }
    }

    this.#renderRows();
    this.emit('selection-change', {
      selectedRows: this.selectedRows,
      added: this.#selectedRowKeys.has(key) ? [row] : [],
      removed: !this.#selectedRowKeys.has(key) ? [row] : [],
    });
  }

  // ─── Private: Keyboard Handlers ──────────────

  #onNavigate(pos: GridPosition): void {
    this.#focusManager.focusCell(pos.rowIndex, pos.colIndex);
    // Ensure row is visible
    this.scrollToRow(pos.rowIndex);
  }

  #onActivate(pos: GridPosition): void {
    const row = this.#processedRows[pos.rowIndex];
    const col = this.#columnController.visibleColumns[pos.colIndex];
    if (!row || !col) return;
    this.emit('cell-double-click', {
      row,
      field: col.def.field,
      value: row[col.def.field],
      rowIndex: pos.rowIndex,
    });
  }

  #onSelect(pos: GridPosition): void {
    const row = this.#processedRows[pos.rowIndex];
    if (!row) return;
    this.#handleRowSelection(row, new MouseEvent('click'));
  }

  // ─── Private: Utilities ──────────────────────

  #escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  #formatNumber(num: number, format: string): string {
    // Simple format support: 'currency', 'percent', or locale string
    try {
      if (format === 'currency') {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(num);
      }
      if (format === 'percent') {
        return new Intl.NumberFormat(undefined, { style: 'percent' }).format(num);
      }
      return new Intl.NumberFormat(undefined).format(num);
    } catch {
      return String(num);
    }
  }

  #formatDate(date: Date, format: string): string {
    try {
      if (format === 'short') {
        return date.toLocaleDateString(undefined, { dateStyle: 'short' });
      }
      if (format === 'medium') {
        return date.toLocaleDateString(undefined, { dateStyle: 'medium' });
      }
      if (format === 'long') {
        return date.toLocaleDateString(undefined, { dateStyle: 'long' });
      }
      return date.toLocaleDateString();
    } catch {
      return String(date);
    }
  }
}

export function registerProDataGrid(): void {
  if (!customElements.get('el-dm-pro-data-grid')) {
    customElements.define('el-dm-pro-data-grid', ElDmProDataGrid);
  }
}
