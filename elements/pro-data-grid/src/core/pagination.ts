/**
 * Pagination state manager.
 *
 * Handles page navigation, page size changes, and provides
 * the row slice for the current page. Works for both client-side
 * and server-side pagination modes.
 */

import type { Row } from '../types.js';

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalRows: number;
  totalPages: number;
}

export class Pagination {
  #currentPage = 1;
  #pageSize: number;
  #totalRows = 0;

  constructor(pageSize = 50) {
    this.#pageSize = pageSize;
  }

  get currentPage(): number {
    return this.#currentPage;
  }

  set currentPage(value: number) {
    this.#currentPage = Math.max(1, Math.min(value, this.totalPages || 1));
  }

  get pageSize(): number {
    return this.#pageSize;
  }

  set pageSize(value: number) {
    this.#pageSize = Math.max(1, value);
    // Reset to page 1 when page size changes, or clamp to last valid page
    if (this.#currentPage > this.totalPages) {
      this.#currentPage = Math.max(1, this.totalPages);
    }
  }

  get totalRows(): number {
    return this.#totalRows;
  }

  set totalRows(value: number) {
    this.#totalRows = Math.max(0, value);
    if (this.#currentPage > this.totalPages) {
      this.#currentPage = Math.max(1, this.totalPages);
    }
  }

  get totalPages(): number {
    return Math.ceil(this.#totalRows / this.#pageSize);
  }

  get startRow(): number {
    return (this.#currentPage - 1) * this.#pageSize;
  }

  get endRow(): number {
    return Math.min(this.startRow + this.#pageSize, this.#totalRows);
  }

  get isFirstPage(): boolean {
    return this.#currentPage === 1;
  }

  get isLastPage(): boolean {
    return this.#currentPage >= this.totalPages;
  }

  /**
   * Slice rows for the current page (client-side pagination).
   */
  getPageRows(rows: Row[]): Row[] {
    return rows.slice(this.startRow, this.endRow);
  }

  /**
   * Navigate to a specific page.
   */
  goToPage(page: number): void {
    this.currentPage = page;
  }

  /**
   * Go to the next page.
   */
  nextPage(): void {
    if (!this.isLastPage) {
      this.#currentPage++;
    }
  }

  /**
   * Go to the previous page.
   */
  prevPage(): void {
    if (!this.isFirstPage) {
      this.#currentPage--;
    }
  }

  /**
   * Go to the first page.
   */
  firstPage(): void {
    this.#currentPage = 1;
  }

  /**
   * Go to the last page.
   */
  lastPage(): void {
    this.#currentPage = this.totalPages;
  }

  /**
   * Get the current pagination state snapshot.
   */
  getState(): PaginationState {
    return {
      currentPage: this.#currentPage,
      pageSize: this.#pageSize,
      totalRows: this.#totalRows,
      totalPages: this.totalPages,
    };
  }

  /**
   * Get the page numbers to display (with ellipsis logic).
   * Returns an array of page numbers and -1 for ellipsis.
   */
  getPageNumbers(maxVisible = 7): number[] {
    const total = this.totalPages;
    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: number[] = [1];
    const current = this.#currentPage;
    const half = Math.floor((maxVisible - 2) / 2);
    let start = Math.max(2, current - half);
    let end = Math.min(total - 1, current + half);

    // Adjust if near boundaries
    if (current <= half + 1) {
      end = maxVisible - 2;
    } else if (current >= total - half) {
      start = total - maxVisible + 3;
    }

    if (start > 2) pages.push(-1); // ellipsis
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push(-1); // ellipsis
    pages.push(total);

    return pages;
  }
}
