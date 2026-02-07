/**
 * Row styling and advanced row features — row numbers, variable heights,
 * full-width rows, row classes/styles.
 */

import type { Row, ColumnDef } from '../types.js';

// ─── Public Types ────────────────────────────

export interface RowStylingConfig {
  getRowClass?: (params: RowClassParams) => string;
  getRowStyle?: (params: RowStyleParams) => Record<string, string>;
  getRowHeight?: (params: RowHeightParams) => number;
  isFullWidthRow?: (row: Row) => boolean;
  fullWidthRenderer?: (row: Row) => string | HTMLElement;
  showRowNumbers?: boolean;
  animateRows?: boolean;
}

export interface RowClassParams {
  row: Row;
  rowIndex: number;
  data: Row;
}

export interface RowStyleParams {
  row: Row;
  rowIndex: number;
  data: Row;
}

export interface RowHeightParams {
  row: Row;
  rowIndex: number;
}

// ─── RowStyling Class ────────────────────────

export class RowStyling {
  #getRowClass: RowStylingConfig['getRowClass'] = undefined;
  #getRowStyle: RowStylingConfig['getRowStyle'] = undefined;
  #getRowHeight: RowStylingConfig['getRowHeight'] = undefined;
  #isFullWidthRow: RowStylingConfig['isFullWidthRow'] = undefined;
  #fullWidthRenderer: RowStylingConfig['fullWidthRenderer'] = undefined;
  #showRowNumbers = false;
  #animateRows = false;

  get showRowNumbers(): boolean {
    return this.#showRowNumbers;
  }

  set showRowNumbers(value: boolean) {
    this.#showRowNumbers = value;
  }

  get animateRows(): boolean {
    return this.#animateRows;
  }

  set animateRows(value: boolean) {
    this.#animateRows = value;
  }

  configure(config: RowStylingConfig): void {
    if (config.getRowClass !== undefined) this.#getRowClass = config.getRowClass;
    if (config.getRowStyle !== undefined) this.#getRowStyle = config.getRowStyle;
    if (config.getRowHeight !== undefined) this.#getRowHeight = config.getRowHeight;
    if (config.isFullWidthRow !== undefined) this.#isFullWidthRow = config.isFullWidthRow;
    if (config.fullWidthRenderer !== undefined) this.#fullWidthRenderer = config.fullWidthRenderer;
    if (config.showRowNumbers !== undefined) this.#showRowNumbers = config.showRowNumbers;
    if (config.animateRows !== undefined) this.#animateRows = config.animateRows;
  }

  /**
   * Get CSS class string for a row.
   */
  getRowClass(row: Row, rowIndex: number): string {
    if (!this.#getRowClass) return '';
    return this.#getRowClass({ row, rowIndex, data: row });
  }

  /**
   * Get inline style object for a row.
   */
  getRowStyle(row: Row, rowIndex: number): Record<string, string> {
    if (!this.#getRowStyle) return {};
    return this.#getRowStyle({ row, rowIndex, data: row });
  }

  /**
   * Get height for a specific row (variable row heights).
   * Returns undefined if using default height.
   */
  getRowHeight(row: Row, rowIndex: number): number | undefined {
    if (!this.#getRowHeight) return undefined;
    return this.#getRowHeight({ row, rowIndex });
  }

  /**
   * Check if a row should be rendered as full-width.
   */
  isFullWidthRow(row: Row): boolean {
    if (!this.#isFullWidthRow) return false;
    return this.#isFullWidthRow(row);
  }

  /**
   * Render full-width row content.
   */
  renderFullWidthRow(row: Row): string | HTMLElement {
    if (!this.#fullWidthRenderer) return '';
    return this.#fullWidthRenderer(row);
  }

  /**
   * Generate the row number column definition.
   */
  getRowNumberColumn(): ColumnDef {
    return {
      field: '__rowNumber',
      header: '#',
      width: 60,
      minWidth: 40,
      maxWidth: 80,
      sortable: false,
      filterable: false,
      editable: false,
      resizable: false,
      lockPosition: true,
      type: 'number',
      align: 'center',
    };
  }

  /**
   * Convert inline style object to CSS string.
   */
  styleToString(style: Record<string, string>): string {
    return Object.entries(style)
      .map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}:${value}`;
      })
      .join(';');
  }

  /**
   * Compute cumulative row offsets for variable row heights.
   * Returns array of top positions for each row.
   */
  computeRowOffsets(
    rows: Row[],
    defaultHeight: number,
  ): { offsets: number[]; totalHeight: number } {
    const offsets: number[] = [];
    let cumulative = 0;

    for (let i = 0; i < rows.length; i++) {
      offsets.push(cumulative);
      const h = this.getRowHeight(rows[i], i) ?? defaultHeight;
      cumulative += h;
    }

    return { offsets, totalHeight: cumulative };
  }
}
