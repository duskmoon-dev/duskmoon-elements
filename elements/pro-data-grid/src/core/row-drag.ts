/**
 * Row drag engine — managed row reordering via drag-and-drop.
 *
 * Supports single and multi-row drag, managed/unmanaged modes,
 * and external drop zones.
 */

import type { Row } from '../types.js';

// ─── Public Types ────────────────────────────

export interface RowDragConfig {
  enabled?: boolean;
  managed?: boolean;
  multiRow?: boolean;
  dragHandleColumn?: boolean;
  rowDragText?: (row: Row) => string;
}

export interface DragState {
  active: boolean;
  draggedRows: Row[];
  sourceIndex: number;
  targetIndex: number;
}

export interface DropResult {
  rows: Row[];
  fromIndices: number[];
  toIndex: number;
}

// ─── RowDrag Class ───────────────────────────

export class RowDrag {
  #enabled = false;
  #managed = true;
  #multiRow = false;
  #dragHandleColumn = true;
  #rowDragText: ((row: Row) => string) | null = null;
  #dragState: DragState = { active: false, draggedRows: [], sourceIndex: -1, targetIndex: -1 };

  get enabled(): boolean {
    return this.#enabled;
  }

  set enabled(value: boolean) {
    this.#enabled = value;
  }

  get managed(): boolean {
    return this.#managed;
  }

  get multiRow(): boolean {
    return this.#multiRow;
  }

  get dragState(): DragState {
    return { ...this.#dragState, draggedRows: [...this.#dragState.draggedRows] };
  }

  get isDragging(): boolean {
    return this.#dragState.active;
  }

  configure(config: RowDragConfig): void {
    if (config.enabled !== undefined) this.#enabled = config.enabled;
    if (config.managed !== undefined) this.#managed = config.managed;
    if (config.multiRow !== undefined) this.#multiRow = config.multiRow;
    if (config.dragHandleColumn !== undefined) this.#dragHandleColumn = config.dragHandleColumn;
    if (config.rowDragText !== undefined) this.#rowDragText = config.rowDragText;
  }

  /**
   * Start dragging one or more rows.
   */
  startDrag(rows: Row[], sourceIndex: number): void {
    if (!this.#enabled) return;
    const draggedRows = this.#multiRow ? rows : rows.slice(0, 1);
    this.#dragState = { active: true, draggedRows, sourceIndex, targetIndex: sourceIndex };
  }

  /**
   * Update the target drop position.
   */
  updateTarget(targetIndex: number): void {
    if (!this.#dragState.active) return;
    this.#dragState.targetIndex = targetIndex;
  }

  /**
   * End drag and compute the reorder result (for managed mode).
   * Returns the drop result containing the new row arrangement.
   */
  endDrag(allRows: Row[], rowKey = 'id'): DropResult | null {
    if (!this.#dragState.active) return null;

    const { draggedRows, targetIndex } = this.#dragState;
    this.#dragState = { active: false, draggedRows: [], sourceIndex: -1, targetIndex: -1 };

    if (!this.#managed) {
      return { rows: draggedRows, fromIndices: [], toIndex: targetIndex };
    }

    // Managed reorder: remove dragged rows and insert at target
    const draggedKeys = new Set(draggedRows.map((r) => r[rowKey]));
    const fromIndices: number[] = [];
    const remaining: Row[] = [];

    for (let i = 0; i < allRows.length; i++) {
      if (draggedKeys.has(allRows[i][rowKey])) {
        fromIndices.push(i);
      } else {
        remaining.push(allRows[i]);
      }
    }

    // Adjust target index for removed rows above
    let adjustedTarget = targetIndex;
    for (const fi of fromIndices) {
      if (fi < targetIndex) adjustedTarget--;
    }
    adjustedTarget = Math.max(0, Math.min(adjustedTarget, remaining.length));

    remaining.splice(adjustedTarget, 0, ...draggedRows);

    return { rows: remaining, fromIndices, toIndex: adjustedTarget };
  }

  /**
   * Cancel the drag operation.
   */
  cancelDrag(): void {
    this.#dragState = { active: false, draggedRows: [], sourceIndex: -1, targetIndex: -1 };
  }

  /**
   * Get the drag text for the currently dragged row(s).
   */
  getDragText(): string {
    if (this.#dragState.draggedRows.length === 0) return '';

    if (this.#rowDragText) {
      return this.#rowDragText(this.#dragState.draggedRows[0]);
    }

    if (this.#dragState.draggedRows.length === 1) {
      return '1 row';
    }
    return `${this.#dragState.draggedRows.length} rows`;
  }

  /**
   * Whether to show a drag handle column.
   */
  get showDragHandle(): boolean {
    return this.#enabled && this.#dragHandleColumn;
  }
}
