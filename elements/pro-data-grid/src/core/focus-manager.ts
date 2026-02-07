/**
 * Focus manager using roving tabindex pattern.
 *
 * Ensures only one cell in the grid has tabindex="0" at a time.
 * All other cells have tabindex="-1". This lets the grid behave
 * as a single tab stop while supporting arrow-key navigation inside.
 */

export class FocusManager {
  #container: HTMLElement | null = null;
  #activeSelector = '[data-grid-cell]';

  attach(container: HTMLElement): void {
    this.#container = container;
  }

  detach(): void {
    this.#container = null;
  }

  /**
   * Set focus on a cell by row and column indices.
   */
  focusCell(rowIndex: number, colIndex: number): void {
    if (!this.#container) return;

    // Remove tabindex from all cells
    const allCells = this.#container.querySelectorAll(this.#activeSelector);
    for (const cell of allCells) {
      (cell as HTMLElement).setAttribute('tabindex', '-1');
    }

    // Set tabindex on target cell and focus it
    const target = this.#container.querySelector(
      `[data-row-index="${rowIndex}"][data-col-index="${colIndex}"]`,
    ) as HTMLElement | null;

    if (target) {
      target.setAttribute('tabindex', '0');
      target.focus();
    }
  }

  /**
   * Ensure the grid container itself is focusable as a fallback.
   */
  ensureGridFocusable(): void {
    if (!this.#container) return;
    if (!this.#container.hasAttribute('tabindex')) {
      this.#container.setAttribute('tabindex', '0');
    }
  }
}
