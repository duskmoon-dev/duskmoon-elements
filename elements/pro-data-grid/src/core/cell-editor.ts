/**
 * Cell editor — manages inline cell editing lifecycle.
 *
 * Supports text, number, select, date, and checkbox editor types.
 * Handles start/stop editing, value parsing, validation,
 * and Tab navigation between editable cells.
 */

import type { Row, ColumnDef, ValidatorParams, CellChange } from '../types.js';

export type EditorType = 'text' | 'number' | 'select' | 'date' | 'checkbox';

export interface EditingState {
  rowIndex: number;
  field: string;
  editorType: EditorType;
  originalValue: unknown;
  currentValue: unknown;
  isValid: boolean;
  validationMessage: string;
}

export interface CellEditorOptions {
  stopEditingWhenCellsLoseFocus?: boolean;
  singleClickEdit?: boolean;
  undoRedoCellEditing?: boolean;
}

export class CellEditor {
  #editing: EditingState | null = null;
  #options: CellEditorOptions;

  constructor(options: CellEditorOptions = {}) {
    this.#options = {
      stopEditingWhenCellsLoseFocus: true,
      singleClickEdit: false,
      undoRedoCellEditing: true,
      ...options,
    };
  }

  get isEditing(): boolean {
    return this.#editing !== null;
  }

  get editingState(): EditingState | null {
    return this.#editing ? { ...this.#editing } : null;
  }

  get options(): CellEditorOptions {
    return { ...this.#options };
  }

  set options(value: CellEditorOptions) {
    this.#options = { ...this.#options, ...value };
  }

  /**
   * Start editing a cell. Returns the initial editing state.
   */
  startEditing(
    row: Row,
    rowIndex: number,
    column: ColumnDef,
    keyChar?: string,
  ): EditingState | null {
    const field = column.field;

    // Check if column is editable
    if (!this.#isEditable(row, column, rowIndex)) return null;

    const editorType = this.#resolveEditorType(column);
    const originalValue = row[field];

    // If a printable key triggered editing, use it as the initial value
    const currentValue =
      keyChar && editorType !== 'checkbox' && editorType !== 'select' ? keyChar : originalValue;

    this.#editing = {
      rowIndex,
      field,
      editorType,
      originalValue,
      currentValue,
      isValid: true,
      validationMessage: '',
    };

    return { ...this.#editing };
  }

  /**
   * Update the current edit value.
   */
  setValue(value: unknown): void {
    if (!this.#editing) return;
    this.#editing.currentValue = value;
  }

  /**
   * Validate the current edit value against the column validator.
   */
  validate(row: Row, column: ColumnDef): { isValid: boolean; message: string } {
    if (!this.#editing) return { isValid: true, message: '' };

    if (!column.validator) {
      this.#editing.isValid = true;
      this.#editing.validationMessage = '';
      return { isValid: true, message: '' };
    }

    const params: ValidatorParams = {
      value: this.#editing.currentValue,
      oldValue: this.#editing.originalValue,
      row,
      field: this.#editing.field,
    };

    const result = column.validator(params);

    if (result === true) {
      this.#editing.isValid = true;
      this.#editing.validationMessage = '';
      return { isValid: true, message: '' };
    }

    const message = typeof result === 'string' ? result : 'Invalid value';
    this.#editing.isValid = false;
    this.#editing.validationMessage = message;
    return { isValid: false, message };
  }

  /**
   * Stop editing and return the change if value was modified.
   * Returns null if no change was made or validation failed.
   */
  stopEditing(cancel = false): CellChange | null {
    if (!this.#editing) return null;

    const state = this.#editing;
    this.#editing = null;

    if (cancel) return null;
    if (!state.isValid) return null;

    // Parse value to correct type
    const parsedValue = this.#parseValue(state.currentValue, state.editorType);

    // No change if values are the same
    if (parsedValue === state.originalValue) return null;

    return {
      rowIndex: state.rowIndex,
      field: state.field,
      oldValue: state.originalValue,
      newValue: parsedValue,
    };
  }

  /**
   * Cancel current editing.
   */
  cancelEditing(): void {
    this.#editing = null;
  }

  /**
   * Get the HTML for the inline editor.
   */
  renderEditor(column: ColumnDef): string {
    if (!this.#editing) return '';

    const { editorType, currentValue } = this.#editing;
    const escaped = this.#escapeAttr(String(currentValue ?? ''));

    switch (editorType) {
      case 'text':
        return `<input class="grid-cell-editor grid-cell-editor-text" type="text" value="${escaped}" data-editor />`;
      case 'number':
        return `<input class="grid-cell-editor grid-cell-editor-number" type="number" value="${escaped}" data-editor />`;
      case 'date':
        return `<input class="grid-cell-editor grid-cell-editor-date" type="date" value="${escaped}" data-editor />`;
      case 'select': {
        const options = column.editorOptions ?? column.filterOptions ?? [];
        const optionsHtml = options
          .map(
            (opt) =>
              `<option value="${this.#escapeAttr(String(opt))}" ${String(opt) === String(currentValue) ? 'selected' : ''}>${this.#escapeHtml(String(opt))}</option>`,
          )
          .join('');
        return `<select class="grid-cell-editor grid-cell-editor-select" data-editor>${optionsHtml}</select>`;
      }
      case 'checkbox':
        return `<input class="grid-cell-editor grid-cell-editor-checkbox" type="checkbox" ${currentValue ? 'checked' : ''} data-editor />`;
      default:
        return `<input class="grid-cell-editor grid-cell-editor-text" type="text" value="${escaped}" data-editor />`;
    }
  }

  /**
   * Find the next editable cell for Tab navigation.
   */
  findNextEditableCell(
    currentRowIndex: number,
    currentColIndex: number,
    columns: ColumnDef[],
    rows: Row[],
    direction: 'forward' | 'backward',
  ): { rowIndex: number; colIndex: number } | null {
    const step = direction === 'forward' ? 1 : -1;
    let rowIdx = currentRowIndex;
    let colIdx = currentColIndex + step;

    const maxIterations = rows.length * columns.length;
    let iterations = 0;

    while (iterations < maxIterations) {
      // Wrap column index
      if (colIdx >= columns.length) {
        colIdx = 0;
        rowIdx++;
      } else if (colIdx < 0) {
        colIdx = columns.length - 1;
        rowIdx--;
      }

      // Check bounds
      if (rowIdx < 0 || rowIdx >= rows.length) return null;

      const col = columns[colIdx];
      if (col && this.#isEditable(rows[rowIdx], col, rowIdx)) {
        return { rowIndex: rowIdx, colIndex: colIdx };
      }

      colIdx += step;
      iterations++;
    }

    return null;
  }

  #isEditable(row: Row, column: ColumnDef, rowIndex: number): boolean {
    if (column.editable === false || column.editable === undefined) return false;
    if (typeof column.editable === 'function') {
      return column.editable({ row, field: column.field, rowIndex });
    }
    return true;
  }

  #resolveEditorType(column: ColumnDef): EditorType {
    if (column.editor) return column.editor as EditorType;
    switch (column.type) {
      case 'number':
        return 'number';
      case 'date':
        return 'date';
      case 'boolean':
        return 'checkbox';
      default:
        return 'text';
    }
  }

  #parseValue(value: unknown, editorType: EditorType): unknown {
    if (value == null) return null;
    switch (editorType) {
      case 'number': {
        const num = Number(value);
        return Number.isNaN(num) ? value : num;
      }
      case 'checkbox':
        return Boolean(value);
      default:
        return value;
    }
  }

  #escapeAttr(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  #escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
