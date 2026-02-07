/**
 * Cell/range selection engine — Excel-like cell range selection.
 *
 * Supports click+drag rectangular ranges, Ctrl+click for multi-range,
 * Shift+click to extend, fill handle, and range aggregation.
 */

import type { Row, ColumnDef, CellRange, CellRangeParams } from '../types.js';

// ─── Public Types ────────────────────────────

export interface CellSelectionOptions {
  enabled?: boolean;
  fillHandle?: boolean;
}

export interface RangeAggregation {
  sum: number;
  count: number;
  avg: number;
  min: number;
  max: number;
  numericCount: number;
}

export interface FillResult {
  changes: { rowIndex: number; field: string; value: unknown }[];
}

// ─── CellSelection Class ─────────────────────

export class CellSelection {
  #enabled = false;
  #fillHandle = false;
  #ranges: CellRange[] = [];
  #columns: ColumnDef[] = [];

  // Drag state
  #dragging = false;
  #dragStartRow = -1;
  #dragStartColIndex = -1;

  get enabled(): boolean {
    return this.#enabled;
  }

  set enabled(value: boolean) {
    this.#enabled = value;
    if (!value) this.#ranges = [];
  }

  get fillHandle(): boolean {
    return this.#fillHandle;
  }

  set fillHandle(value: boolean) {
    this.#fillHandle = value;
  }

  get ranges(): CellRange[] {
    return [...this.#ranges];
  }

  get rangeCount(): number {
    return this.#ranges.length;
  }

  configure(opts: CellSelectionOptions): void {
    if (opts.enabled !== undefined) this.enabled = opts.enabled;
    if (opts.fillHandle !== undefined) this.#fillHandle = opts.fillHandle;
  }

  setColumns(columns: ColumnDef[]): void {
    this.#columns = columns;
  }

  /**
   * Start a new cell selection at a specific cell.
   * If ctrlKey is true, adds a new range (multi-range).
   * Otherwise, replaces all ranges.
   */
  startSelection(rowIndex: number, field: string, ctrlKey = false): void {
    if (!this.#enabled) return;

    const colIndex = this.#columns.findIndex((c) => c.field === field);
    if (colIndex === -1) return;

    this.#dragging = true;
    this.#dragStartRow = rowIndex;
    this.#dragStartColIndex = colIndex;

    const col = this.#columns[colIndex];
    const range: CellRange = {
      startRow: { index: rowIndex },
      endRow: { index: rowIndex },
      columns: [col],
      startColumn: col,
    };

    if (ctrlKey) {
      this.#ranges.push(range);
    } else {
      this.#ranges = [range];
    }
  }

  /**
   * Update the active (last) range during drag.
   */
  updateSelection(rowIndex: number, field: string): void {
    if (!this.#enabled || !this.#dragging || this.#ranges.length === 0) return;

    const colIndex = this.#columns.findIndex((c) => c.field === field);
    if (colIndex === -1) return;

    const activeRange = this.#ranges[this.#ranges.length - 1];
    const minCol = Math.min(this.#dragStartColIndex, colIndex);
    const maxCol = Math.max(this.#dragStartColIndex, colIndex);

    const selectedCols = this.#columns.slice(minCol, maxCol + 1);

    activeRange.startRow = { index: Math.min(this.#dragStartRow, rowIndex) };
    activeRange.endRow = { index: Math.max(this.#dragStartRow, rowIndex) };
    activeRange.columns = selectedCols;
    activeRange.startColumn = this.#columns[this.#dragStartColIndex];
  }

  /**
   * Finish the drag operation.
   */
  endSelection(): void {
    this.#dragging = false;
  }

  /**
   * Extend the last range to include the given cell (Shift+click).
   */
  extendSelection(rowIndex: number, field: string): void {
    if (!this.#enabled) return;

    if (this.#ranges.length === 0) {
      this.startSelection(rowIndex, field);
      this.endSelection();
      return;
    }

    const lastRange = this.#ranges[this.#ranges.length - 1];
    const anchorRow = lastRange.startRow.index;
    const anchorCol = this.#columns.findIndex((c) => c.field === lastRange.startColumn.field);
    const targetCol = this.#columns.findIndex((c) => c.field === field);

    if (anchorCol === -1 || targetCol === -1) return;

    const minRow = Math.min(anchorRow, rowIndex);
    const maxRow = Math.max(anchorRow, rowIndex);
    const minCol = Math.min(anchorCol, targetCol);
    const maxCol = Math.max(anchorCol, targetCol);

    lastRange.startRow = { index: minRow };
    lastRange.endRow = { index: maxRow };
    lastRange.columns = this.#columns.slice(minCol, maxCol + 1);
  }

  /**
   * Select a cell range programmatically.
   */
  selectRange(params: CellRangeParams): void {
    if (!this.#enabled) return;

    const cols = params.columns
      .map((field) => this.#columns.find((c) => c.field === field))
      .filter((c): c is ColumnDef => c !== undefined);

    if (cols.length === 0) return;

    this.#ranges = [
      {
        startRow: { index: params.rowStartIndex },
        endRow: { index: params.rowEndIndex },
        columns: cols,
        startColumn: cols[0],
      },
    ];
  }

  /**
   * Check if a specific cell is within any selected range.
   */
  isCellSelected(rowIndex: number, field: string): boolean {
    return this.#ranges.some((range) => {
      const minRow = Math.min(range.startRow.index, range.endRow.index);
      const maxRow = Math.max(range.startRow.index, range.endRow.index);
      if (rowIndex < minRow || rowIndex > maxRow) return false;
      return range.columns.some((c) => c.field === field);
    });
  }

  /**
   * Clear all cell selections.
   */
  clearSelections(): void {
    this.#ranges = [];
    this.#dragging = false;
  }

  /**
   * Get aggregation stats for all selected ranges.
   */
  getAggregation(rows: Row[]): RangeAggregation {
    let sum = 0;
    let count = 0;
    let numericCount = 0;
    let min = Infinity;
    let max = -Infinity;

    for (const range of this.#ranges) {
      const minRow = Math.min(range.startRow.index, range.endRow.index);
      const maxRow = Math.max(range.startRow.index, range.endRow.index);

      for (let r = minRow; r <= maxRow; r++) {
        const row = rows[r];
        if (!row) continue;

        for (const col of range.columns) {
          const val = row[col.field];
          count++;
          const num = Number(val);
          if (val != null && !Number.isNaN(num)) {
            sum += num;
            numericCount++;
            if (num < min) min = num;
            if (num > max) max = num;
          }
        }
      }
    }

    return {
      sum,
      count,
      avg: numericCount > 0 ? sum / numericCount : 0,
      min: min === Infinity ? 0 : min,
      max: max === -Infinity ? 0 : max,
      numericCount,
    };
  }

  /**
   * Execute a fill operation: copy values from the source range
   * downward (or upward) to fill the target range.
   */
  fill(rows: Row[], sourceRange: CellRange, targetEndRow: number): FillResult {
    const changes: FillResult['changes'] = [];

    const srcStart = Math.min(sourceRange.startRow.index, sourceRange.endRow.index);
    const srcEnd = Math.max(sourceRange.startRow.index, sourceRange.endRow.index);
    const srcLength = srcEnd - srcStart + 1;

    const fillDown = targetEndRow > srcEnd;
    const fillStart = fillDown ? srcEnd + 1 : targetEndRow;
    const fillEnd = fillDown ? targetEndRow : srcStart - 1;

    if (fillStart > fillEnd && fillDown) return { changes };
    if (fillStart > fillEnd && !fillDown) return { changes };

    for (const col of sourceRange.columns) {
      // Collect source values
      const sourceValues: unknown[] = [];
      for (let r = srcStart; r <= srcEnd; r++) {
        const row = rows[r];
        sourceValues.push(row ? row[col.field] : undefined);
      }

      // Detect numeric sequence
      const sequence = this.#detectSequence(sourceValues);

      if (fillDown) {
        for (let r = fillStart; r <= fillEnd; r++) {
          const offset = r - srcStart;
          const value = sequence
            ? sequence.start + sequence.step * offset
            : sourceValues[offset % srcLength];
          changes.push({ rowIndex: r, field: col.field, value });
        }
      } else {
        for (let r = fillEnd; r >= fillStart; r--) {
          const offset = srcEnd - r;
          const cyclicIdx = (srcLength - 1 - (offset % srcLength)) % srcLength;
          const value = sequence
            ? (sourceValues[0] as number) - sequence.step * (srcStart - r)
            : sourceValues[cyclicIdx];
          changes.push({ rowIndex: r, field: col.field, value });
        }
      }
    }

    return { changes };
  }

  /**
   * Delete values in all selected ranges (returns changes for undo).
   */
  deleteRangeValues(rows: Row[]): { rowIndex: number; field: string; oldValue: unknown }[] {
    const changes: { rowIndex: number; field: string; oldValue: unknown }[] = [];

    for (const range of this.#ranges) {
      const minRow = Math.min(range.startRow.index, range.endRow.index);
      const maxRow = Math.max(range.startRow.index, range.endRow.index);

      for (let r = minRow; r <= maxRow; r++) {
        const row = rows[r];
        if (!row) continue;
        for (const col of range.columns) {
          if (row[col.field] != null && row[col.field] !== '') {
            changes.push({ rowIndex: r, field: col.field, oldValue: row[col.field] });
          }
        }
      }
    }

    return changes;
  }

  /**
   * Get cell data from all selected ranges as a 2D array
   * (for clipboard copy).
   */
  getRangeData(rows: Row[]): string[][] {
    if (this.#ranges.length === 0) return [];

    // Use the first range for copy
    const range = this.#ranges[0];
    const minRow = Math.min(range.startRow.index, range.endRow.index);
    const maxRow = Math.max(range.startRow.index, range.endRow.index);
    const result: string[][] = [];

    for (let r = minRow; r <= maxRow; r++) {
      const row = rows[r];
      if (!row) continue;
      const rowData: string[] = [];
      for (const col of range.columns) {
        const val = row[col.field];
        rowData.push(val == null ? '' : String(val));
      }
      result.push(rowData);
    }

    return result;
  }

  /**
   * Get column headers for the first selected range.
   */
  getRangeHeaders(): string[] {
    if (this.#ranges.length === 0) return [];
    return this.#ranges[0].columns.map((c) => c.header || c.field);
  }

  #detectSequence(values: unknown[]): { start: number; step: number } | null {
    if (values.length < 2) return null;

    const nums: number[] = [];
    for (const v of values) {
      const n = Number(v);
      if (Number.isNaN(n)) return null;
      nums.push(n);
    }

    // Check if all steps are the same
    const step = nums[1] - nums[0];
    for (let i = 2; i < nums.length; i++) {
      if (Math.abs(nums[i] - nums[i - 1] - step) > 1e-10) return null;
    }

    return { start: nums[0], step };
  }
}
