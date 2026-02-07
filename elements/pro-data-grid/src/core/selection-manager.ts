/**
 * Selection state manager.
 *
 * Handles row selection modes (none, single, multiple), checkbox column,
 * Shift+click range selection, and select-all. Selection persists across
 * sort and filter operations by tracking row keys.
 */

import type { Row } from '../types.js';

export type SelectionMode = 'none' | 'single' | 'multiple';

export class SelectionManager {
  #mode: SelectionMode = 'none';
  #selectedKeys = new Set<unknown>();
  #rowKey: string;
  #lastSelectedIndex: number | null = null;

  constructor(rowKey = 'id') {
    this.#rowKey = rowKey;
  }

  get mode(): SelectionMode {
    return this.#mode;
  }

  set mode(value: SelectionMode) {
    this.#mode = value;
    if (value === 'none') {
      this.#selectedKeys.clear();
    }
  }

  get rowKey(): string {
    return this.#rowKey;
  }

  set rowKey(value: string) {
    this.#rowKey = value;
  }

  get selectedKeys(): ReadonlySet<unknown> {
    return this.#selectedKeys;
  }

  get selectedCount(): number {
    return this.#selectedKeys.size;
  }

  /**
   * Get selected rows from the dataset.
   */
  getSelectedRows(rows: Row[]): Row[] {
    return rows.filter((r) => this.#selectedKeys.has(r[this.#rowKey]));
  }

  /**
   * Check if a row is selected.
   */
  isSelected(row: Row): boolean {
    return this.#selectedKeys.has(row[this.#rowKey]);
  }

  /**
   * Handle a row click event. Returns the change details.
   */
  handleClick(
    row: Row,
    rowIndex: number,
    rows: Row[],
    shiftKey: boolean,
    ctrlKey: boolean,
  ): { added: Row[]; removed: Row[] } {
    if (this.#mode === 'none') return { added: [], removed: [] };

    const key = row[this.#rowKey];

    if (this.#mode === 'single') {
      const wasSelected = this.#selectedKeys.has(key);
      const removed = this.getSelectedRows(rows);
      this.#selectedKeys.clear();

      if (wasSelected) {
        this.#lastSelectedIndex = null;
        return { added: [], removed };
      }

      this.#selectedKeys.add(key);
      this.#lastSelectedIndex = rowIndex;
      return { added: [row], removed };
    }

    // Multiple mode
    if (shiftKey && this.#lastSelectedIndex !== null) {
      return this.#rangeSelect(rowIndex, rows);
    }

    if (ctrlKey) {
      return this.#toggleSelect(row, key, rowIndex);
    }

    // Regular click — select only this row
    const removed = this.getSelectedRows(rows);
    this.#selectedKeys.clear();
    this.#selectedKeys.add(key);
    this.#lastSelectedIndex = rowIndex;
    return { added: [row], removed };
  }

  /**
   * Toggle a specific row's selection.
   */
  toggle(row: Row): { added: Row[]; removed: Row[] } {
    const key = row[this.#rowKey];
    if (this.#selectedKeys.has(key)) {
      this.#selectedKeys.delete(key);
      return { added: [], removed: [row] };
    }
    this.#selectedKeys.add(key);
    return { added: [row], removed: [] };
  }

  /**
   * Select all rows.
   */
  selectAll(rows: Row[]): { added: Row[]; removed: Row[] } {
    const added: Row[] = [];
    for (const row of rows) {
      const key = row[this.#rowKey];
      if (!this.#selectedKeys.has(key)) {
        this.#selectedKeys.add(key);
        added.push(row);
      }
    }
    return { added, removed: [] };
  }

  /**
   * Deselect all rows.
   */
  deselectAll(rows: Row[]): { added: Row[]; removed: Row[] } {
    const removed = this.getSelectedRows(rows);
    this.#selectedKeys.clear();
    this.#lastSelectedIndex = null;
    return { added: [], removed };
  }

  /**
   * Check if all rows are selected.
   */
  isAllSelected(rows: Row[]): boolean {
    if (rows.length === 0) return false;
    return rows.every((r) => this.#selectedKeys.has(r[this.#rowKey]));
  }

  /**
   * Check if some (but not all) rows are selected.
   */
  isIndeterminate(rows: Row[]): boolean {
    if (rows.length === 0) return false;
    const count = rows.filter((r) => this.#selectedKeys.has(r[this.#rowKey])).length;
    return count > 0 && count < rows.length;
  }

  #toggleSelect(row: Row, key: unknown, rowIndex: number): { added: Row[]; removed: Row[] } {
    if (this.#selectedKeys.has(key)) {
      this.#selectedKeys.delete(key);
      return { added: [], removed: [row] };
    }
    this.#selectedKeys.add(key);
    this.#lastSelectedIndex = rowIndex;
    return { added: [row], removed: [] };
  }

  #rangeSelect(toIndex: number, rows: Row[]): { added: Row[]; removed: Row[] } {
    const from = Math.min(this.#lastSelectedIndex!, toIndex);
    const to = Math.max(this.#lastSelectedIndex!, toIndex);
    const added: Row[] = [];

    for (let i = from; i <= to; i++) {
      const row = rows[i];
      if (!row) continue;
      const key = row[this.#rowKey];
      if (!this.#selectedKeys.has(key)) {
        this.#selectedKeys.add(key);
        added.push(row);
      }
    }

    this.#lastSelectedIndex = toIndex;
    return { added, removed: [] };
  }
}
