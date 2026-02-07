import { describe, it, expect } from 'bun:test';
import { RowPivot } from '../../src/core/row-pivot.js';
import type { Row, ColumnDef } from '../../src/types.js';

describe('RowPivot', () => {
  const rows: Row[] = [
    { dept: 'Engineering', year: '2023', revenue: 100, headcount: 10 },
    { dept: 'Engineering', year: '2024', revenue: 120, headcount: 12 },
    { dept: 'Sales', year: '2023', revenue: 80, headcount: 5 },
    { dept: 'Sales', year: '2024', revenue: 95, headcount: 6 },
    { dept: 'Marketing', year: '2023', revenue: 50, headcount: 3 },
    { dept: 'Marketing', year: '2024', revenue: 60, headcount: 4 },
  ];

  const columns: ColumnDef[] = [
    { field: 'dept', header: 'Department', type: 'text' },
    { field: 'year', header: 'Year', type: 'text' },
    { field: 'revenue', header: 'Revenue', type: 'number' },
    { field: 'headcount', header: 'Headcount', type: 'number' },
  ];

  it('returns original data when not active', () => {
    const pivot = new RowPivot();
    const result = pivot.pivot(rows, ['dept'], columns);
    expect(result.columns).toBe(columns);
    expect(result.rows).toBe(rows);
    expect(result.pivotKeys.length).toBe(0);
  });

  it('is not active without value columns', () => {
    const pivot = new RowPivot();
    pivot.pivotColumns = ['year'];
    expect(pivot.isActive).toBe(false);
  });

  it('is active with both pivot and value columns', () => {
    const pivot = new RowPivot();
    pivot.pivotColumns = ['year'];
    pivot.valueColumns = [{ field: 'revenue', aggFunc: 'sum' }];
    expect(pivot.isActive).toBe(true);
  });

  it('pivots data with single value column', () => {
    const pivot = new RowPivot();
    pivot.pivotColumns = ['year'];
    pivot.valueColumns = [{ field: 'revenue', aggFunc: 'sum' }];

    const result = pivot.pivot(rows, ['dept'], columns);

    // Should have dept column + 2 pivot columns (2023, 2024) x 1 value = 3 cols
    expect(result.columns.length).toBe(3);
    expect(result.pivotKeys).toEqual(['2023', '2024']);

    // Should have 3 rows (one per dept)
    expect(result.rows.length).toBe(3);

    const eng = result.rows.find((r) => r.dept === 'Engineering')!;
    expect(eng['pivot_2023_revenue']).toBe(100);
    expect(eng['pivot_2024_revenue']).toBe(120);

    const sales = result.rows.find((r) => r.dept === 'Sales')!;
    expect(sales['pivot_2023_revenue']).toBe(80);
    expect(sales['pivot_2024_revenue']).toBe(95);
  });

  it('pivots with multiple value columns', () => {
    const pivot = new RowPivot();
    pivot.pivotColumns = ['year'];
    pivot.valueColumns = [
      { field: 'revenue', aggFunc: 'sum' },
      { field: 'headcount', aggFunc: 'sum' },
    ];

    const result = pivot.pivot(rows, ['dept'], columns);

    // dept + (2023 x 2 + 2024 x 2) = 5 columns
    expect(result.columns.length).toBe(5);

    const eng = result.rows.find((r) => r.dept === 'Engineering')!;
    expect(eng['pivot_2023_revenue']).toBe(100);
    expect(eng['pivot_2023_headcount']).toBe(10);
    expect(eng['pivot_2024_revenue']).toBe(120);
    expect(eng['pivot_2024_headcount']).toBe(12);
  });

  it('pivot columns are sorted for stable ordering', () => {
    const pivot = new RowPivot();
    pivot.pivotColumns = ['year'];
    pivot.valueColumns = [{ field: 'revenue', aggFunc: 'sum' }];

    const result = pivot.pivot(rows, ['dept'], columns);
    expect(result.pivotKeys).toEqual(['2023', '2024']);
  });

  it('handles null pivot values as (blank)', () => {
    const rowsWithNull: Row[] = [
      ...rows,
      { dept: 'HR', year: null, revenue: 30, headcount: 2 },
    ];
    const pivot = new RowPivot();
    pivot.pivotColumns = ['year'];
    pivot.valueColumns = [{ field: 'revenue', aggFunc: 'sum' }];

    const result = pivot.pivot(rowsWithNull, ['dept'], columns);
    expect(result.pivotKeys).toContain('(blank)');

    const hr = result.rows.find((r) => r.dept === 'HR')!;
    expect(hr['pivot_(blank)_revenue']).toBe(30);
  });

  it('uses avg aggregation', () => {
    const pivot = new RowPivot();
    pivot.pivotColumns = ['year'];
    pivot.valueColumns = [{ field: 'revenue', aggFunc: 'avg' }];

    // Add duplicate rows to test avg
    const dupRows: Row[] = [
      ...rows,
      { dept: 'Engineering', year: '2023', revenue: 200, headcount: 20 },
    ];

    const result = pivot.pivot(dupRows, ['dept'], columns);
    const eng = result.rows.find((r) => r.dept === 'Engineering')!;
    // Avg of 100, 200 = 150
    expect(eng['pivot_2023_revenue']).toBe(150);
  });

  it('supports custom aggregation functions', () => {
    const pivot = new RowPivot();
    pivot.pivotColumns = ['year'];
    pivot.valueColumns = [{
      field: 'revenue',
      aggFunc: (values: unknown[]) => {
        const nums = values.map(Number).filter((n) => !Number.isNaN(n));
        return nums.length > 0 ? Math.max(...nums) : 0;
      },
    }];

    const result = pivot.pivot(rows, ['dept'], columns);
    const eng = result.rows.find((r) => r.dept === 'Engineering')!;
    expect(eng['pivot_2023_revenue']).toBe(100);
  });

  it('supports named custom agg via setCustomAggFuncs', () => {
    const pivot = new RowPivot();
    pivot.pivotColumns = ['year'];
    pivot.setCustomAggFuncs({
      maxVal: (values: unknown[]) => {
        const nums = values.map(Number).filter((n) => !Number.isNaN(n));
        return Math.max(...nums);
      },
    });
    pivot.valueColumns = [{ field: 'revenue', aggFunc: 'maxVal' }];

    const result = pivot.pivot(rows, ['dept'], columns);
    const eng = result.rows.find((r) => r.dept === 'Engineering')!;
    expect(eng['pivot_2023_revenue']).toBe(100);
  });

  it('generates proper column headers', () => {
    const pivot = new RowPivot();
    pivot.pivotColumns = ['year'];
    pivot.valueColumns = [{ field: 'revenue', aggFunc: 'sum' }];

    const result = pivot.pivot(rows, ['dept'], columns);
    const pivotCol = result.columns.find((c) => c.field === 'pivot_2023_revenue')!;
    expect(pivotCol.header).toBe('2023 (sum revenue)');
    expect(pivotCol.type).toBe('number');
    expect(pivotCol.sortable).toBe(true);
    expect(pivotCol.editable).toBe(false);
  });

  it('get/set pivotColumns', () => {
    const pivot = new RowPivot();
    expect(pivot.pivotColumns).toEqual([]);
    pivot.pivotColumns = ['year'];
    expect(pivot.pivotColumns).toEqual(['year']);
  });

  it('get/set valueColumns', () => {
    const pivot = new RowPivot();
    expect(pivot.valueColumns).toEqual([]);
    pivot.valueColumns = [{ field: 'rev', aggFunc: 'sum' }];
    expect(pivot.valueColumns.length).toBe(1);
  });
});
