import { describe, it, expect } from 'bun:test';
import { FilterEngine } from '../../src/core/filter-engine.js';
import type { Row, FilterModel, ColumnDef } from '../../src/types.js';

describe('FilterEngine', () => {
  const engine = new FilterEngine();
  const columns: ColumnDef[] = [
    { field: 'name', header: 'Name', type: 'text' },
    { field: 'age', header: 'Age', type: 'number' },
    { field: 'date', header: 'Date', type: 'date' },
    { field: 'status', header: 'Status', type: 'text' },
  ];

  const rows: Row[] = [
    { name: 'Alice', age: 25, date: '2023-01-15', status: 'active' },
    { name: 'Bob', age: 35, date: '2023-02-10', status: 'inactive' },
    { name: 'Charlie', age: 30, date: '2023-03-01', status: 'active' },
    { name: 'Diana', age: 28, date: '2023-04-20', status: 'pending' },
    { name: '', age: null, date: null, status: null },
  ];

  it('returns all rows when no filters', () => {
    expect(engine.filter(rows, {}, columns)).toEqual(rows);
  });

  // ─── Text Filters ─────────────────────────

  describe('text filter', () => {
    it('contains', () => {
      const result = engine.filter(
        rows,
        { name: { type: 'text', operator: 'contains', value: 'li' } },
        columns,
      );
      expect(result.map((r) => r.name)).toEqual(['Alice', 'Charlie']);
    });

    it('notContains', () => {
      const result = engine.filter(
        rows,
        { name: { type: 'text', operator: 'notContains', value: 'li' } },
        columns,
      );
      expect(result.length).toBe(3);
    });

    it('equals', () => {
      const result = engine.filter(
        rows,
        { name: { type: 'text', operator: 'equals', value: 'bob' } },
        columns,
      );
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Bob');
    });

    it('notEqual', () => {
      const result = engine.filter(
        rows,
        { name: { type: 'text', operator: 'notEqual', value: 'bob' } },
        columns,
      );
      expect(result.length).toBe(4);
    });

    it('startsWith', () => {
      const result = engine.filter(
        rows,
        { name: { type: 'text', operator: 'startsWith', value: 'al' } },
        columns,
      );
      expect(result.length).toBe(1);
    });

    it('endsWith', () => {
      const result = engine.filter(
        rows,
        { name: { type: 'text', operator: 'endsWith', value: 'ie' } },
        columns,
      );
      expect(result.map((r) => r.name)).toEqual(['Charlie']);
    });

    it('blank', () => {
      const result = engine.filter(
        rows,
        { name: { type: 'text', operator: 'blank', value: '' } },
        columns,
      );
      expect(result.length).toBe(1);
    });

    it('notBlank', () => {
      const result = engine.filter(
        rows,
        { name: { type: 'text', operator: 'notBlank', value: '' } },
        columns,
      );
      expect(result.length).toBe(4);
    });

    it('dual condition with AND', () => {
      const result = engine.filter(
        rows,
        {
          name: {
            type: 'text',
            operator: 'contains',
            value: 'a',
            condition2: { operator: 'endsWith', value: 'e' },
            join: 'AND',
          },
        },
        columns,
      );
      expect(result.map((r) => r.name)).toEqual(['Alice', 'Charlie']);
    });

    it('dual condition with OR', () => {
      const result = engine.filter(
        rows,
        {
          name: {
            type: 'text',
            operator: 'equals',
            value: 'alice',
            condition2: { operator: 'equals', value: 'bob' },
            join: 'OR',
          },
        },
        columns,
      );
      expect(result.length).toBe(2);
    });
  });

  // ─── Number Filters ───────────────────────

  describe('number filter', () => {
    it('equals', () => {
      const result = engine.filter(
        rows,
        { age: { type: 'number', operator: 'equals', value: 30 } },
        columns,
      );
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Charlie');
    });

    it('greaterThan', () => {
      const result = engine.filter(
        rows,
        { age: { type: 'number', operator: 'greaterThan', value: 29 } },
        columns,
      );
      expect(result.map((r) => r.name)).toEqual(['Bob', 'Charlie']);
    });

    it('lessThanOrEqual', () => {
      const result = engine.filter(
        rows,
        { age: { type: 'number', operator: 'lessThanOrEqual', value: 28 } },
        columns,
      );
      expect(result.map((r) => r.name)).toEqual(['Alice', 'Diana']);
    });

    it('inRange', () => {
      const result = engine.filter(
        rows,
        { age: { type: 'number', operator: 'inRange', value: 26, valueTo: 31 } },
        columns,
      );
      expect(result.map((r) => r.name)).toEqual(['Charlie', 'Diana']);
    });

    it('blank for null values', () => {
      const result = engine.filter(
        rows,
        { age: { type: 'number', operator: 'blank', value: 0 } },
        columns,
      );
      expect(result.length).toBe(1);
    });
  });

  // ─── Date Filters ─────────────────────────

  describe('date filter', () => {
    it('greaterThan', () => {
      const result = engine.filter(
        rows,
        { date: { type: 'date', operator: 'greaterThan', value: '2023-02-15' } },
        columns,
      );
      expect(result.map((r) => r.name)).toEqual(['Charlie', 'Diana']);
    });

    it('inRange', () => {
      const result = engine.filter(
        rows,
        {
          date: {
            type: 'date',
            operator: 'inRange',
            value: '2023-01-01',
            valueTo: '2023-02-28',
          },
        },
        columns,
      );
      expect(result.map((r) => r.name)).toEqual(['Alice', 'Bob']);
    });
  });

  // ─── Set Filters ──────────────────────────

  describe('set filter', () => {
    it('filters by value set', () => {
      const result = engine.filter(
        rows,
        { status: { type: 'set', values: ['active', 'pending'] } },
        columns,
      );
      expect(result.map((r) => r.name)).toEqual(['Alice', 'Charlie', 'Diana']);
    });

    it('empty set returns all rows', () => {
      const result = engine.filter(rows, { status: { type: 'set', values: [] } }, columns);
      expect(result.length).toBe(5);
    });
  });

  // ─── Multi Filters ────────────────────────

  describe('multi filter', () => {
    it('applies AND across multiple filter models', () => {
      const result = engine.filter(
        rows,
        {
          name: {
            type: 'multi',
            filterModels: [
              { type: 'text', operator: 'contains', value: 'a' },
              { type: 'text', operator: 'notContains', value: 'di' },
            ],
          },
        },
        columns,
      );
      expect(result.map((r) => r.name)).toEqual(['Alice', 'Charlie']);
    });
  });

  // ─── Combined Filters ─────────────────────

  it('applies multiple column filters simultaneously', () => {
    const result = engine.filter(
      rows,
      {
        status: { type: 'set', values: ['active'] },
        age: { type: 'number', operator: 'greaterThan', value: 26 },
      },
      columns,
    );
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Charlie');
  });
});
