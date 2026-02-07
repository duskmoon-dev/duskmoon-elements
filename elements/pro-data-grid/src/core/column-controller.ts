/**
 * Column state controller.
 *
 * Manages column widths, visibility, ordering, pinning, and sort state.
 * Provides the computed column layout used by the grid renderer.
 */

import type { ColumnDef, ColumnStateInternal, SortItem } from '../types.js';

const DEFAULT_WIDTH = 150;
const DEFAULT_MIN_WIDTH = 50;

export class ColumnController {
  #columns: ColumnStateInternal[] = [];

  get columns(): ColumnStateInternal[] {
    return this.#columns;
  }

  get visibleColumns(): ColumnStateInternal[] {
    return this.#columns.filter((c) => c.visible);
  }

  get totalWidth(): number {
    return this.visibleColumns.reduce((sum, c) => sum + c.width, 0);
  }

  /**
   * Initialize columns from column definitions.
   */
  setColumns(defs: ColumnDef[]): void {
    this.#columns = defs.map((def) => ({
      def,
      width: def.width ?? DEFAULT_WIDTH,
      left: 0,
      visible: !def.hidden,
      sortDirection: null,
      sortIndex: null,
    }));
    this.#recalculatePositions();
  }

  /**
   * Apply sort model to column state — sets sortDirection and sortIndex.
   */
  applySortModel(sortModel: SortItem[]): void {
    for (const col of this.#columns) {
      const sortEntry = sortModel.find((s) => s.field === col.def.field);
      if (sortEntry) {
        col.sortDirection = sortEntry.direction;
        col.sortIndex = sortModel.indexOf(sortEntry);
      } else {
        col.sortDirection = null;
        col.sortIndex = null;
      }
    }
  }

  /**
   * Resize a column to a specific width, respecting min/max constraints.
   */
  resizeColumn(field: string, width: number): void {
    const col = this.#findColumn(field);
    if (!col) return;

    const min = col.def.minWidth ?? DEFAULT_MIN_WIDTH;
    const max = col.def.maxWidth ?? Infinity;
    col.width = Math.max(min, Math.min(max, width));
    this.#recalculatePositions();
  }

  /**
   * Set column visibility.
   */
  setColumnVisible(field: string, visible: boolean): void {
    const col = this.#findColumn(field);
    if (!col) return;
    if (col.def.lockVisible) return;
    col.visible = visible;
    this.#recalculatePositions();
  }

  /**
   * Move a column to a new position index.
   */
  moveColumn(field: string, toIndex: number): void {
    const fromIndex = this.#columns.findIndex((c) => c.def.field === field);
    if (fromIndex === -1) return;

    const col = this.#columns[fromIndex];
    if (col.def.lockPosition) return;

    this.#columns.splice(fromIndex, 1);
    this.#columns.splice(toIndex, 0, col);
    this.#recalculatePositions();
  }

  /**
   * Get column by field name.
   */
  getColumn(field: string): ColumnStateInternal | undefined {
    return this.#findColumn(field);
  }

  /**
   * Auto-size columns to fit the viewport width using flex values.
   * Columns with explicit widths keep them; remaining space is distributed.
   */
  sizeColumnsToFit(containerWidth: number): void {
    const visible = this.visibleColumns;
    const fixedWidth = visible.filter((c) => !c.def.flex).reduce((s, c) => s + c.width, 0);
    const remaining = containerWidth - fixedWidth;
    const totalFlex = visible.filter((c) => c.def.flex).reduce((s, c) => s + (c.def.flex ?? 0), 0);

    if (totalFlex > 0 && remaining > 0) {
      for (const col of visible) {
        if (col.def.flex) {
          col.width = Math.max(
            col.def.minWidth ?? DEFAULT_MIN_WIDTH,
            (col.def.flex / totalFlex) * remaining,
          );
        }
      }
    }

    this.#recalculatePositions();
  }

  #findColumn(field: string): ColumnStateInternal | undefined {
    return this.#columns.find((c) => c.def.field === field);
  }

  #recalculatePositions(): void {
    let left = 0;
    for (const col of this.visibleColumns) {
      col.left = left;
      left += col.width;
    }
  }
}
