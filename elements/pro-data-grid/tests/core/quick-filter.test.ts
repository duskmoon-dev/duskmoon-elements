import { describe, it, expect } from 'bun:test';
import { QuickFilter } from '../../src/core/quick-filter.js';
import type { Row, ColumnDef } from '../../src/types.js';

describe('QuickFilter', () => {
  const columns: ColumnDef[] = [
    { field: 'name', header: 'Name', type: 'text' },
    { field: 'email', header: 'Email', type: 'text' },
    { field: 'age', header: 'Age', type: 'number' },
    { field: 'city', header: 'City', type: 'text', hidden: true },
  ];

  const rows: Row[] = [
    { name: 'Alice', email: 'alice@example.com', age: 25, city: 'New York' },
    { name: 'Bob', email: 'bob@test.org', age: 35, city: 'London' },
    { name: 'Charlie', email: 'charlie@example.com', age: 30, city: 'Paris' },
    { name: 'Diana', email: 'diana@test.org', age: 28, city: 'Berlin' },
  ];

  it('returns all rows when text is empty', () => {
    const qf = new QuickFilter();
    qf.text = '';
    expect(qf.filter(rows, columns)).toEqual(rows);
  });

  it('returns all rows when text is whitespace', () => {
    const qf = new QuickFilter();
    qf.text = '   ';
    expect(qf.filter(rows, columns)).toEqual(rows);
  });

  it('filters by single term across all visible columns', () => {
    const qf = new QuickFilter();
    qf.text = 'alice';
    const result = qf.filter(rows, columns);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Alice');
  });

  it('is case-insensitive', () => {
    const qf = new QuickFilter();
    qf.text = 'ALICE';
    const result = qf.filter(rows, columns);
    expect(result.length).toBe(1);
  });

  it('matches across different columns', () => {
    const qf = new QuickFilter();
    qf.text = 'example.com';
    const result = qf.filter(rows, columns);
    expect(result.length).toBe(2);
    expect(result.map((r) => r.name)).toEqual(['Alice', 'Charlie']);
  });

  it('supports space-separated AND terms', () => {
    const qf = new QuickFilter();
    qf.text = 'example alice';
    const result = qf.filter(rows, columns);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Alice');
  });

  it('excludes hidden columns from search', () => {
    const qf = new QuickFilter();
    // 'New York' is in the hidden 'city' column — should NOT match
    qf.text = 'New York';
    const result = qf.filter(rows, columns);
    expect(result.length).toBe(0);
  });

  it('matches number values as strings', () => {
    const qf = new QuickFilter();
    qf.text = '35';
    const result = qf.filter(rows, columns);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Bob');
  });

  it('handles null values gracefully', () => {
    const rowsWithNull: Row[] = [...rows, { name: null, email: null, age: null, city: null }];
    const qf = new QuickFilter();
    qf.text = 'alice';
    const result = qf.filter(rowsWithNull, columns);
    expect(result.length).toBe(1);
  });

  it('get/set text', () => {
    const qf = new QuickFilter();
    expect(qf.text).toBe('');
    qf.text = 'hello';
    expect(qf.text).toBe('hello');
  });

  it('caches matcher function for same term', () => {
    const qf = new QuickFilter();
    qf.text = 'bob';
    // Call twice with same term — should use cached function
    const result1 = qf.filter(rows, columns);
    const result2 = qf.filter(rows, columns);
    expect(result1).toEqual(result2);
  });

  describe('getUniqueValues', () => {
    it('returns unique values for a field', () => {
      const qf = new QuickFilter();
      const values = qf.getUniqueValues(
        [...rows, { name: 'Alice2', email: 'a2@test.org', age: 25, city: 'NYC' }],
        'age',
      );
      expect(values).toEqual([25, 35, 30, 28]);
    });

    it('preserves insertion order', () => {
      const qf = new QuickFilter();
      const values = qf.getUniqueValues(rows, 'name');
      expect(values).toEqual(['Alice', 'Bob', 'Charlie', 'Diana']);
    });
  });
});
