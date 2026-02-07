import { describe, it, expect } from 'bun:test';
import { SortEngine } from '../../src/core/sort-engine.js';
import type { Row, SortItem, ColumnDef } from '../../src/types.js';

describe('SortEngine', () => {
  const engine = new SortEngine();

  const rows: Row[] = [
    { name: 'Charlie', age: 30, date: '2023-03-01', active: true },
    { name: 'Alice', age: 25, date: '2023-01-15', active: false },
    { name: 'Bob', age: 35, date: '2023-02-10', active: true },
    { name: 'Diana', age: 28, date: '2023-04-20', active: false },
  ];

  const columns: ColumnDef[] = [
    { field: 'name', header: 'Name', type: 'text', sortable: true },
    { field: 'age', header: 'Age', type: 'number', sortable: true },
    { field: 'date', header: 'Date', type: 'date', sortable: true },
    { field: 'active', header: 'Active', type: 'boolean', sortable: true },
  ];

  it('returns original array when no sort model', () => {
    const result = engine.sort(rows, [], columns);
    expect(result).toEqual(rows);
  });

  it('sorts strings ascending', () => {
    const sorted = engine.sort(rows, [{ field: 'name', direction: 'asc' }], columns);
    expect(sorted.map((r) => r.name)).toEqual(['Alice', 'Bob', 'Charlie', 'Diana']);
  });

  it('sorts strings descending', () => {
    const sorted = engine.sort(rows, [{ field: 'name', direction: 'desc' }], columns);
    expect(sorted.map((r) => r.name)).toEqual(['Diana', 'Charlie', 'Bob', 'Alice']);
  });

  it('sorts numbers ascending', () => {
    const sorted = engine.sort(rows, [{ field: 'age', direction: 'asc' }], columns);
    expect(sorted.map((r) => r.age)).toEqual([25, 28, 30, 35]);
  });

  it('sorts numbers descending', () => {
    const sorted = engine.sort(rows, [{ field: 'age', direction: 'desc' }], columns);
    expect(sorted.map((r) => r.age)).toEqual([35, 30, 28, 25]);
  });

  it('sorts dates ascending', () => {
    const sorted = engine.sort(rows, [{ field: 'date', direction: 'asc' }], columns);
    expect(sorted.map((r) => r.date)).toEqual([
      '2023-01-15',
      '2023-02-10',
      '2023-03-01',
      '2023-04-20',
    ]);
  });

  it('sorts booleans (false before true ascending)', () => {
    const sorted = engine.sort(rows, [{ field: 'active', direction: 'asc' }], columns);
    expect(sorted.map((r) => r.active)).toEqual([false, false, true, true]);
  });

  it('multi-sort: primary by active, secondary by name', () => {
    const sorted = engine.sort(
      rows,
      [
        { field: 'active', direction: 'asc' },
        { field: 'name', direction: 'asc' },
      ],
      columns,
    );
    expect(sorted.map((r) => r.name)).toEqual(['Alice', 'Diana', 'Bob', 'Charlie']);
  });

  it('does not mutate original array', () => {
    const original = [...rows];
    engine.sort(rows, [{ field: 'name', direction: 'asc' }], columns);
    expect(rows).toEqual(original);
  });

  it('handles null values — nulls sort last', () => {
    const withNulls: Row[] = [
      { name: 'Alice', age: 25 },
      { name: null, age: 30 },
      { name: 'Bob', age: null },
    ];
    const sorted = engine.sort(withNulls, [{ field: 'name', direction: 'asc' }], columns);
    expect(sorted[0].name).toBe('Alice');
    expect(sorted[1].name).toBe('Bob');
    expect(sorted[2].name).toBeNull();
  });

  it('uses custom comparator when provided', () => {
    const customCols: ColumnDef[] = [
      {
        field: 'name',
        header: 'Name',
        sortable: true,
        comparator: (a, b) => String(b).length - String(a).length, // Sort by length desc
      },
    ];
    const sorted = engine.sort(rows, [{ field: 'name', direction: 'asc' }], customCols);
    expect(sorted[0].name).toBe('Charlie'); // 7 chars
  });

  describe('nextSortDirection', () => {
    it('cycles null → asc → desc → null', () => {
      expect(engine.nextSortDirection(null)).toBe('asc');
      expect(engine.nextSortDirection('asc')).toBe('desc');
      expect(engine.nextSortDirection('desc')).toBeNull();
    });
  });

  describe('updateSortModel', () => {
    it('single sort: creates new model', () => {
      const result = engine.updateSortModel([], 'name', false);
      expect(result).toEqual([{ field: 'name', direction: 'asc' }]);
    });

    it('single sort: cycles existing field', () => {
      const result = engine.updateSortModel(
        [{ field: 'name', direction: 'asc' }],
        'name',
        false,
      );
      expect(result).toEqual([{ field: 'name', direction: 'desc' }]);
    });

    it('single sort: clears on third click', () => {
      const result = engine.updateSortModel(
        [{ field: 'name', direction: 'desc' }],
        'name',
        false,
      );
      expect(result).toEqual([]);
    });

    it('single sort: replaces when clicking different field', () => {
      const result = engine.updateSortModel(
        [{ field: 'name', direction: 'asc' }],
        'age',
        false,
      );
      expect(result).toEqual([{ field: 'age', direction: 'asc' }]);
    });

    it('multi sort: adds to model', () => {
      const result = engine.updateSortModel(
        [{ field: 'name', direction: 'asc' }],
        'age',
        true,
      );
      expect(result).toEqual([
        { field: 'name', direction: 'asc' },
        { field: 'age', direction: 'asc' },
      ]);
    });

    it('multi sort: removes field on third click', () => {
      const result = engine.updateSortModel(
        [
          { field: 'name', direction: 'asc' },
          { field: 'age', direction: 'desc' },
        ],
        'age',
        true,
      );
      expect(result).toEqual([{ field: 'name', direction: 'asc' }]);
    });
  });
});
