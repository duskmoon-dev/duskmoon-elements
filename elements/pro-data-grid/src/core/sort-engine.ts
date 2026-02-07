/**
 * Client-side sort engine.
 *
 * Supports single and multi-column sorting with locale-aware string
 * comparison, numeric sorting, date sorting, and custom comparators.
 */

import type { Row, SortItem, ColumnDef } from '../types.js';

export class SortEngine {
  #collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });

  /**
   * Sort an array of rows according to the sort model.
   * Returns a new sorted array (does not mutate the input).
   */
  sort(rows: Row[], sortModel: SortItem[], columns: ColumnDef[]): Row[] {
    if (sortModel.length === 0) return rows;

    const columnMap = new Map(columns.map((c) => [c.field, c]));
    const sorted = [...rows];

    sorted.sort((a, b) => {
      for (const sortItem of sortModel) {
        const col = columnMap.get(sortItem.field);
        const result = this.#compare(a, b, sortItem, col);
        if (result !== 0) return result;
      }
      return 0;
    });

    return sorted;
  }

  /**
   * Advance sort direction through the cycle: null → asc → desc → null
   */
  nextSortDirection(current: 'asc' | 'desc' | null): 'asc' | 'desc' | null {
    if (current === null) return 'asc';
    if (current === 'asc') return 'desc';
    return null;
  }

  /**
   * Update a sort model for single-column sort (replaces existing).
   */
  updateSortModel(current: SortItem[], field: string, multiSort: boolean): SortItem[] {
    const existing = current.find((s) => s.field === field);
    const nextDir = this.nextSortDirection(existing?.direction ?? null);

    if (multiSort) {
      // Remove existing entry for this field, then add new if direction is not null
      const without = current.filter((s) => s.field !== field);
      if (nextDir === null) return without;
      return [...without, { field, direction: nextDir }];
    }

    // Single sort — replace entire model
    if (nextDir === null) return [];
    return [{ field, direction: nextDir }];
  }

  #compare(a: Row, b: Row, sortItem: SortItem, column?: ColumnDef): number {
    const valA = a[sortItem.field];
    const valB = b[sortItem.field];
    const isDesc = sortItem.direction === 'desc';

    // Custom comparator
    if (column?.comparator) {
      const result = column.comparator(valA, valB, a, b, isDesc);
      return isDesc ? -result : result;
    }

    let result: number;

    // Null/undefined handling — nulls always sort last
    if (valA == null && valB == null) return 0;
    if (valA == null) return 1;
    if (valB == null) return -1;

    // Type-based comparison
    const type = column?.type ?? 'text';
    switch (type) {
      case 'number':
        result = (Number(valA) || 0) - (Number(valB) || 0);
        break;
      case 'date':
        result = new Date(String(valA)).getTime() - new Date(String(valB)).getTime();
        break;
      case 'boolean':
        result = (valA === true ? 1 : 0) - (valB === true ? 1 : 0);
        break;
      default:
        result = this.#collator.compare(String(valA), String(valB));
    }

    return isDesc ? -result : result;
  }
}
