/**
 * DuskMoon Table Element
 *
 * A full-featured data table with sorting, pagination, and row selection.
 *
 * @element el-dm-table
 *
 * @fires sort - When sort changes
 * @fires select - When selection changes
 * @fires page-change - When page changes
 * @fires row-click - When a row is clicked
 *
 * @slot header-actions - Actions above the table
 * @slot footer-actions - Actions below the table
 * @slot empty - Custom empty state content
 *
 * @csspart wrapper - Main wrapper container
 * @csspart container - Scrollable table container
 * @csspart table - The table element
 * @csspart thead - Table header
 * @csspart tbody - Table body
 * @csspart th - Header cell
 * @csspart td - Body cell
 * @csspart row - Body row
 * @csspart pagination - Pagination container
 */

import { BaseElement, css } from '@duskmoon-dev/el-core';
import type {
  TableColumn,
  TableRow,
  SortDirection,
  SelectionMode,
  TableSortEventDetail,
  TableSelectEventDetail,
  TablePageEventDetail,
  TableRowClickEventDetail,
} from './types.js';
import { ElDmTableColumn } from './el-dm-table-column.js';

// SVG Icons
const ICONS = {
  sortAsc: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h4"/><path d="M11 8h7"/><path d="M11 12h10"/></svg>`,
  sortDesc: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/><path d="M11 12h4"/><path d="M11 16h7"/><path d="M11 20h10"/></svg>`,
  sort: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg>`,
  chevronLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
  chevronRight: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
  chevronFirst: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 18-6-6 6-6"/><path d="M7 6v12"/></svg>`,
  chevronLast: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 18 6-6-6-6"/><path d="M17 6v12"/></svg>`,
};

const styles = css`
  :host {
    display: block;
    font-family: inherit;
  }

  :host([hidden]) {
    display: none !important;
  }

  /* Main wrapper */
  .table-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  /* Header/Footer action slots */
  .table-header-actions,
  .table-footer-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .table-header-actions:empty,
  .table-footer-actions:empty {
    display: none;
  }

  /* Container for scrolling */
  .table-container {
    overflow-x: auto;
    border: 1px solid var(--color-outline, #e0e0e0);
    border-radius: var(--radius-md, 0.5rem);
  }

  /* Sticky header variant */
  :host([sticky-header]) .table-container {
    max-height: var(--table-max-height, 400px);
    overflow-y: auto;
  }

  :host([sticky-header]) .table thead {
    position: sticky;
    top: 0;
    z-index: 1;
  }

  /* Base table */
  .table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
    background-color: var(--color-surface, #ffffff);
  }

  /* Header styles */
  .table-th {
    padding: 0.75rem 1rem;
    text-align: left;
    font-weight: 600;
    color: var(--color-on-surface, #1a1a1a);
    background-color: var(--color-surface-container, #f5f5f5);
    border-bottom: 2px solid var(--color-outline, #e0e0e0);
    white-space: nowrap;
  }

  .table-th.sortable {
    cursor: pointer;
    user-select: none;
  }

  .table-th.sortable:hover {
    background-color: var(--color-surface-container-high, #ebebeb);
  }

  .table-th.sortable:focus-visible {
    outline: 2px solid var(--color-primary, #6366f1);
    outline-offset: -2px;
  }

  .table-th.sorted {
    color: var(--color-primary, #6366f1);
  }

  .th-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .sort-icon {
    display: flex;
    width: 1rem;
    height: 1rem;
    opacity: 0.5;
    flex-shrink: 0;
  }

  .table-th.sorted .sort-icon {
    opacity: 1;
  }

  /* Cell styles */
  .table-td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-outline-variant, #e8e8e8);
    color: var(--color-on-surface, #1a1a1a);
  }

  /* Row styles */
  .table-row {
    transition: background-color 150ms ease;
  }

  :host([hoverable]) .table-row:hover {
    background-color: var(--color-surface-container, #f5f5f5);
  }

  .table-row.selected {
    background-color: color-mix(in srgb, var(--color-primary, #6366f1) 15%, transparent);
  }

  :host([hoverable]) .table-row.selected:hover {
    background-color: color-mix(in srgb, var(--color-primary, #6366f1) 20%, transparent);
  }

  /* Selection column */
  .select-cell {
    width: 48px;
    text-align: center;
    padding: 0.5rem;
  }

  .select-cell input {
    cursor: pointer;
    width: 18px;
    height: 18px;
    accent-color: var(--color-primary, #6366f1);
  }

  /* Striped variant */
  :host([striped]) .table tbody tr:nth-child(even) {
    background-color: var(--color-surface-container-low, #fafafa);
  }

  :host([striped]) .table tbody tr.selected:nth-child(even) {
    background-color: color-mix(in srgb, var(--color-primary, #6366f1) 15%, transparent);
  }

  /* Bordered variant */
  :host([bordered]) .table-td,
  :host([bordered]) .table-th {
    border: 1px solid var(--color-outline, #e0e0e0);
  }

  /* Compact variant */
  :host([compact]) .table-th,
  :host([compact]) .table-td {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }

  :host([compact]) .select-cell {
    padding: 0.375rem 0.5rem;
  }

  /* Loading state */
  .loading-row td {
    padding: 3rem;
    text-align: center;
    color: var(--color-on-surface-variant, #666);
  }

  .loading-spinner {
    display: inline-block;
    width: 24px;
    height: 24px;
    border: 2px solid var(--color-outline, #e0e0e0);
    border-top-color: var(--color-primary, #6366f1);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Empty state */
  .empty-row td {
    padding: 3rem;
    text-align: center;
    color: var(--color-on-surface-variant, #666);
  }

  /* Pagination styles */
  .table-pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-outline, #e0e0e0);
    border-top: none;
    border-radius: 0 0 var(--radius-md, 0.5rem) var(--radius-md, 0.5rem);
    background-color: var(--color-surface-container, #f5f5f5);
    font-size: 0.875rem;
  }

  .pagination-info {
    color: var(--color-on-surface-variant, #666);
  }

  .pagination-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .pagination-nav {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .pagination-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 1px solid var(--color-outline, #e0e0e0);
    border-radius: var(--radius-sm, 0.25rem);
    background: var(--color-surface, #ffffff);
    cursor: pointer;
    transition: all 150ms ease;
    color: var(--color-on-surface, #1a1a1a);
  }

  .pagination-btn:hover:not(:disabled) {
    background: var(--color-surface-container-high, #ebebeb);
  }

  .pagination-btn:focus-visible {
    outline: 2px solid var(--color-primary, #6366f1);
    outline-offset: 2px;
  }

  .pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pagination-current {
    padding: 0 0.75rem;
    color: var(--color-on-surface, #1a1a1a);
    min-width: 100px;
    text-align: center;
  }

  .page-size-select {
    padding: 0.375rem 0.75rem;
    border: 1px solid var(--color-outline, #e0e0e0);
    border-radius: var(--radius-sm, 0.25rem);
    background: var(--color-surface, #ffffff);
    font-size: 0.875rem;
    cursor: pointer;
  }

  .page-size-select:focus-visible {
    outline: 2px solid var(--color-primary, #6366f1);
    outline-offset: 2px;
  }

  /* Clickable rows */
  :host([selection-mode='single']) .table-row,
  :host([selection-mode='multiple']) .table-row {
    cursor: pointer;
  }
`;

export class ElDmTable extends BaseElement {
  static properties = {
    // Data
    columns: { type: Array, attribute: false as const },
    data: { type: Array, attribute: false as const },

    // Sorting
    sortColumn: { type: String, reflect: true, attribute: 'sort-column' },
    sortDirection: {
      type: String,
      reflect: true,
      attribute: 'sort-direction',
      default: 'asc',
    },

    // Pagination
    paginated: { type: Boolean, reflect: true },
    page: { type: Number, reflect: true, default: 1 },
    pageSize: { type: Number, reflect: true, attribute: 'page-size', default: 10 },
    pageSizeOptions: { type: Array, attribute: false as const },

    // Selection
    selectionMode: {
      type: String,
      reflect: true,
      attribute: 'selection-mode',
      default: 'none',
    },
    selectedIds: { type: Array, attribute: false as const },

    // Display options
    striped: { type: Boolean, reflect: true },
    bordered: { type: Boolean, reflect: true },
    hoverable: { type: Boolean, reflect: true, default: true },
    compact: { type: Boolean, reflect: true },
    stickyHeader: { type: Boolean, reflect: true, attribute: 'sticky-header' },

    // State
    loading: { type: Boolean, reflect: true },
    emptyMessage: {
      type: String,
      reflect: true,
      attribute: 'empty-message',
      default: 'No data available',
    },
  };

  // Type declarations
  declare columns: TableColumn[];
  declare data: TableRow[];
  declare sortColumn: string;
  declare sortDirection: SortDirection;
  declare paginated: boolean;
  declare page: number;
  declare pageSize: number;
  declare pageSizeOptions: number[];
  declare selectionMode: SelectionMode;
  declare selectedIds: (string | number)[];
  declare striped: boolean;
  declare bordered: boolean;
  declare hoverable: boolean;
  declare compact: boolean;
  declare stickyHeader: boolean;
  declare loading: boolean;
  declare emptyMessage: string;

  // Private state
  private _internalSelectedIds: Set<string | number> = new Set();

  constructor() {
    super();
    this.attachStyles(styles);
    this.columns = [];
    this.data = [];
    this.selectedIds = [];
    this.pageSizeOptions = [5, 10, 25, 50];
  }

  connectedCallback(): void {
    super.connectedCallback();
    // Listen for child column changes
    this.addEventListener('table-column-change', this._handleColumnChange);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('table-column-change', this._handleColumnChange);
  }

  protected update(): void {
    super.update();
    this._attachEventListeners();
  }

  private _handleColumnChange = (): void => {
    // Re-render when child columns change
    this.update();
  };

  private _attachEventListeners(): void {
    // Sort handlers
    this.shadowRoot?.querySelectorAll('.table-th.sortable').forEach((th) => {
      th.addEventListener('click', this._handleHeaderClick);
      th.addEventListener('keydown', this._handleHeaderKeydown);
    });

    // Row click handlers
    this.shadowRoot?.querySelectorAll('.table-row').forEach((row) => {
      row.addEventListener('click', this._handleRowClick);
    });

    // Selection handlers
    this.shadowRoot?.querySelectorAll('.row-select').forEach((input) => {
      input.addEventListener('change', this._handleRowSelectChange);
    });

    // Select all handler
    const selectAll = this.shadowRoot?.querySelector('.select-all');
    selectAll?.addEventListener('change', this._handleSelectAllChange);

    // Pagination handlers
    this.shadowRoot?.querySelectorAll('.pagination-btn').forEach((btn) => {
      btn.addEventListener('click', this._handlePaginationClick);
    });

    const pageSizeSelect = this.shadowRoot?.querySelector('.page-size-select');
    pageSizeSelect?.addEventListener('change', this._handlePageSizeChange);
  }

  // ============ Sorting ============

  private _handleHeaderClick = (e: Event): void => {
    const th = (e.currentTarget as HTMLElement).closest('[data-column]');
    const column = th?.getAttribute('data-column');
    if (column) {
      this.sort(column);
    }
  };

  private _handleHeaderKeydown = (e: Event): void => {
    const keyEvent = e as KeyboardEvent;
    if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
      keyEvent.preventDefault();
      this._handleHeaderClick(e);
    }
  };

  /** Sort by column - toggles direction if same column */
  sort(column: string, direction?: SortDirection): void {
    if (direction) {
      this.sortColumn = column;
      this.sortDirection = direction;
    } else if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.emit<TableSortEventDetail>('sort', {
      column: this.sortColumn,
      direction: this.sortDirection,
    });
  }

  private _sortData(data: TableRow[]): TableRow[] {
    if (!this.sortColumn) return data;

    return [...data].sort((a, b) => {
      const aVal = a[this.sortColumn];
      const bVal = b[this.sortColumn];

      let comparison = 0;
      if (aVal === null || aVal === undefined) comparison = 1;
      else if (bVal === null || bVal === undefined) comparison = -1;
      else if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return this.sortDirection === 'desc' ? -comparison : comparison;
    });
  }

  // ============ Pagination ============

  private _handlePaginationClick = (e: Event): void => {
    const btn = e.currentTarget as HTMLElement;
    const action = btn.getAttribute('data-action');

    switch (action) {
      case 'first':
        this.goToPage(1);
        break;
      case 'prev':
        this.goToPage(this.page - 1);
        break;
      case 'next':
        this.goToPage(this.page + 1);
        break;
      case 'last':
        this.goToPage(this._getTotalPages());
        break;
    }
  };

  private _handlePageSizeChange = (e: Event): void => {
    const select = e.target as HTMLSelectElement;
    const newPageSize = parseInt(select.value, 10);
    this.pageSize = newPageSize;
    this.page = 1; // Reset to first page

    this.emit<TablePageEventDetail>('page-change', {
      page: this.page,
      pageSize: this.pageSize,
    });
  };

  /** Go to specific page */
  goToPage(page: number): void {
    const totalPages = this._getTotalPages();
    const newPage = Math.max(1, Math.min(page, totalPages));

    if (newPage !== this.page) {
      this.page = newPage;
      this.emit<TablePageEventDetail>('page-change', {
        page: this.page,
        pageSize: this.pageSize,
      });
    }
  }

  private _getTotalPages(): number {
    return Math.max(1, Math.ceil(this.data.length / this.pageSize));
  }

  private _paginateData(data: TableRow[]): TableRow[] {
    if (!this.paginated) return data;

    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return data.slice(start, end);
  }

  private _getStartRow(): number {
    if (this.data.length === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  private _getEndRow(): number {
    return Math.min(this.page * this.pageSize, this.data.length);
  }

  // ============ Selection ============

  private _handleRowClick = (e: Event): void => {
    const row = (e.target as HTMLElement).closest('.table-row');
    if (!row) return;

    // Don't handle if clicking on checkbox/radio
    if ((e.target as HTMLElement).closest('.select-cell')) return;

    const rowId = row.getAttribute('data-row-id');
    const rowIndex = parseInt(row.getAttribute('data-row-index') || '0', 10);

    if (rowId !== null) {
      const id = this._parseId(rowId);
      const rowData = this.data.find((r) => r.id === id);

      if (rowData) {
        this.emit<TableRowClickEventDetail>('row-click', {
          row: rowData,
          rowIndex,
        });

        // Toggle selection on row click
        if (this.selectionMode !== 'none') {
          this.toggleRowSelection(id);
        }
      }
    }
  };

  private _handleRowSelectChange = (e: Event): void => {
    const input = e.target as HTMLInputElement;
    const rowId = input.getAttribute('data-row-id');

    if (rowId !== null) {
      const id = this._parseId(rowId);
      if (input.checked) {
        this.selectRow(id);
      } else {
        this.deselectRow(id);
      }
    }
  };

  private _handleSelectAllChange = (e: Event): void => {
    const input = e.target as HTMLInputElement;
    if (input.checked) {
      this.selectAll();
    } else {
      this.deselectAll();
    }
  };

  private _parseId(idStr: string): string | number {
    const num = Number(idStr);
    return isNaN(num) ? idStr : num;
  }

  /** Select a row by ID */
  selectRow(id: string | number): void {
    if (this.selectionMode === 'single') {
      this._internalSelectedIds.clear();
    }
    this._internalSelectedIds.add(id);
    this._emitSelectionChange();
  }

  /** Deselect a row by ID */
  deselectRow(id: string | number): void {
    this._internalSelectedIds.delete(id);
    this._emitSelectionChange();
  }

  /** Toggle row selection */
  toggleRowSelection(id: string | number): void {
    if (this._internalSelectedIds.has(id)) {
      this.deselectRow(id);
    } else {
      this.selectRow(id);
    }
  }

  /** Select all visible rows */
  selectAll(): void {
    const visibleData = this._getProcessedData();
    visibleData.forEach((row) => this._internalSelectedIds.add(row.id));
    this._emitSelectionChange();
  }

  /** Deselect all rows */
  deselectAll(): void {
    this._internalSelectedIds.clear();
    this._emitSelectionChange();
  }

  /** Get currently selected rows */
  getSelectedRows(): TableRow[] {
    return this.data.filter((row) => this._internalSelectedIds.has(row.id));
  }

  private _emitSelectionChange(): void {
    this.selectedIds = Array.from(this._internalSelectedIds);
    this.emit<TableSelectEventDetail>('select', {
      selectedIds: this.selectedIds,
      selectedRows: this.getSelectedRows(),
    });
    this.update();
  }

  private _isRowSelected(row: TableRow): boolean {
    return this._internalSelectedIds.has(row.id);
  }

  private _isAllSelected(): boolean {
    const visibleData = this._getProcessedData();
    if (visibleData.length === 0) return false;
    return visibleData.every((row) => this._internalSelectedIds.has(row.id));
  }

  private _isSomeSelected(): boolean {
    const visibleData = this._getProcessedData();
    return (
      visibleData.some((row) => this._internalSelectedIds.has(row.id)) && !this._isAllSelected()
    );
  }

  // ============ Data Processing ============

  private _getEffectiveColumns(): TableColumn[] {
    // First check for columns prop
    if (this.columns && this.columns.length > 0) {
      return this.columns.filter((col) => !col.hidden);
    }

    // Fall back to child <el-dm-table-column> elements
    const columnElements = this.querySelectorAll('el-dm-table-column');
    const cols: TableColumn[] = [];

    columnElements.forEach((el) => {
      if (el instanceof ElDmTableColumn) {
        const colDef = el.toColumnDef();
        if (!colDef.hidden) {
          cols.push(colDef);
        }
      }
    });

    return cols;
  }

  private _getProcessedData(): TableRow[] {
    let result = [...(this.data || [])];
    result = this._sortData(result);
    result = this._paginateData(result);
    return result;
  }

  /** Get visible (processed) data */
  getVisibleData(): TableRow[] {
    return this._getProcessedData();
  }

  /** Refresh the table */
  refresh(): void {
    this.update();
  }

  // ============ Rendering ============

  private _formatCellValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) return value.toLocaleDateString();
    return String(value);
  }

  private _renderHeaderCell(column: TableColumn): string {
    const sortable = column.sortable;
    const isSorted = this.sortColumn === column.key;
    const sortIcon = isSorted
      ? this.sortDirection === 'asc'
        ? ICONS.sortAsc
        : ICONS.sortDesc
      : ICONS.sort;

    return `
      <th
        class="table-th ${sortable ? 'sortable' : ''} ${isSorted ? 'sorted' : ''}"
        part="th"
        data-column="${column.key}"
        style="text-align: ${column.align || 'left'}; ${column.width ? `width: ${column.width};` : ''}"
        scope="col"
        ${sortable ? `role="columnheader" aria-sort="${isSorted ? (this.sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}" tabindex="0"` : ''}
      >
        <span class="th-content">
          <span>${column.label}</span>
          ${sortable ? `<span class="sort-icon">${sortIcon}</span>` : ''}
        </span>
      </th>
    `;
  }

  private _renderSelectAllCell(): string {
    if (this.selectionMode !== 'multiple') {
      return '<th class="table-th select-cell" part="th"></th>';
    }

    const isAllSelected = this._isAllSelected();
    const isSomeSelected = this._isSomeSelected();

    return `
      <th class="table-th select-cell" part="th">
        <input
          type="checkbox"
          class="select-all"
          ${isAllSelected ? 'checked' : ''}
          ${isSomeSelected ? 'data-indeterminate="true"' : ''}
          aria-label="Select all rows"
        />
      </th>
    `;
  }

  private _renderSelectCell(row: TableRow): string {
    const isSelected = this._isRowSelected(row);
    const inputType = this.selectionMode === 'single' ? 'radio' : 'checkbox';

    return `
      <td class="table-td select-cell" part="td">
        <input
          type="${inputType}"
          class="row-select"
          name="table-selection"
          data-row-id="${row.id}"
          ${isSelected ? 'checked' : ''}
          aria-label="Select row"
        />
      </td>
    `;
  }

  private _renderDataRow(row: TableRow, index: number, columns: TableColumn[]): string {
    const isSelected = this._isRowSelected(row);
    const showSelectionColumn = this.selectionMode !== 'none';

    return `
      <tr
        class="table-row ${isSelected ? 'selected' : ''}"
        part="row"
        data-row-id="${row.id}"
        data-row-index="${index}"
        ${isSelected ? 'aria-selected="true"' : ''}
      >
        ${showSelectionColumn ? this._renderSelectCell(row) : ''}
        ${columns
          .map(
            (col) => `
          <td
            class="table-td"
            part="td"
            style="text-align: ${col.align || 'left'};"
          >
            ${this._formatCellValue(row[col.key])}
          </td>
        `,
          )
          .join('')}
      </tr>
    `;
  }

  private _renderLoadingRow(colCount: number): string {
    const totalCols = this.selectionMode !== 'none' ? colCount + 1 : colCount;
    return `
      <tr class="loading-row">
        <td colspan="${totalCols}">
          <div class="loading-spinner"></div>
          <div>Loading...</div>
        </td>
      </tr>
    `;
  }

  private _renderEmptyRow(colCount: number): string {
    const totalCols = this.selectionMode !== 'none' ? colCount + 1 : colCount;
    return `
      <tr class="empty-row">
        <td colspan="${totalCols}">
          <slot name="empty">${this.emptyMessage}</slot>
        </td>
      </tr>
    `;
  }

  private _renderPagination(): string {
    const totalPages = this._getTotalPages();
    const showPageSizeSelect = this.pageSizeOptions && this.pageSizeOptions.length > 0;

    return `
      <div class="table-pagination" part="pagination">
        <div class="pagination-info">
          Showing ${this._getStartRow()} to ${this._getEndRow()} of ${this.data.length} entries
        </div>
        <div class="pagination-controls">
          ${
            showPageSizeSelect
              ? `
            <select class="page-size-select" aria-label="Rows per page">
              ${this.pageSizeOptions
                .map(
                  (size) => `
                <option value="${size}" ${size === this.pageSize ? 'selected' : ''}>
                  ${size} / page
                </option>
              `,
                )
                .join('')}
            </select>
          `
              : ''
          }
          <div class="pagination-nav">
            <button
              class="pagination-btn"
              data-action="first"
              ${this.page <= 1 ? 'disabled' : ''}
              aria-label="First page"
            >${ICONS.chevronFirst}</button>
            <button
              class="pagination-btn"
              data-action="prev"
              ${this.page <= 1 ? 'disabled' : ''}
              aria-label="Previous page"
            >${ICONS.chevronLeft}</button>
            <span class="pagination-current">
              Page ${this.page} of ${totalPages}
            </span>
            <button
              class="pagination-btn"
              data-action="next"
              ${this.page >= totalPages ? 'disabled' : ''}
              aria-label="Next page"
            >${ICONS.chevronRight}</button>
            <button
              class="pagination-btn"
              data-action="last"
              ${this.page >= totalPages ? 'disabled' : ''}
              aria-label="Last page"
            >${ICONS.chevronLast}</button>
          </div>
        </div>
      </div>
    `;
  }

  protected render(): string {
    const columns = this._getEffectiveColumns();
    const processedData = this._getProcessedData();
    const showSelectionColumn = this.selectionMode !== 'none';

    return `
      <div class="table-wrapper" part="wrapper">
        <div class="table-header-actions" part="header-actions">
          <slot name="header-actions"></slot>
        </div>

        <div class="table-container" part="container">
          <table class="table" part="table" role="grid" aria-busy="${this.loading}">
            <thead part="thead">
              <tr part="header-row">
                ${showSelectionColumn ? this._renderSelectAllCell() : ''}
                ${columns.map((col) => this._renderHeaderCell(col)).join('')}
              </tr>
            </thead>
            <tbody part="tbody">
              ${this.loading ? this._renderLoadingRow(columns.length) : ''}
              ${!this.loading && processedData.length === 0 ? this._renderEmptyRow(columns.length) : ''}
              ${!this.loading ? processedData.map((row, idx) => this._renderDataRow(row, idx, columns)).join('') : ''}
            </tbody>
          </table>
        </div>

        ${this.paginated ? this._renderPagination() : ''}

        <div class="table-footer-actions" part="footer-actions">
          <slot name="footer-actions"></slot>
        </div>
      </div>
    `;
  }
}

export function registerTable(): void {
  if (!customElements.get('el-dm-table')) {
    customElements.define('el-dm-table', ElDmTable);
  }
}
