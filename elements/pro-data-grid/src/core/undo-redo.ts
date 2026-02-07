/**
 * Undo/Redo manager — tracks cell edit history.
 *
 * Maintains two stacks (undo/redo) with configurable depth.
 * Each entry records the cell change (field, row, old/new value).
 */

import type { CellChange } from '../types.js';

export class UndoRedoManager {
  #undoStack: CellChange[] = [];
  #redoStack: CellChange[] = [];
  #maxDepth: number;

  constructor(maxDepth = 100) {
    this.#maxDepth = maxDepth;
  }

  get canUndo(): boolean {
    return this.#undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.#redoStack.length > 0;
  }

  get undoSize(): number {
    return this.#undoStack.length;
  }

  get redoSize(): number {
    return this.#redoStack.length;
  }

  get maxDepth(): number {
    return this.#maxDepth;
  }

  set maxDepth(value: number) {
    this.#maxDepth = Math.max(1, value);
    this.#trimUndoStack();
  }

  /**
   * Record a cell change. Clears the redo stack.
   */
  push(change: CellChange): void {
    this.#undoStack.push(change);
    this.#redoStack.length = 0;
    this.#trimUndoStack();
  }

  /**
   * Undo the last change. Returns the change to revert (with swapped old/new).
   */
  undo(): CellChange | null {
    const change = this.#undoStack.pop();
    if (!change) return null;

    this.#redoStack.push(change);

    // Return the inverse change (swap old and new)
    return {
      rowIndex: change.rowIndex,
      field: change.field,
      oldValue: change.newValue,
      newValue: change.oldValue,
    };
  }

  /**
   * Redo the last undone change. Returns the change to re-apply.
   */
  redo(): CellChange | null {
    const change = this.#redoStack.pop();
    if (!change) return null;

    this.#undoStack.push(change);

    // Return the change as-is (re-apply newValue)
    return { ...change };
  }

  /**
   * Clear all history.
   */
  clear(): void {
    this.#undoStack.length = 0;
    this.#redoStack.length = 0;
  }

  /**
   * Get a snapshot of the current state (for debugging/testing).
   */
  getState(): { undoStack: CellChange[]; redoStack: CellChange[] } {
    return {
      undoStack: [...this.#undoStack],
      redoStack: [...this.#redoStack],
    };
  }

  #trimUndoStack(): void {
    while (this.#undoStack.length > this.#maxDepth) {
      this.#undoStack.shift();
    }
  }
}
