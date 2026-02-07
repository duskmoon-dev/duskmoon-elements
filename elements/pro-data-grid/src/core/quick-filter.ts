/**
 * Quick filter — global text search across all columns.
 *
 * Converts a search term into a fast row-level matching function
 * that checks all visible column values. Case-insensitive by default.
 */

import type { Row, ColumnDef } from '../types.js';

export class QuickFilter {
  #text = '';
  #cacheKey = '';
  #cachedFn: ((row: Row) => boolean) | null = null;

  get text(): string {
    return this.#text;
  }

  set text(value: string) {
    this.#text = value;
  }

  /**
   * Apply the quick filter to the dataset.
   * Returns filtered rows (does not mutate input).
   */
  filter(rows: Row[], columns: ColumnDef[]): Row[] {
    const term = this.#text.trim().toLowerCase();
    if (!term) return rows;

    const fields = columns.filter((c) => !c.hidden).map((c) => c.field);

    // Cache the match function when the term hasn't changed
    if (term !== this.#cacheKey) {
      this.#cacheKey = term;
      this.#cachedFn = this.#buildMatcher(term, fields);
    }

    return rows.filter(this.#cachedFn!);
  }

  #buildMatcher(term: string, fields: string[]): (row: Row) => boolean {
    // Support space-separated AND terms: "alice active" matches rows containing both
    const terms = term.split(/\s+/).filter(Boolean);
    if (terms.length === 0) return () => true;

    return (row: Row) => {
      // Build a single string of all field values for this row
      const rowText = fields
        .map((f) => {
          const val = row[f];
          return val == null ? '' : String(val);
        })
        .join('\0')
        .toLowerCase();

      // Every term must appear somewhere in the row
      return terms.every((t) => rowText.includes(t));
    };
  }

  /**
   * Get unique values for a specific column (for set filter suggestions).
   */
  getUniqueValues(rows: Row[], field: string): unknown[] {
    const seen = new Set<unknown>();
    const result: unknown[] = [];
    for (const row of rows) {
      const val = row[field];
      if (!seen.has(val)) {
        seen.add(val);
        result.push(val);
      }
    }
    return result;
  }
}
