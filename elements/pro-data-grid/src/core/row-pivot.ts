/**
 * Row pivot engine — turns column values into dynamic columns.
 *
 * In pivot mode, one or more pivot columns have their distinct values
 * turned into new column headers. Combined with row grouping and
 * aggregation, this provides Excel-like pivot table functionality.
 */

import type { Row, ColumnDef } from '../types.js';
import type { AggFunc } from './row-grouping.js';

// ─── Public Types ────────────────────────────

export interface PivotConfig {
  pivotColumns: string[];
  valueColumns: { field: string; aggFunc: AggFunc }[];
}

export interface PivotResult {
  columns: ColumnDef[];
  rows: Row[];
  pivotKeys: string[];
}

// ─── Built-in Agg (shared logic) ─────────────

const AGG_FNS: Record<string, (values: unknown[]) => unknown> = {
  sum: (values) => {
    let t = 0;
    for (const v of values) {
      const n = Number(v);
      if (!Number.isNaN(n)) t += n;
    }
    return t;
  },
  avg: (values) => {
    let t = 0;
    let c = 0;
    for (const v of values) {
      const n = Number(v);
      if (!Number.isNaN(n)) {
        t += n;
        c++;
      }
    }
    return c > 0 ? t / c : 0;
  },
  min: (values) => {
    let m = Infinity;
    for (const v of values) {
      const n = Number(v);
      if (!Number.isNaN(n) && n < m) m = n;
    }
    return m === Infinity ? null : m;
  },
  max: (values) => {
    let m = -Infinity;
    for (const v of values) {
      const n = Number(v);
      if (!Number.isNaN(n) && n > m) m = n;
    }
    return m === -Infinity ? null : m;
  },
  count: (values) => values.length,
  first: (values) => (values.length > 0 ? values[0] : null),
  last: (values) => (values.length > 0 ? values[values.length - 1] : null),
};

// ─── RowPivot Class ──────────────────────────

export class RowPivot {
  #pivotColumns: string[] = [];
  #valueColumns: { field: string; aggFunc: AggFunc }[] = [];
  #customAggFuncs: Record<string, AggFunc> = {};

  get pivotColumns(): string[] {
    return [...this.#pivotColumns];
  }

  set pivotColumns(value: string[]) {
    this.#pivotColumns = value;
  }

  get valueColumns(): { field: string; aggFunc: AggFunc }[] {
    return [...this.#valueColumns];
  }

  set valueColumns(value: { field: string; aggFunc: AggFunc }[]) {
    this.#valueColumns = value;
  }

  get isActive(): boolean {
    return this.#pivotColumns.length > 0 && this.#valueColumns.length > 0;
  }

  setCustomAggFuncs(funcs: Record<string, AggFunc>): void {
    this.#customAggFuncs = { ...funcs };
  }

  /**
   * Pivot the data: create dynamic columns from pivot field values
   * and aggregate values into them.
   *
   * @param rows Source rows (already filtered/sorted)
   * @param groupColumns Fields used for row grouping (appear as row keys)
   * @param originalColumns Original column definitions
   */
  pivot(rows: Row[], groupColumns: string[], originalColumns: ColumnDef[]): PivotResult {
    if (!this.isActive) {
      return { columns: originalColumns, rows, pivotKeys: [] };
    }

    // 1. Discover all unique pivot key combinations
    const pivotKeys = this.#discoverPivotKeys(rows);

    // 2. Generate dynamic pivot columns
    const pivotColDefs = this.#generatePivotColumns(pivotKeys);

    // 3. Build row-group columns (non-pivot, non-value columns used for grouping)
    const groupColDefs = originalColumns.filter(
      (col) =>
        groupColumns.includes(col.field) &&
        !this.#pivotColumns.includes(col.field) &&
        !this.#valueColumns.some((vc) => vc.field === col.field),
    );

    // 4. Aggregate data into pivot cells
    const pivotedRows = this.#aggregateIntoPivotRows(rows, groupColumns, pivotKeys);

    return {
      columns: [...groupColDefs, ...pivotColDefs],
      rows: pivotedRows,
      pivotKeys,
    };
  }

  /**
   * Discover all unique pivot key combinations across pivot columns.
   */
  #discoverPivotKeys(rows: Row[]): string[] {
    const keySet = new Set<string>();
    for (const row of rows) {
      const key = this.#pivotColumns
        .map((field) => {
          const val = row[field];
          return val == null ? '(blank)' : String(val);
        })
        .join('|');
      keySet.add(key);
    }
    // Sort for stable column ordering
    return [...keySet].sort();
  }

  /**
   * Generate pivot column definitions.
   * For each pivot key × value column, a new ColumnDef is created.
   */
  #generatePivotColumns(pivotKeys: string[]): ColumnDef[] {
    const cols: ColumnDef[] = [];

    for (const pivotKey of pivotKeys) {
      for (const valCol of this.#valueColumns) {
        const aggLabel = typeof valCol.aggFunc === 'string' ? valCol.aggFunc : 'custom';
        const field = `pivot_${pivotKey}_${valCol.field}`;
        cols.push({
          field,
          header: `${pivotKey} (${aggLabel} ${valCol.field})`,
          type: 'number',
          sortable: true,
          filterable: false,
          editable: false,
        });
      }
    }

    return cols;
  }

  /**
   * Aggregate rows into pivoted rows.
   * Groups by groupColumns, then for each pivot key, computes the aggregate.
   */
  #aggregateIntoPivotRows(rows: Row[], groupColumns: string[], pivotKeys: string[]): Row[] {
    // Group rows by their group key
    const groups = new Map<string, Row[]>();
    for (const row of rows) {
      const groupKey = groupColumns
        .map((field) => {
          const val = row[field];
          return val == null ? '(blank)' : String(val);
        })
        .join('|');
      let bucket = groups.get(groupKey);
      if (!bucket) {
        bucket = [];
        groups.set(groupKey, bucket);
      }
      bucket.push(row);
    }

    // Build pivoted rows
    const result: Row[] = [];
    for (const [, groupRows] of groups) {
      const pivotedRow: Row = {};

      // Copy group column values from first row
      for (const field of groupColumns) {
        pivotedRow[field] = groupRows[0][field];
      }

      // For each pivot key, filter matching rows and aggregate
      for (const pivotKey of pivotKeys) {
        const pivotValues = pivotKey.split('|');
        const matchingRows = groupRows.filter((row) => {
          return this.#pivotColumns.every((field, i) => {
            const val = row[field];
            const str = val == null ? '(blank)' : String(val);
            return str === pivotValues[i];
          });
        });

        for (const valCol of this.#valueColumns) {
          const values = matchingRows.map((row) => row[valCol.field]);
          const aggResult = this.#applyAgg(valCol.aggFunc, values, matchingRows);
          const field = `pivot_${pivotKey}_${valCol.field}`;
          pivotedRow[field] = aggResult;
        }
      }

      result.push(pivotedRow);
    }

    return result;
  }

  #applyAgg(aggFunc: AggFunc, values: unknown[], rows: Row[]): unknown {
    if (typeof aggFunc === 'function') {
      return aggFunc(values, rows);
    }
    const customFn = this.#customAggFuncs[aggFunc];
    if (typeof customFn === 'function') {
      return customFn(values, rows);
    }
    const builtIn = AGG_FNS[aggFunc];
    if (builtIn) return builtIn(values);
    return null;
  }
}
