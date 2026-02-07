/**
 * Row pinning engine — pin rows to the top or bottom of the grid.
 *
 * Pinned rows appear outside the scrollable area and are not affected
 * by sorting or filtering.
 */

import type { Row } from '../types.js';

// ─── Public Types ────────────────────────────

export interface PinnedRowsConfig {
  topRows?: Row[];
  bottomRows?: Row[];
}

// ─── RowPinning Class ────────────────────────

export class RowPinning {
  #topRows: Row[] = [];
  #bottomRows: Row[] = [];

  get topRows(): Row[] {
    return [...this.#topRows];
  }

  set topRows(rows: Row[]) {
    this.#topRows = [...rows];
  }

  get bottomRows(): Row[] {
    return [...this.#bottomRows];
  }

  set bottomRows(rows: Row[]) {
    this.#bottomRows = [...rows];
  }

  get topCount(): number {
    return this.#topRows.length;
  }

  get bottomCount(): number {
    return this.#bottomRows.length;
  }

  get hasTopRows(): boolean {
    return this.#topRows.length > 0;
  }

  get hasBottomRows(): boolean {
    return this.#bottomRows.length > 0;
  }

  get hasPinnedRows(): boolean {
    return this.hasTopRows || this.hasBottomRows;
  }

  configure(config: PinnedRowsConfig): void {
    if (config.topRows !== undefined) this.#topRows = [...config.topRows];
    if (config.bottomRows !== undefined) this.#bottomRows = [...config.bottomRows];
  }

  /**
   * Pin a row to the top.
   */
  pinTop(row: Row): void {
    this.#topRows.push(row);
  }

  /**
   * Pin a row to the bottom.
   */
  pinBottom(row: Row): void {
    this.#bottomRows.push(row);
  }

  /**
   * Unpin a row (from either top or bottom).
   */
  unpin(row: Row, rowKey = 'id'): boolean {
    const key = row[rowKey];
    let found = false;

    const topIdx = this.#topRows.findIndex((r) => r[rowKey] === key);
    if (topIdx >= 0) {
      this.#topRows.splice(topIdx, 1);
      found = true;
    }

    const bottomIdx = this.#bottomRows.findIndex((r) => r[rowKey] === key);
    if (bottomIdx >= 0) {
      this.#bottomRows.splice(bottomIdx, 1);
      found = true;
    }

    return found;
  }

  /**
   * Check if a row is pinned (top or bottom).
   */
  isPinned(row: Row, rowKey = 'id'): 'top' | 'bottom' | false {
    const key = row[rowKey];
    if (this.#topRows.some((r) => r[rowKey] === key)) return 'top';
    if (this.#bottomRows.some((r) => r[rowKey] === key)) return 'bottom';
    return false;
  }

  /**
   * Clear all pinned rows.
   */
  clear(): void {
    this.#topRows = [];
    this.#bottomRows = [];
  }
}
