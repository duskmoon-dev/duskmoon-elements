/**
 * @duskmoon-dev/el-pro-data-grid
 *
 * Enterprise-grade data grid web component.
 */

export { ElDmProDataGrid, registerProDataGrid } from './pro-data-grid.js';
export { ElDmGridColumn, registerGridColumn } from './grid-column.js';
export { ElDmGridColumnGroup, registerGridColumnGroup } from './grid-column-group.js';
export * from './types.js';

// Core engines (for advanced usage / testing)
export { VirtualScroller } from './core/virtual-scroller.js';
export type { VirtualScrollerOptions } from './core/virtual-scroller.js';
export { SortEngine } from './core/sort-engine.js';
export { FilterEngine } from './core/filter-engine.js';
export { ColumnController } from './core/column-controller.js';
export { SelectionManager } from './core/selection-manager.js';
export type { SelectionMode } from './core/selection-manager.js';
export { Pagination } from './core/pagination.js';
export type { PaginationState } from './core/pagination.js';
export { QuickFilter } from './core/quick-filter.js';
export { ColumnMenu } from './core/column-menu.js';
export type { ColumnMenuConfig, ColumnMenuAction } from './core/column-menu.js';
export { CellEditor } from './core/cell-editor.js';
export type { EditorType, EditingState, CellEditorOptions } from './core/cell-editor.js';
export { UndoRedoManager } from './core/undo-redo.js';
export { RowGrouping } from './core/row-grouping.js';
export type { RowNode, AggFunc, GroupingConfig } from './core/row-grouping.js';
export { RowPivot } from './core/row-pivot.js';
export type { PivotConfig, PivotResult } from './core/row-pivot.js';
export { TreeData } from './core/tree-data.js';
export type { TreeNode, TreeDataConfig } from './core/tree-data.js';
export { RowExpander } from './core/row-expander.js';
export type { RowExpanderConfig } from './core/row-expander.js';
export { KeyboardNav } from './core/keyboard-nav.js';
export type { GridPosition, KeyboardNavOptions } from './core/keyboard-nav.js';
export { FocusManager } from './core/focus-manager.js';
export { CellSelection } from './core/cell-selection.js';
export type { CellSelectionOptions, RangeAggregation, FillResult } from './core/cell-selection.js';
export { ClipboardService } from './core/clipboard-service.js';
export type { ClipboardOptions, PasteResult } from './core/clipboard-service.js';
export { DataExport } from './core/data-export.js';
export type { CsvExportParams, JsonExportParams, ExcelExportParams } from './core/data-export.js';
export { ContextMenu } from './core/context-menu.js';
export type { ContextMenuItem, ContextMenuConfig } from './core/context-menu.js';
export { StatusBar } from './core/status-bar.js';
export type { StatusBarPanel, StatusBarConfig } from './core/status-bar.js';
export { FindBar } from './core/find-bar.js';
export type { FindMatch, FindBarState } from './core/find-bar.js';
export { Sparkline } from './core/sparkline.js';
export type { SparklineDef, SparklineOptions } from './core/sparkline.js';

import { registerProDataGrid } from './pro-data-grid.js';
import { registerGridColumn } from './grid-column.js';
import { registerGridColumnGroup } from './grid-column-group.js';

export function register(): void {
  registerProDataGrid();
  registerGridColumn();
  registerGridColumnGroup();
}
