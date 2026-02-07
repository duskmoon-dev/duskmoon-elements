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
export { ColumnController } from './core/column-controller.js';
export { KeyboardNav } from './core/keyboard-nav.js';
export type { GridPosition, KeyboardNavOptions } from './core/keyboard-nav.js';
export { FocusManager } from './core/focus-manager.js';

import { registerProDataGrid } from './pro-data-grid.js';
import { registerGridColumn } from './grid-column.js';
import { registerGridColumnGroup } from './grid-column-group.js';

export function register(): void {
  registerProDataGrid();
  registerGridColumn();
  registerGridColumnGroup();
}
