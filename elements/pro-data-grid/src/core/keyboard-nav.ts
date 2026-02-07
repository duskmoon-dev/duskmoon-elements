/**
 * Keyboard navigation controller.
 *
 * Implements ARIA grid keyboard patterns: arrow keys, Home/End,
 * Ctrl+Home/End, Page Up/Down, Enter/F2 for edit, Space for select.
 */

export interface GridPosition {
  rowIndex: number;
  colIndex: number;
}

export interface KeyboardNavOptions {
  rowCount: number;
  colCount: number;
  pageSize: number;
  onNavigate: (position: GridPosition) => void;
  onActivate: (position: GridPosition) => void;
  onSelect: (position: GridPosition) => void;
  onEscape: () => void;
}

export class KeyboardNav {
  #position: GridPosition = { rowIndex: 0, colIndex: 0 };
  #options: KeyboardNavOptions;

  constructor(options: KeyboardNavOptions) {
    this.#options = options;
  }

  get position(): GridPosition {
    return { ...this.#position };
  }

  set position(pos: GridPosition) {
    this.#position = {
      rowIndex: this.#clampRow(pos.rowIndex),
      colIndex: this.#clampCol(pos.colIndex),
    };
  }

  updateBounds(rowCount: number, colCount: number): void {
    this.#options.rowCount = rowCount;
    this.#options.colCount = colCount;
    this.#position.rowIndex = this.#clampRow(this.#position.rowIndex);
    this.#position.colIndex = this.#clampCol(this.#position.colIndex);
  }

  handleKeyDown(event: KeyboardEvent): boolean {
    const { key, ctrlKey, metaKey, shiftKey } = event;
    const ctrl = ctrlKey || metaKey;
    let handled = true;

    switch (key) {
      case 'ArrowUp':
        this.#move(-1, 0);
        break;
      case 'ArrowDown':
        this.#move(1, 0);
        break;
      case 'ArrowLeft':
        this.#move(0, -1);
        break;
      case 'ArrowRight':
        this.#move(0, 1);
        break;
      case 'Home':
        if (ctrl) {
          this.#moveTo(0, 0);
        } else {
          this.#moveTo(this.#position.rowIndex, 0);
        }
        break;
      case 'End':
        if (ctrl) {
          this.#moveTo(this.#options.rowCount - 1, this.#options.colCount - 1);
        } else {
          this.#moveTo(this.#position.rowIndex, this.#options.colCount - 1);
        }
        break;
      case 'PageUp':
        this.#move(-this.#options.pageSize, 0);
        break;
      case 'PageDown':
        this.#move(this.#options.pageSize, 0);
        break;
      case 'Enter':
      case 'F2':
        this.#options.onActivate(this.position);
        break;
      case ' ':
        if (!shiftKey) {
          this.#options.onSelect(this.position);
        }
        break;
      case 'Escape':
        this.#options.onEscape();
        break;
      case 'Tab':
        // Tab moves to next cell, Shift+Tab to previous
        if (shiftKey) {
          this.#movePrev();
        } else {
          this.#moveNext();
        }
        break;
      default:
        handled = false;
    }

    if (handled) {
      event.preventDefault();
    }
    return handled;
  }

  #move(deltaRow: number, deltaCol: number): void {
    const newRow = this.#clampRow(this.#position.rowIndex + deltaRow);
    const newCol = this.#clampCol(this.#position.colIndex + deltaCol);
    this.#position = { rowIndex: newRow, colIndex: newCol };
    this.#options.onNavigate(this.position);
  }

  #moveTo(row: number, col: number): void {
    this.#position = { rowIndex: this.#clampRow(row), colIndex: this.#clampCol(col) };
    this.#options.onNavigate(this.position);
  }

  #moveNext(): void {
    let { rowIndex, colIndex } = this.#position;
    colIndex++;
    if (colIndex >= this.#options.colCount) {
      colIndex = 0;
      rowIndex++;
    }
    if (rowIndex < this.#options.rowCount) {
      this.#position = { rowIndex, colIndex };
      this.#options.onNavigate(this.position);
    }
  }

  #movePrev(): void {
    let { rowIndex, colIndex } = this.#position;
    colIndex--;
    if (colIndex < 0) {
      colIndex = this.#options.colCount - 1;
      rowIndex--;
    }
    if (rowIndex >= 0) {
      this.#position = { rowIndex, colIndex };
      this.#options.onNavigate(this.position);
    }
  }

  #clampRow(row: number): number {
    return Math.max(0, Math.min(this.#options.rowCount - 1, row));
  }

  #clampCol(col: number): number {
    return Math.max(0, Math.min(this.#options.colCount - 1, col));
  }
}
