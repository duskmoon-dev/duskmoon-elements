/**
 * ElDmProDataGrid — Enterprise-grade data grid web component.
 *
 * Phase 1: Virtual scrolling, sort, basic rendering, keyboard nav, ARIA.
 * Phase 2: Filtering, selection manager, pagination, column resize.
 * Phase 3: Floating filters, quick filter, column menu, filter debouncing.
 * Phase 4: Inline cell editing, undo/redo, validation, Tab navigation.
 * Phase 5: Row grouping, aggregation, pivoting.
 * Phase 6: Tree data, row expanding.
 * Phase 7: Cell selection, clipboard, export.
 * Phase 8: Accessories (context menu, status bar, find bar, sparklines).
 */

import { BaseElement } from '@duskmoon-dev/el-core';
import { VirtualScroller } from './core/virtual-scroller.js';
import { SortEngine } from './core/sort-engine.js';
import { FilterEngine } from './core/filter-engine.js';
import { QuickFilter } from './core/quick-filter.js';
import { ColumnController } from './core/column-controller.js';
import { SelectionManager } from './core/selection-manager.js';
import { ColumnMenu, type ColumnMenuAction } from './core/column-menu.js';
import { CellEditor } from './core/cell-editor.js';
import { UndoRedoManager } from './core/undo-redo.js';
import { RowGrouping, type RowNode } from './core/row-grouping.js';
import { RowPivot } from './core/row-pivot.js';
import { TreeData } from './core/tree-data.js';
import { RowExpander } from './core/row-expander.js';
import { CellSelection } from './core/cell-selection.js';
import { ClipboardService } from './core/clipboard-service.js';
import { DataExport } from './core/data-export.js';
import type { CsvExportParams, JsonExportParams, ExcelExportParams } from './core/data-export.js';
import { ContextMenu } from './core/context-menu.js';
import { StatusBar } from './core/status-bar.js';
import { FindBar } from './core/find-bar.js';
import { Sparkline } from './core/sparkline.js';
import { Pagination } from './core/pagination.js';
import { KeyboardNav, type GridPosition } from './core/keyboard-nav.js';
import { FocusManager } from './core/focus-manager.js';
import { gridStyles } from './styles/grid.css.js';
import { headerStyles } from './styles/header.css.js';
import { cellStyles } from './styles/cells.css.js';
import { paginationStyles } from './styles/pagination.css.js';
import { columnMenuStyles } from './styles/column-menu.css.js';
import { editorStyles } from './styles/editor.css.js';
import { groupingStyles } from './styles/grouping.css.js';
import { treeExpandStyles } from './styles/tree-expand.css.js';
import { selectionStyles } from './styles/selection.css.js';
import { accessoryStyles } from './styles/accessories.css.js';
import type {
  Row,
  ColumnDef,
  SortItem,
  FilterModel,
  CellChange,
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
    quickFilterText: { type: String, reflect: true, attribute: 'quick-filter-text', default: '' },
    floatingFilter: { type: Boolean, reflect: true, attribute: 'floating-filter', default: false },
    filterDebounceMs: {
      type: Number,
      reflect: true,
      attribute: 'filter-debounce-ms',
      default: 300,
    },
    enableRowGrouping: {
      type: Boolean,
      reflect: true,
      attribute: 'enable-row-grouping',
      default: false,
    },
    groupDefaultExpanded: {
      type: Number,
      reflect: true,
      attribute: 'group-default-expanded',
      default: 0,
    },
    showGroupPanel: {
      type: Boolean,
      reflect: true,
      attribute: 'show-group-panel',
      default: false,
    },
    enablePivoting: {
      type: Boolean,
      reflect: true,
      attribute: 'enable-pivoting',
      default: false,
    },
    pivotMode: { type: Boolean, reflect: true, attribute: 'pivot-mode', default: false },
    treeData: { type: Boolean, reflect: true, attribute: 'tree-data', default: false },
    treeDataChildField: {
      type: String,
      reflect: true,
      attribute: 'tree-data-child-field',
      default: 'children',
    },
    rowExpandable: { type: Boolean, reflect: true, attribute: 'row-expandable', default: false },
    rowExpandMultiple: {
      type: Boolean,
      reflect: true,
      attribute: 'row-expand-multiple',
      default: true,
    },
    expandOnRowClick: {
      type: Boolean,
      reflect: true,
      attribute: 'expand-on-row-click',
      default: false,
    },
    cellSelection: {
      type: Boolean,
      reflect: true,
      attribute: 'cell-selection',
      default: false,
    },
    fillHandle: { type: Boolean, reflect: true, attribute: 'fill-handle', default: false },
    suppressClipboardPaste: {
      type: Boolean,
      reflect: true,
      attribute: 'suppress-clipboard-paste',
      default: false,
    },
  };

  // ─── Private State ───────────────────────────

  #data: Row[] = [];
  #columns: ColumnDef[] = [];
  #sortModel: SortItem[] = [];
  #filterModel: Record<string, FilterModel> = {};
  #processedRows: Row[] = [];
  #paginatedRows: Row[] = [];
  #displayNodes: RowNode[] = [];

  // ─── Core Engines ────────────────────────────

  #scroller: VirtualScroller;
  #sortEngine = new SortEngine();
  #filterEngine = new FilterEngine();
  #quickFilter = new QuickFilter();
  #columnController = new ColumnController();
  #selectionManager = new SelectionManager();
  #columnMenu = new ColumnMenu();
  #cellEditor = new CellEditor();
  #undoRedo = new UndoRedoManager();
  #rowGrouping = new RowGrouping();
  #rowPivot = new RowPivot();
  #treeData = new TreeData();
  #rowExpander = new RowExpander();
  #cellSelection = new CellSelection();
  #clipboardService = new ClipboardService();
  #dataExport = new DataExport();
  #contextMenu = new ContextMenu();
  #statusBar = new StatusBar();
  #findBar = new FindBar();
  #sparkline = new Sparkline();
  #pagination = new Pagination();
  #keyboardNav: KeyboardNav;
  #focusManager = new FocusManager();

  // ─── DOM References ──────────────────────────

  #viewport: HTMLElement | null = null;
  #scrollContainer: HTMLElement | null = null;
  #body: HTMLElement | null = null;
  #headerRow: HTMLElement | null = null;
  #paginationEl: HTMLElement | null = null;
  #resizeObserver: ResizeObserver | null = null;
  #animFrameId: number | null = null;
  #isRendering = false;
  #floatingFilterRow: HTMLElement | null = null;
  #quickFilterBar: HTMLElement | null = null;
  #resizingColumn: string | null = null;
  #resizeStartX = 0;
  #resizeStartWidth = 0;
  #filterDebounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
  #quickFilterDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    super();
    this.attachStyles([
      gridStyles,
      headerStyles,
      cellStyles,
      paginationStyles,
      columnMenuStyles,
      editorStyles,
      groupingStyles,
      treeExpandStyles,
      selectionStyles,
      accessoryStyles,
    ]);

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
    return this.#selectionManager.getSelectedRows(this.#processedRows);
  }

  // ─── Public Methods ──────────────────────────

  setQuickFilterText(text: string): void {
    this.#quickFilter.text = text;
    this.#processData();
    this.#renderContent();
    this.emit('quick-filter-change', { text });
  }

  getQuickFilterText(): string {
    return this.#quickFilter.text;
  }

  scrollToRow(index: number): void {
    if (!this.#viewport) return;
    const top = this.#scroller.getScrollTopForRow(index);
    this.#viewport.scrollTop = top;
  }

  selectAll(): void {
    const { added } = this.#selectionManager.selectAll(this.#processedRows);
    this.#renderContent();
    this.emit('selection-change', {
      selectedRows: this.selectedRows,
      added,
      removed: [],
    });
  }

  deselectAll(): void {
    const { removed } = this.#selectionManager.deselectAll(this.#processedRows);
    this.#renderContent();
    this.emit('selection-change', {
      selectedRows: [],
      added: [],
      removed,
    });
  }

  setColumnVisible(field: string, visible: boolean): void {
    this.#columnController.setColumnVisible(field, visible);
    this.#renderContent();
    this.emit('column-visible', { field, visible });
  }

  moveColumn(field: string, toIndex: number): void {
    const fromIndex = this.#columnController.visibleColumns.findIndex((c) => c.def.field === field);
    this.#columnController.moveColumn(field, toIndex);
    this.#renderContent();
    this.emit('column-move', { field, fromIndex, toIndex });
  }

  pinColumn(field: string, pinned: 'left' | 'right' | false): void {
    // Pin column support will be fully implemented in Phase 3
    this.emit('column-pinned', { field, pinned });
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

  // ─── Editing API ──────────────────────────

  startEditingCell(rowIndex: number, field: string, keyChar?: string): void {
    const row = this.#paginatedRows[rowIndex];
    const colState = this.#columnController.getColumn(field);
    if (!row || !colState) return;
    const state = this.#cellEditor.startEditing(row, rowIndex, colState.def, keyChar);
    if (state) {
      this.emit('cell-edit-start', { rowIndex, field, value: state.originalValue });
      this.#renderRows();
    }
  }

  stopEditingCell(cancel = false): void {
    const change = this.#cellEditor.stopEditing(cancel);
    if (change) {
      this.#applyCellChange(change);
    }
    this.#renderRows();
  }

  undo(): CellChange | null {
    const change = this.#undoRedo.undo();
    if (change) {
      this.#applyCellChange(change, false);
      this.emit('undo-redo', { type: 'undo', change });
    }
    return change;
  }

  redo(): CellChange | null {
    const change = this.#undoRedo.redo();
    if (change) {
      this.#applyCellChange(change, false);
      this.emit('undo-redo', { type: 'redo', change });
    }
    return change;
  }

  // ─── Grouping & Pivoting API ─────────────

  get rowGroupColumns(): string[] {
    return this.#rowGrouping.groupColumns;
  }

  set rowGroupColumns(value: string[]) {
    this.#rowGrouping.groupColumns = value;
    this.#rowGrouping.buildAggColumnsFromDefs(this.#columns);
    this.#processData();
    this.#renderContent();
    this.emit('group-change', { groupColumns: value });
  }

  setRowGroupColumns(fields: string[]): void {
    this.rowGroupColumns = fields;
  }

  setPivotColumns(fields: string[]): void {
    this.#rowPivot.pivotColumns = fields;
    this.#processData();
    this.#renderContent();
    this.emit('pivot-change', { pivotColumns: fields });
  }

  setPivotMode(enabled: boolean): void {
    (this as unknown as { pivotMode: boolean }).pivotMode = enabled;
    this.#processData();
    this.#renderContent();
  }

  expandAll(depth = -1): void {
    this.#rowGrouping.expandAll(depth);
    this.#processData();
    this.#renderContent();
  }

  collapseAll(): void {
    this.#rowGrouping.collapseAll();
    this.#processData();
    this.#renderContent();
  }

  expandGroup(keyPath: string): void {
    this.#rowGrouping.expandGroup(keyPath);
    this.#processData();
    this.#renderContent();
  }

  collapseGroup(keyPath: string): void {
    this.#rowGrouping.collapseGroup(keyPath);
    this.#processData();
    this.#renderContent();
  }

  // ─── Row Expanding API ──────────────────

  expandRow(rowId: string): void {
    const row = this.#findRowById(rowId);
    if (row && this.#rowExpander.expandRow(row)) {
      this.emit('row-expanded', { rowId, row });
      this.#renderContent();
    }
  }

  collapseRow(rowId: string): void {
    const row = this.#findRowById(rowId);
    if (row && this.#rowExpander.collapseRow(row)) {
      this.emit('row-collapsed', { rowId, row });
      this.#renderContent();
    }
  }

  toggleRowExpand(rowId: string): void {
    const row = this.#findRowById(rowId);
    if (!row) return;
    const expanded = this.#rowExpander.toggleRow(row);
    this.emit(expanded ? 'row-expanded' : 'row-collapsed', { rowId, row });
    this.#renderContent();
  }

  expandAllRows(): void {
    this.#rowExpander.expandAllRows(this.#processedRows);
    this.#renderContent();
  }

  collapseAllRows(): void {
    this.#rowExpander.collapseAllRows();
    this.#renderContent();
  }

  isRowExpanded(rowId: string): boolean {
    const row = this.#findRowById(rowId);
    return row ? this.#rowExpander.isExpanded(row) : false;
  }

  getExpandedRows(): string[] {
    return this.#rowExpander.expandedIds;
  }

  #findRowById(rowId: string): Row | undefined {
    const rowKey = (this as unknown as { rowKey: string }).rowKey ?? 'id';
    return this.#processedRows.find((r) => String(r[rowKey]) === rowId);
  }

  // ─── Phase 7: Cell Selection API ─────────────

  get cellSelections() {
    return this.#cellSelection.ranges;
  }

  selectCellRange(params: { rowStartIndex: number; rowEndIndex: number; columns: string[] }): void {
    this.#cellSelection.selectRange(params);
    this.emit('cell-selection-change', { ranges: this.#cellSelection.ranges });
  }

  getCellRanges() {
    return this.#cellSelection.ranges;
  }

  clearCellSelections(): void {
    this.#cellSelection.clearSelections();
    this.emit('cell-selection-change', { ranges: [] });
  }

  // ─── Phase 7: Export API ────────────────────

  exportCsv(params?: CsvExportParams): void {
    const rows = params?.selectedOnly ? this.selectedRows : this.#processedRows;
    const cols = this.#columnController.visibleColumns.map((c) => c.def);
    this.#dataExport.exportCsv(rows, cols, params);
  }

  getDataAsCsv(params?: CsvExportParams): string {
    const rows = params?.selectedOnly ? this.selectedRows : this.#processedRows;
    const cols = this.#columnController.visibleColumns.map((c) => c.def);
    return this.#dataExport.getDataAsCsv(rows, cols, params);
  }

  exportJson(params?: JsonExportParams): void {
    const rows = params?.selectedOnly ? this.selectedRows : this.#processedRows;
    const cols = this.#columnController.visibleColumns.map((c) => c.def);
    this.#dataExport.exportJson(rows, cols, params);
  }

  getDataAsJson(params?: JsonExportParams): string {
    const rows = params?.selectedOnly ? this.selectedRows : this.#processedRows;
    const cols = this.#columnController.visibleColumns.map((c) => c.def);
    return this.#dataExport.getDataAsJson(rows, cols, params);
  }

  exportExcel(params?: ExcelExportParams): void {
    const rows = params?.selectedOnly ? this.selectedRows : this.#processedRows;
    const cols = this.#columnController.visibleColumns.map((c) => c.def);
    this.#dataExport.exportExcel(rows, cols, params);
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
    this.#columnMenu.close();
    for (const timer of this.#filterDebounceTimers.values()) clearTimeout(timer);
    this.#filterDebounceTimers.clear();
    if (this.#quickFilterDebounceTimer) clearTimeout(this.#quickFilterDebounceTimer);
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

    // Header click for sorting and menu
    this.#headerRow?.addEventListener('click', (e) => {
      // Ignore clicks on resize handle
      if ((e.target as HTMLElement).classList.contains('grid-resize-handle')) return;

      // Handle menu button click
      const menuBtn = (e.target as HTMLElement).closest('[data-menu-field]') as HTMLElement | null;
      if (menuBtn) {
        e.stopPropagation();
        this.#openColumnMenu(menuBtn.dataset.menuField!, menuBtn);
        return;
      }

      const target = (e.target as HTMLElement).closest('[data-field]') as HTMLElement | null;
      if (!target) return;
      const field = target.dataset.field;
      const sortable = target.hasAttribute('data-sortable');
      if (!field || !sortable) return;

      const multiSort = (e as MouseEvent).shiftKey;
      this.sortModel = this.#sortEngine.updateSortModel(this.#sortModel, field, multiSort);
    });

    // Column resize via drag handle
    this.#headerRow?.addEventListener('mousedown', (e) => {
      const handle = (e.target as HTMLElement).closest('.grid-resize-handle');
      if (!handle) return;
      e.preventDefault();
      const headerCell = handle.closest('[data-field]') as HTMLElement | null;
      if (!headerCell?.dataset.field) return;
      this.#startResize(headerCell.dataset.field, (e as MouseEvent).clientX);
    });

    // Row/cell click
    this.#body?.addEventListener('click', (e) => {
      // Don't process clicks on editor elements
      if ((e.target as HTMLElement).closest('[data-editor]')) return;

      // Handle group row expand/collapse
      const groupRow = (e.target as HTMLElement).closest('[data-group-key]') as HTMLElement | null;
      if (groupRow) {
        const keyPath = groupRow.dataset.groupKey ?? '';
        if (keyPath) {
          const expanded = this.#rowGrouping.toggleGroup(keyPath);
          this.#processData();
          this.#renderContent();
          this.emit('group-toggle', { keyPath, expanded });
        }
        return;
      }

      const cell = (e.target as HTMLElement).closest('[data-grid-cell]') as HTMLElement | null;
      if (!cell) return;

      const rowIndex = Number(cell.dataset.rowIndex);
      const colIndex = Number(cell.dataset.colIndex);
      const field = cell.dataset.field ?? '';
      const row = this.#paginatedRows[rowIndex];
      if (!row) return;

      // Stop any current edit
      if (this.#cellEditor.isEditing) {
        this.stopEditingCell();
      }

      // Emit cell-click
      this.emit('cell-click', { row, field, value: row[field], rowIndex });

      // Single-click edit mode
      const editable = (this as unknown as { editable: boolean }).editable;
      if (editable && this.#cellEditor.options.singleClickEdit) {
        this.startEditingCell(rowIndex, field);
      }

      // Handle selection
      this.#handleRowSelection(row, rowIndex, e as MouseEvent);

      // Update keyboard position
      this.#keyboardNav.position = { rowIndex, colIndex };
      this.#focusManager.focusCell(rowIndex, colIndex);
    });

    // Double-click to start editing
    this.#body?.addEventListener('dblclick', (e) => {
      const cell = (e.target as HTMLElement).closest('[data-grid-cell]') as HTMLElement | null;
      if (!cell) return;

      const rowIndex = Number(cell.dataset.rowIndex);
      const field = cell.dataset.field ?? '';
      const editable = (this as unknown as { editable: boolean }).editable;
      if (editable) {
        this.startEditingCell(rowIndex, field);
        // Focus the editor input after rendering
        requestAnimationFrame(() => {
          const editor = this.shadowRoot.querySelector('[data-editor]') as HTMLElement | null;
          editor?.focus();
        });
      }
    });

    // Handle editor keydown (Enter to commit, Escape to cancel, Tab to move)
    this.#body?.addEventListener('keydown', (e) => {
      if (!this.#cellEditor.isEditing) return;
      const event = e as KeyboardEvent;

      if (event.key === 'Enter') {
        event.preventDefault();
        this.stopEditingCell();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        this.stopEditingCell(true);
      } else if (event.key === 'Tab') {
        event.preventDefault();
        const state = this.#cellEditor.editingState;
        if (!state) return;

        // Commit current edit
        this.stopEditingCell();

        // Find next editable cell
        const visible = this.#columnController.visibleColumns;
        const colIdx = visible.findIndex((c) => c.def.field === state.field);
        const next = this.#cellEditor.findNextEditableCell(
          state.rowIndex,
          colIdx,
          visible.map((c) => c.def),
          this.#paginatedRows,
          event.shiftKey ? 'backward' : 'forward',
        );

        if (next) {
          const nextField = visible[next.colIndex]?.def.field;
          if (nextField) {
            this.startEditingCell(next.rowIndex, nextField);
            requestAnimationFrame(() => {
              const editor = this.shadowRoot.querySelector('[data-editor]') as HTMLElement | null;
              editor?.focus();
            });
          }
        }
      }
    });

    // Handle editor input changes
    this.#body?.addEventListener('input', (e) => {
      const editor = (e.target as HTMLElement).closest('[data-editor]') as
        | HTMLInputElement
        | HTMLSelectElement
        | null;
      if (!editor || !this.#cellEditor.isEditing) return;

      if (editor instanceof HTMLInputElement && editor.type === 'checkbox') {
        this.#cellEditor.setValue(editor.checked);
      } else {
        this.#cellEditor.setValue(editor.value);
      }

      // Validate in real-time
      const state = this.#cellEditor.editingState;
      if (state) {
        const row = this.#paginatedRows[state.rowIndex];
        const colState = this.#columnController.getColumn(state.field);
        if (row && colState) {
          this.#cellEditor.validate(row, colState.def);
        }
      }
    });

    // Group panel chip removal
    this.shadowRoot?.addEventListener('click', (e) => {
      const removeBtn = (e.target as HTMLElement).closest(
        '[data-remove-group]',
      ) as HTMLElement | null;
      if (removeBtn) {
        const field = removeBtn.dataset.removeGroup!;
        const newCols = this.#rowGrouping.groupColumns.filter((f) => f !== field);
        this.rowGroupColumns = newCols;
      }
    });

    // Undo/Redo keyboard shortcut (Ctrl+Z / Ctrl+Shift+Z)
    this.addEventListener('keydown', (e) => {
      const event = e as KeyboardEvent;
      if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          this.redo();
        } else {
          this.undo();
        }
      }
    });
  }

  // ─── Private: Data Processing ────────────────

  #processData(): void {
    let rows = [...this.#data];
    const colDefs = this.#columnController.columns.map((c) => c.def);

    // Apply quick filter (global search)
    const filterMode = (this as unknown as { filterMode: string }).filterMode ?? 'client';
    if (filterMode === 'client' && this.#quickFilter.text.trim()) {
      rows = this.#quickFilter.filter(rows, colDefs);
    }

    // Apply column-level client-side filter
    if (filterMode === 'client' && Object.keys(this.#filterModel).length > 0) {
      rows = this.#filterEngine.filter(rows, this.#filterModel, colDefs);
    }

    // Apply client-side sort
    const sortMode = (this as unknown as { sortMode: string }).sortMode ?? 'client';
    if (sortMode === 'client' && this.#sortModel.length > 0) {
      rows = this.#sortEngine.sort(rows, this.#sortModel, colDefs);
    }

    this.#processedRows = rows;

    // Apply row grouping
    const enableGrouping = (this as unknown as { enableRowGrouping: boolean }).enableRowGrouping;
    if (enableGrouping && this.#rowGrouping.isGrouped) {
      this.#rowGrouping.groupDefaultExpanded =
        (this as unknown as { groupDefaultExpanded: number }).groupDefaultExpanded ?? 0;
      this.#rowGrouping.buildAggColumnsFromDefs(colDefs);
      this.#displayNodes = this.#rowGrouping.group(rows);
      // For pagination and scrolling, use the flat display list length
      rows = this.#displayNodes.map((n) => n.data);
    } else {
      this.#displayNodes = [];
    }

    // Apply pagination
    const pageSize = (this as unknown as { pageSize: number }).pageSize ?? 0;
    if (pageSize > 0) {
      this.#pagination.pageSize = pageSize;
      this.#pagination.totalRows = rows.length;
      this.#paginatedRows = this.#pagination.getPageRows(rows);
      this.#scroller.totalRows = this.#paginatedRows.length;
    } else {
      this.#paginatedRows = rows;
      this.#scroller.totalRows = rows.length;
    }

    // Sync selection manager
    this.#selectionManager.mode =
      ((this as unknown as { selectionMode: string }).selectionMode as
        | 'none'
        | 'single'
        | 'multiple') ?? 'none';
    this.#selectionManager.rowKey = (this as unknown as { rowKey: string }).rowKey ?? 'id';

    this.#keyboardNav.updateBounds(
      this.#paginatedRows.length,
      this.#columnController.visibleColumns.length,
    );
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
      this.#renderGroupPanel();
      this.#renderQuickFilterBar();
      this.#renderHeader();
      this.#renderFloatingFilterRow();
      this.#renderRows();
      this.#renderPagination();
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
            <button class="grid-header-menu-btn" data-menu-field="${col.def.field}" aria-label="Column menu">☰</button>
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
    const displayRows = this.#paginatedRows;
    const hasGrouping = this.#displayNodes.length > 0;

    // Set container height for scrollbar
    this.#scrollContainer.style.height = `${this.#scroller.totalContentHeight}px`;

    // Position body at the correct offset
    this.#body.style.transform = `translateY(${startOffset}px)`;

    // Build rows HTML
    const rowsHtml: string[] = [];
    for (let i = startIndex; i <= endIndex && i < displayRows.length; i++) {
      if (hasGrouping && this.#displayNodes[i]) {
        const node = this.#displayNodes[i];
        if (node.group) {
          rowsHtml.push(this.#renderGroupRow(node, i, visible, rowHeight));
          continue;
        }
      }
      const row = displayRows[i];
      const isSelected = this.#selectionManager.isSelected(row);
      rowsHtml.push(this.#renderRow(row, i, visible, rowHeight, isSelected));
    }

    this.#body.innerHTML = rowsHtml.join('');
  }

  #renderGroupRow(
    node: RowNode,
    rowIndex: number,
    columns: ColumnStateInternal[],
    rowHeight: number,
  ): string {
    const indent = node.level * 28;
    const chevron = node.expanded ? '▶' : '▶';
    const childCount = node.allLeafChildren.length;
    const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);

    // Build aggregation summary
    let aggHtml = '';
    if (Object.keys(node.aggData).length > 0) {
      const aggParts = Object.entries(node.aggData)
        .map(([field, value]) => {
          const formatted = value == null ? '' : String(value);
          return `<span class="grid-group-agg-value">${this.#escapeHtml(field)}: ${this.#escapeHtml(formatted)}</span>`;
        })
        .join('');
      aggHtml = `<span class="grid-group-agg">${aggParts}</span>`;
    }

    return `
      <div class="grid-row" role="row"
           data-group
           data-row-index="${rowIndex}"
           data-group-key="${this.#escapeHtml(node.id)}"
           data-group-level="${node.level}"
           aria-rowindex="${rowIndex + 1}"
           aria-expanded="${node.expanded}">
        <div class="grid-group-cell" style="width:${totalWidth}px;height:${rowHeight}px">
          <span class="grid-group-indent" style="width:${indent}px"></span>
          <span class="grid-group-chevron" ${node.expanded ? 'data-expanded' : ''}>${chevron}</span>
          <span class="grid-group-key">${this.#escapeHtml(node.key)}</span>
          <span class="grid-group-count">(${childCount})</span>
          ${aggHtml}
        </div>
      </div>
    `;
  }

  #renderGroupPanel(): void {
    const showPanel = (this as unknown as { showGroupPanel: boolean }).showGroupPanel;
    const root = this.shadowRoot;
    if (!root) return;

    let panel = root.querySelector('.grid-group-panel') as HTMLElement | null;

    if (!showPanel) {
      if (panel) panel.remove();
      return;
    }

    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'grid-group-panel';
      // Insert before viewport
      const viewport = root.querySelector('.grid-viewport');
      if (viewport) {
        viewport.parentNode?.insertBefore(panel, viewport);
      }
    }

    const groupCols = this.#rowGrouping.groupColumns;
    if (groupCols.length === 0) {
      panel.innerHTML =
        '<span class="grid-group-panel-placeholder">Drag columns here to group</span>';
    } else {
      panel.innerHTML = groupCols
        .map(
          (field) =>
            `<span class="grid-group-chip">
              ${this.#escapeHtml(field)}
              <button class="grid-group-chip-remove" data-remove-group="${field}" aria-label="Remove group">&times;</button>
            </span>`,
        )
        .join('');
    }
  }

  #renderRow(
    row: Row,
    rowIndex: number,
    columns: ColumnStateInternal[],
    rowHeight: number,
    isSelected: boolean,
  ): string {
    const editState = this.#cellEditor.editingState;
    const cells = columns
      .map((col, colIndex) => {
        const isEditingThis =
          editState?.rowIndex === rowIndex && editState?.field === col.def.field;
        const value = row[col.def.field];

        let cellContent: string;
        let editAttrs = '';
        if (isEditingThis) {
          cellContent = this.#cellEditor.renderEditor(col.def);
          editAttrs = 'data-editing';
          if (!editState.isValid) editAttrs += ' data-invalid';
        } else {
          cellContent = this.#renderCellContent(value, row, col.def, rowIndex);
        }

        return `
          <div class="grid-cell"
               role="gridcell"
               data-grid-cell
               data-row-index="${rowIndex}"
               data-col-index="${colIndex}"
               data-field="${col.def.field}"
               ${editAttrs}
               ${col.def.align ? `data-align="${col.def.align}"` : ''}
               style="width:${col.width}px;height:${rowHeight}px"
               tabindex="-1"
               aria-readonly="${isEditingThis ? 'false' : 'true'}">
            ${isEditingThis ? cellContent : `<span class="grid-cell-content">${cellContent}</span>`}
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

  #handleRowSelection(row: Row, rowIndex: number, event: MouseEvent): void {
    const { added, removed } = this.#selectionManager.handleClick(
      row,
      rowIndex,
      this.#paginatedRows,
      event.shiftKey,
      event.ctrlKey || event.metaKey,
    );

    if (added.length > 0 || removed.length > 0) {
      this.#renderRows();
      this.emit('selection-change', {
        selectedRows: this.selectedRows,
        added,
        removed,
      });
    }
  }

  // ─── Private: Column Resize ─────────────────

  #startResize(field: string, startX: number): void {
    const col = this.#columnController.getColumn(field);
    if (!col) return;

    this.#resizingColumn = field;
    this.#resizeStartX = startX;
    this.#resizeStartWidth = col.width;

    const onMouseMove = (e: MouseEvent) => {
      if (!this.#resizingColumn) return;
      const delta = e.clientX - this.#resizeStartX;
      this.#columnController.resizeColumn(this.#resizingColumn, this.#resizeStartWidth + delta);
      this.#renderHeader();
      this.#renderRows();
    };

    const onMouseUp = () => {
      if (this.#resizingColumn) {
        const finalCol = this.#columnController.getColumn(this.#resizingColumn);
        if (finalCol) {
          this.emit('column-resize', { field: this.#resizingColumn, width: finalCol.width });
        }
      }
      this.#resizingColumn = null;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  // ─── Private: Pagination Rendering ──────────

  #renderPagination(): void {
    const pageSize = (this as unknown as { pageSize: number }).pageSize ?? 0;
    if (pageSize <= 0) {
      this.#paginationEl?.remove();
      this.#paginationEl = null;
      return;
    }

    const wrapper = this.shadowRoot.querySelector('.grid-wrapper');
    if (!wrapper) return;

    if (!this.#paginationEl) {
      this.#paginationEl = document.createElement('div');
      this.#paginationEl.className = 'grid-pagination';
      this.#paginationEl.setAttribute('role', 'navigation');
      this.#paginationEl.setAttribute('aria-label', 'Pagination');
      wrapper.appendChild(this.#paginationEl);
      this.#paginationEl.addEventListener('click', (e) => this.#handlePaginationClick(e));
    }

    const state = this.#pagination.getState();
    const pages = this.#pagination.getPageNumbers();

    this.#paginationEl.innerHTML = `
      <span class="grid-pagination-info">
        ${state.totalRows > 0 ? `${this.#pagination.startRow + 1}–${this.#pagination.endRow} of ${state.totalRows}` : '0 rows'}
      </span>
      <div class="grid-pagination-controls">
        <button class="grid-pagination-btn" data-page="first" ${state.currentPage === 1 ? 'disabled' : ''}>«</button>
        <button class="grid-pagination-btn" data-page="prev" ${state.currentPage === 1 ? 'disabled' : ''}>‹</button>
        ${pages
          .map((p) =>
            p === -1
              ? '<span class="grid-pagination-ellipsis">…</span>'
              : `<button class="grid-pagination-btn" data-page="${p}" ${p === state.currentPage ? 'data-active' : ''}>${p}</button>`,
          )
          .join('')}
        <button class="grid-pagination-btn" data-page="next" ${state.currentPage >= state.totalPages ? 'disabled' : ''}>›</button>
        <button class="grid-pagination-btn" data-page="last" ${state.currentPage >= state.totalPages ? 'disabled' : ''}>»</button>
      </div>
    `;
  }

  #handlePaginationClick(e: Event): void {
    const btn = (e.target as HTMLElement).closest('[data-page]') as HTMLElement | null;
    if (!btn || btn.hasAttribute('disabled')) return;

    const action = btn.dataset.page;
    switch (action) {
      case 'first':
        this.#pagination.firstPage();
        break;
      case 'prev':
        this.#pagination.prevPage();
        break;
      case 'next':
        this.#pagination.nextPage();
        break;
      case 'last':
        this.#pagination.lastPage();
        break;
      default:
        this.#pagination.goToPage(Number(action));
    }

    (this as unknown as { currentPage: number }).currentPage = this.#pagination.currentPage;
    this.#processData();
    this.#renderContent();
    this.emit('page-change', {
      page: this.#pagination.currentPage,
      pageSize: this.#pagination.pageSize,
    });
  }

  // ─── Private: Quick Filter Bar ─────────────

  #renderQuickFilterBar(): void {
    const quickText = (this as unknown as { quickFilterText: string }).quickFilterText ?? '';
    const wrapper = this.shadowRoot.querySelector('.grid-wrapper');
    if (!wrapper) return;

    // Sync engine text from reactive property
    if (quickText && quickText !== this.#quickFilter.text) {
      this.#quickFilter.text = quickText;
      this.#processData();
    }

    // Only render when quick filter has content or was previously shown
    if (!quickText && !this.#quickFilterBar) return;

    if (!this.#quickFilterBar) {
      this.#quickFilterBar = document.createElement('div');
      this.#quickFilterBar.className = 'grid-quick-filter';
      this.#quickFilterBar.innerHTML =
        '<input class="grid-quick-filter-input" type="text" placeholder="Search all columns..." aria-label="Quick filter" />';
      // Insert before viewport
      const viewport = wrapper.querySelector('.grid-viewport');
      if (viewport) {
        wrapper.insertBefore(this.#quickFilterBar, viewport);
      } else {
        wrapper.prepend(this.#quickFilterBar);
      }

      const input = this.#quickFilterBar.querySelector('input')!;
      input.addEventListener('input', () => {
        const debounceMs =
          (this as unknown as { filterDebounceMs: number }).filterDebounceMs ?? 300;
        if (this.#quickFilterDebounceTimer) clearTimeout(this.#quickFilterDebounceTimer);
        this.#quickFilterDebounceTimer = setTimeout(() => {
          this.#quickFilter.text = input.value;
          this.#processData();
          this.#renderRows();
          this.#renderPagination();
          this.#renderOverlays();
          this.emit('quick-filter-change', { text: input.value });
        }, debounceMs);
      });
    }

    // Sync input value if set programmatically
    const input = this.#quickFilterBar.querySelector('input');
    if (input && document.activeElement !== input && input.value !== this.#quickFilter.text) {
      input.value = this.#quickFilter.text;
    }

    if (!quickText && this.#quickFilter.text === '') {
      this.#quickFilterBar.remove();
      this.#quickFilterBar = null;
    }
  }

  // ─── Private: Floating Filter Row ─────────────

  #renderFloatingFilterRow(): void {
    const showFloating = (this as unknown as { floatingFilter: boolean }).floatingFilter ?? false;
    const viewport = this.shadowRoot.querySelector('.grid-viewport');
    if (!viewport) return;

    if (!showFloating) {
      this.#floatingFilterRow?.remove();
      this.#floatingFilterRow = null;
      return;
    }

    const visible = this.#columnController.visibleColumns;

    if (!this.#floatingFilterRow) {
      this.#floatingFilterRow = document.createElement('div');
      this.#floatingFilterRow.className = 'grid-floating-filter-row';
      this.#floatingFilterRow.setAttribute('role', 'row');
      this.#floatingFilterRow.setAttribute('aria-label', 'Column filters');
      // Insert after header
      const header = viewport.querySelector('.grid-header');
      if (header?.nextSibling) {
        viewport.insertBefore(this.#floatingFilterRow, header.nextSibling);
      } else {
        viewport.appendChild(this.#floatingFilterRow);
      }
    }

    this.#floatingFilterRow.innerHTML = visible
      .map((col) => {
        if (col.def.filterable === false) {
          return `<div class="grid-floating-filter-cell" style="width:${col.width}px"></div>`;
        }
        const currentValue = this.#getFloatingFilterValue(col.def.field);
        return `
          <div class="grid-floating-filter-cell" style="width:${col.width}px">
            <input class="grid-floating-filter-input"
                   type="${col.def.type === 'number' ? 'number' : 'text'}"
                   data-filter-field="${col.def.field}"
                   placeholder="Filter..."
                   value="${this.#escapeHtml(currentValue)}"
                   aria-label="Filter ${col.def.header}" />
          </div>
        `;
      })
      .join('');

    // Attach input handlers (re-attached since innerHTML replaces elements)
    this.#floatingFilterRow.querySelectorAll('input[data-filter-field]').forEach((input) => {
      input.addEventListener('input', (e) => {
        const el = e.target as HTMLInputElement;
        const field = el.dataset.filterField!;
        this.#handleFloatingFilterInput(field, el.value);
      });
    });
  }

  #getFloatingFilterValue(field: string): string {
    const model = this.#filterModel[field];
    if (!model) return '';
    if (model.type === 'text') return model.value ?? '';
    if (model.type === 'number') return String(model.value ?? '');
    return '';
  }

  #handleFloatingFilterInput(field: string, value: string): void {
    const debounceMs = (this as unknown as { filterDebounceMs: number }).filterDebounceMs ?? 300;

    // Clear existing timer for this field
    const existing = this.#filterDebounceTimers.get(field);
    if (existing) clearTimeout(existing);

    this.#filterDebounceTimers.set(
      field,
      setTimeout(() => {
        this.#filterDebounceTimers.delete(field);
        const newFilterModel = { ...this.#filterModel };

        if (value.trim() === '') {
          delete newFilterModel[field];
        } else {
          const col = this.#columnController.getColumn(field);
          const colType = col?.def.type;

          if (colType === 'number') {
            const num = Number(value);
            if (!Number.isNaN(num)) {
              newFilterModel[field] = { type: 'number', operator: 'equals', value: num };
            }
          } else {
            newFilterModel[field] = { type: 'text', operator: 'contains', value: value.trim() };
          }
        }

        this.#filterModel = newFilterModel;
        this.#processData();
        this.#renderRows();
        this.#renderPagination();
        this.#renderOverlays();
        this.emit('filter-change', { filterModel: this.#filterModel });
      }, debounceMs),
    );
  }

  // ─── Private: Column Menu ─────────────────────

  #openColumnMenu(field: string, anchor: HTMLElement): void {
    const col = this.#columnController.getColumn(field);
    if (!col) return;

    this.#columnMenu.open(
      this.shadowRoot,
      {
        field,
        column: col.def,
        anchorRect: anchor.getBoundingClientRect(),
        currentFilter: this.#filterModel[field],
        allColumns:
          this.#columns.length > 0
            ? this.#columns
            : this.#columnController.columns.map((c) => c.def),
      },
      (action) => this.#handleColumnMenuAction(action),
      () => {},
    );
  }

  #handleColumnMenuAction(action: ColumnMenuAction): void {
    switch (action.type) {
      case 'sort-asc':
        this.sortModel = [{ field: action.field, direction: 'asc' }];
        break;
      case 'sort-desc':
        this.sortModel = [{ field: action.field, direction: 'desc' }];
        break;
      case 'clear-sort':
        this.sortModel = this.#sortModel.filter((s) => s.field !== action.field);
        break;
      case 'hide-column':
        this.setColumnVisible(action.field, false);
        break;
      case 'auto-size':
        this.autoSizeColumns([action.field]);
        break;
      case 'pin-left':
        this.pinColumn(action.field, 'left');
        break;
      case 'pin-right':
        this.pinColumn(action.field, 'right');
        break;
      case 'unpin':
        this.pinColumn(action.field, false);
        break;
      case 'apply-filter':
        if (action.filterModel) {
          this.filterModel = { ...this.#filterModel, [action.field]: action.filterModel };
        }
        break;
      case 'clear-filter': {
        const newModel = { ...this.#filterModel };
        delete newModel[action.field];
        this.filterModel = newModel;
        break;
      }
      case 'toggle-column':
        if (action.targetField != null && action.visible != null) {
          this.setColumnVisible(action.targetField, action.visible);
        }
        break;
    }
  }

  // ─── Private: Keyboard Handlers ──────────────

  #onNavigate(pos: GridPosition): void {
    this.#focusManager.focusCell(pos.rowIndex, pos.colIndex);
    // Ensure row is visible
    this.scrollToRow(pos.rowIndex);
  }

  #onActivate(pos: GridPosition): void {
    const row = this.#paginatedRows[pos.rowIndex];
    const col = this.#columnController.visibleColumns[pos.colIndex];
    if (!row || !col) return;

    // Start editing on Enter/F2
    const editable = (this as unknown as { editable: boolean }).editable;
    if (editable) {
      this.startEditingCell(pos.rowIndex, col.def.field);
    }

    this.emit('cell-double-click', {
      row,
      field: col.def.field,
      value: row[col.def.field],
      rowIndex: pos.rowIndex,
    });
  }

  #onSelect(pos: GridPosition): void {
    const row = this.#paginatedRows[pos.rowIndex];
    if (!row) return;
    this.#handleRowSelection(row, pos.rowIndex, new MouseEvent('click'));
  }

  // ─── Private: Editing ────────────────────────

  #applyCellChange(change: CellChange, pushToUndo = true): void {
    const row = this.#data[change.rowIndex];
    if (!row) return;

    row[change.field] = change.newValue;

    if (pushToUndo) {
      this.#undoRedo.push(change);
    }

    this.emit('cell-edit-end', {
      rowIndex: change.rowIndex,
      field: change.field,
      oldValue: change.oldValue,
      newValue: change.newValue,
    });

    this.#processData();
    this.#renderContent();
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
