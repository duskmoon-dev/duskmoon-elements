/**
 * Clipboard service — copy, cut, and paste for the data grid.
 *
 * Handles system clipboard interaction with tab-separated format
 * for spreadsheet compatibility (Excel, Google Sheets).
 */

import type { Row, ColumnDef } from '../types.js';

// ─── Public Types ────────────────────────────

export interface ClipboardOptions {
  includeHeaders?: boolean;
  separator?: string;
  processCellCallback?: (params: ProcessCellForClipboardParams) => string;
}

export interface ProcessCellForClipboardParams {
  value: unknown;
  row: Row;
  field: string;
  rowIndex: number;
  column: ColumnDef;
}

export interface PasteResult {
  changes: { rowIndex: number; field: string; oldValue: unknown; newValue: unknown }[];
}

// ─── ClipboardService Class ──────────────────

export class ClipboardService {
  #separator = '\t';
  #includeHeaders = false;
  #processCellCallback: ClipboardOptions['processCellCallback'] = undefined;
  #suppressPaste = false;

  get separator(): string {
    return this.#separator;
  }

  set separator(value: string) {
    this.#separator = value;
  }

  get includeHeaders(): boolean {
    return this.#includeHeaders;
  }

  set includeHeaders(value: boolean) {
    this.#includeHeaders = value;
  }

  get suppressPaste(): boolean {
    return this.#suppressPaste;
  }

  set suppressPaste(value: boolean) {
    this.#suppressPaste = value;
  }

  configure(opts: ClipboardOptions): void {
    if (opts.separator !== undefined) this.#separator = opts.separator;
    if (opts.includeHeaders !== undefined) this.#includeHeaders = opts.includeHeaders;
    if (opts.processCellCallback !== undefined) {
      this.#processCellCallback = opts.processCellCallback;
    }
  }

  /**
   * Format 2D cell data as a clipboard string (tab-separated by default).
   */
  formatForClipboard(
    data: string[][],
    headers?: string[],
    options?: { includeHeaders?: boolean },
  ): string {
    const parts: string[] = [];
    const withHeaders = options?.includeHeaders ?? this.#includeHeaders;

    if (withHeaders && headers && headers.length > 0) {
      parts.push(headers.join(this.#separator));
    }

    for (const row of data) {
      parts.push(row.join(this.#separator));
    }

    return parts.join('\n');
  }

  /**
   * Format row data for clipboard (used when copying selected rows).
   */
  formatRowsForClipboard(
    rows: Row[],
    columns: ColumnDef[],
    rowIndices: number[],
    options?: { includeHeaders?: boolean },
  ): string {
    const parts: string[] = [];
    const withHeaders = options?.includeHeaders ?? this.#includeHeaders;

    if (withHeaders) {
      parts.push(columns.map((c) => c.header || c.field).join(this.#separator));
    }

    for (const idx of rowIndices) {
      const row = rows[idx];
      if (!row) continue;
      const cells: string[] = [];
      for (const col of columns) {
        const raw = row[col.field];
        const value = this.#processCell(raw, row, col.field, idx, col);
        cells.push(value);
      }
      parts.push(cells.join(this.#separator));
    }

    return parts.join('\n');
  }

  /**
   * Parse clipboard text into a 2D array.
   * Handles tab-separated and comma-separated values.
   */
  parseClipboardText(text: string): string[][] {
    if (!text) return [];

    const lines = text.split(/\r?\n/);
    // Remove trailing empty line (common in clipboard data)
    if (lines.length > 0 && lines[lines.length - 1] === '') {
      lines.pop();
    }

    return lines.map((line) => {
      // Try tab first (spreadsheet standard), then fall back to comma
      if (line.includes(this.#separator)) {
        return line.split(this.#separator);
      }
      return line.split(this.#separator);
    });
  }

  /**
   * Apply parsed clipboard data starting at a given cell position.
   * Returns the list of changes for undo support.
   */
  applyPaste(
    data: string[][],
    rows: Row[],
    columns: ColumnDef[],
    startRowIndex: number,
    startField: string,
  ): PasteResult {
    if (this.#suppressPaste) return { changes: [] };

    const startColIndex = columns.findIndex((c) => c.field === startField);
    if (startColIndex === -1) return { changes: [] };

    const changes: PasteResult['changes'] = [];

    for (let r = 0; r < data.length; r++) {
      const targetRow = startRowIndex + r;
      if (targetRow >= rows.length) break;

      const row = rows[targetRow];
      const pasteRow = data[r];

      for (let c = 0; c < pasteRow.length; c++) {
        const targetCol = startColIndex + c;
        if (targetCol >= columns.length) break;

        const col = columns[targetCol];
        // Skip non-editable columns
        if (col.editable === false) continue;

        const oldValue = row[col.field];
        const newValue = this.#coerceValue(pasteRow[c], col);

        changes.push({
          rowIndex: targetRow,
          field: col.field,
          oldValue,
          newValue,
        });
      }
    }

    return { changes };
  }

  /**
   * Copy text to the system clipboard.
   * Returns true if successful, false otherwise.
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Read text from the system clipboard.
   */
  async readFromClipboard(): Promise<string | null> {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        return await navigator.clipboard.readText();
      }
      return null;
    } catch {
      return null;
    }
  }

  #processCell(
    value: unknown,
    row: Row,
    field: string,
    rowIndex: number,
    column: ColumnDef,
  ): string {
    if (this.#processCellCallback) {
      return this.#processCellCallback({ value, row, field, rowIndex, column });
    }
    return value == null ? '' : String(value);
  }

  #coerceValue(value: string, column: ColumnDef): unknown {
    if (column.type === 'number') {
      const num = Number(value);
      return Number.isNaN(num) ? value : num;
    }
    if (column.type === 'boolean') {
      return value === 'true' || value === '1';
    }
    return value;
  }
}
