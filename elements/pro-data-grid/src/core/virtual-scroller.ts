/**
 * Virtual scrolling engine for rendering only visible rows + buffer.
 *
 * Maintains a viewport window over the full dataset. Only rows within
 * the visible range (plus a configurable buffer) are rendered to DOM.
 * Uses fixed row height for O(1) scroll-to-index and position calculations.
 */

import type { VisibleRange, ScrollState } from '../types.js';

export interface VirtualScrollerOptions {
  rowHeight: number;
  viewportHeight: number;
  totalRows: number;
  /** Buffer multiplier — renders this many viewports above and below (default 1) */
  bufferMultiplier?: number;
}

export class VirtualScroller {
  #rowHeight: number;
  #viewportHeight: number;
  #totalRows: number;
  #bufferMultiplier: number;
  #scrollTop = 0;

  constructor(options: VirtualScrollerOptions) {
    this.#rowHeight = options.rowHeight;
    this.#viewportHeight = options.viewportHeight;
    this.#totalRows = options.totalRows;
    this.#bufferMultiplier = options.bufferMultiplier ?? 1;
  }

  get rowHeight(): number {
    return this.#rowHeight;
  }

  set rowHeight(value: number) {
    this.#rowHeight = value;
  }

  get viewportHeight(): number {
    return this.#viewportHeight;
  }

  set viewportHeight(value: number) {
    this.#viewportHeight = value;
  }

  get totalRows(): number {
    return this.#totalRows;
  }

  set totalRows(value: number) {
    this.#totalRows = value;
  }

  get scrollTop(): number {
    return this.#scrollTop;
  }

  set scrollTop(value: number) {
    this.#scrollTop = Math.max(0, Math.min(value, this.totalContentHeight - this.#viewportHeight));
  }

  get totalContentHeight(): number {
    return this.#totalRows * this.#rowHeight;
  }

  get visibleRowCount(): number {
    return Math.ceil(this.#viewportHeight / this.#rowHeight);
  }

  get bufferRowCount(): number {
    return Math.ceil(this.visibleRowCount * this.#bufferMultiplier);
  }

  /**
   * Calculate which rows are visible given the current scroll position.
   * Returns the start/end indices and the pixel offset for the first rendered row.
   */
  getVisibleRange(): VisibleRange {
    if (this.#totalRows === 0) {
      return { startIndex: 0, endIndex: 0, startOffset: 0 };
    }

    const firstVisibleRow = Math.floor(this.#scrollTop / this.#rowHeight);
    const bufferStart = Math.max(0, firstVisibleRow - this.bufferRowCount);
    const bufferEnd = Math.min(
      this.#totalRows - 1,
      firstVisibleRow + this.visibleRowCount + this.bufferRowCount,
    );

    return {
      startIndex: bufferStart,
      endIndex: bufferEnd,
      startOffset: bufferStart * this.#rowHeight,
    };
  }

  /**
   * Get the scroll position needed to bring a specific row into view.
   */
  getScrollTopForRow(index: number): number {
    const rowTop = index * this.#rowHeight;
    const rowBottom = rowTop + this.#rowHeight;

    // Already in viewport
    if (rowTop >= this.#scrollTop && rowBottom <= this.#scrollTop + this.#viewportHeight) {
      return this.#scrollTop;
    }

    // Scroll up to show row at top
    if (rowTop < this.#scrollTop) {
      return rowTop;
    }

    // Scroll down to show row at bottom
    return rowBottom - this.#viewportHeight;
  }

  /**
   * Get the row index at a given pixel offset from the top.
   */
  getRowIndexAtOffset(offset: number): number {
    return Math.floor(offset / this.#rowHeight);
  }

  /**
   * Get the pixel offset (top position) of a row.
   */
  getRowOffset(index: number): number {
    return index * this.#rowHeight;
  }

  /**
   * Create a scroll state snapshot.
   */
  getScrollState(): ScrollState {
    return {
      scrollTop: this.#scrollTop,
      scrollLeft: 0,
      viewportHeight: this.#viewportHeight,
      viewportWidth: 0,
    };
  }
}
