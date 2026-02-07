/**
 * Find bar engine — Ctrl+F search across grid cells.
 *
 * Searches all visible columns, highlights matches,
 * and supports navigation between matches.
 */

import type { Row, ColumnDef } from '../types.js';

// ─── Public Types ────────────────────────────

export interface FindMatch {
  rowIndex: number;
  field: string;
  startIndex: number;
  endIndex: number;
}

export interface FindBarState {
  open: boolean;
  searchText: string;
  caseSensitive: boolean;
  matches: FindMatch[];
  currentMatchIndex: number;
}

// ─── FindBar Class ───────────────────────────

export class FindBar {
  #open = false;
  #searchText = '';
  #caseSensitive = false;
  #matches: FindMatch[] = [];
  #currentMatchIndex = -1;

  get isOpen(): boolean {
    return this.#open;
  }

  get searchText(): string {
    return this.#searchText;
  }

  get caseSensitive(): boolean {
    return this.#caseSensitive;
  }

  set caseSensitive(value: boolean) {
    this.#caseSensitive = value;
  }

  get matchCount(): number {
    return this.#matches.length;
  }

  get currentMatchIndex(): number {
    return this.#currentMatchIndex;
  }

  get currentMatch(): FindMatch | null {
    if (this.#currentMatchIndex < 0 || this.#currentMatchIndex >= this.#matches.length) {
      return null;
    }
    return this.#matches[this.#currentMatchIndex];
  }

  get matches(): FindMatch[] {
    return [...this.#matches];
  }

  get state(): FindBarState {
    return {
      open: this.#open,
      searchText: this.#searchText,
      caseSensitive: this.#caseSensitive,
      matches: [...this.#matches],
      currentMatchIndex: this.#currentMatchIndex,
    };
  }

  /**
   * Open the find bar.
   */
  open(): void {
    this.#open = true;
  }

  /**
   * Close the find bar and clear results.
   */
  close(): void {
    this.#open = false;
    this.#searchText = '';
    this.#matches = [];
    this.#currentMatchIndex = -1;
  }

  /**
   * Search across all visible columns for the given text.
   */
  search(text: string, rows: Row[], columns: ColumnDef[]): FindMatch[] {
    this.#searchText = text;
    this.#matches = [];
    this.#currentMatchIndex = -1;

    if (!text) return [];

    const visibleCols = columns.filter((c) => !c.hidden);
    const needle = this.#caseSensitive ? text : text.toLowerCase();

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      for (const col of visibleCols) {
        const value = row[col.field];
        if (value == null) continue;

        const str = String(value);
        const haystack = this.#caseSensitive ? str : str.toLowerCase();
        let pos = 0;

        while (pos < haystack.length) {
          const idx = haystack.indexOf(needle, pos);
          if (idx === -1) break;

          this.#matches.push({
            rowIndex: r,
            field: col.field,
            startIndex: idx,
            endIndex: idx + needle.length,
          });

          pos = idx + 1;
        }
      }
    }

    if (this.#matches.length > 0) {
      this.#currentMatchIndex = 0;
    }

    return this.#matches;
  }

  /**
   * Navigate to the next match.
   */
  nextMatch(): FindMatch | null {
    if (this.#matches.length === 0) return null;
    this.#currentMatchIndex = (this.#currentMatchIndex + 1) % this.#matches.length;
    return this.#matches[this.#currentMatchIndex];
  }

  /**
   * Navigate to the previous match.
   */
  previousMatch(): FindMatch | null {
    if (this.#matches.length === 0) return null;
    this.#currentMatchIndex =
      (this.#currentMatchIndex - 1 + this.#matches.length) % this.#matches.length;
    return this.#matches[this.#currentMatchIndex];
  }

  /**
   * Check if a specific cell contains any match.
   */
  hasMatch(rowIndex: number, field: string): boolean {
    return this.#matches.some((m) => m.rowIndex === rowIndex && m.field === field);
  }

  /**
   * Check if a specific cell contains the current match.
   */
  isCurrentMatch(rowIndex: number, field: string): boolean {
    const match = this.currentMatch;
    if (!match) return false;
    return match.rowIndex === rowIndex && match.field === field;
  }

  /**
   * Get all matches in a specific cell.
   */
  getMatchesInCell(rowIndex: number, field: string): FindMatch[] {
    return this.#matches.filter((m) => m.rowIndex === rowIndex && m.field === field);
  }

  /**
   * Render the find bar as HTML.
   */
  render(): string {
    if (!this.#open) return '';

    const countText =
      this.#matches.length > 0
        ? `${this.#currentMatchIndex + 1} of ${this.#matches.length}`
        : this.#searchText
          ? 'No matches'
          : '';

    return `<div class="grid-find-bar">
      <input type="text" class="find-bar-input" value="${this.#escapeAttr(this.#searchText)}"
        placeholder="Find..." />
      <span class="find-bar-count">${countText}</span>
      <button class="find-bar-btn find-bar-prev" title="Previous (Shift+Enter)">&#9650;</button>
      <button class="find-bar-btn find-bar-next" title="Next (Enter)">&#9660;</button>
      <label class="find-bar-case">
        <input type="checkbox" ${this.#caseSensitive ? 'checked' : ''} /> Aa
      </label>
      <button class="find-bar-btn find-bar-close" title="Close (Escape)">&#10005;</button>
    </div>`;
  }

  #escapeAttr(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
