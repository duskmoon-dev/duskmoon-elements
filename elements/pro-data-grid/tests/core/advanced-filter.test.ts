import { describe, it, expect } from 'bun:test';
import { AdvancedFilter } from '../../src/core/advanced-filter.js';
import type { Row } from '../../src/types.js';

const rows: Row[] = [
  { id: '1', name: 'Alice', age: 30, status: 'active', city: 'NYC' },
  { id: '2', name: 'Bob', age: 25, status: 'inactive', city: 'LA' },
  { id: '3', name: 'Charlie', age: 35, status: 'active', city: 'NYC' },
  { id: '4', name: 'Diana', age: 28, status: 'inactive', city: 'Chicago' },
  { id: '5', name: 'Eve', age: 40, status: 'active', city: '' },
];

describe('AdvancedFilter', () => {
  it('starts with no expression', () => {
    const af = new AdvancedFilter();
    expect(af.hasExpression).toBe(false);
    expect(af.hasExternalFilter).toBe(false);
  });

  it('returns all rows when no filter', () => {
    const af = new AdvancedFilter();
    expect(af.filter(rows)).toHaveLength(5);
  });

  describe('single conditions', () => {
    it('equals', () => {
      const af = new AdvancedFilter();
      af.expression = AdvancedFilter.condition('status', 'equals', 'active');
      expect(af.filter(rows)).toHaveLength(3);
    });

    it('notEquals', () => {
      const af = new AdvancedFilter();
      af.expression = AdvancedFilter.condition('status', 'notEquals', 'active');
      expect(af.filter(rows)).toHaveLength(2);
    });

    it('contains', () => {
      const af = new AdvancedFilter();
      af.expression = AdvancedFilter.condition('name', 'contains', 'li');
      const result = af.filter(rows);
      expect(result).toHaveLength(2); // Alice, Charlie
    });

    it('notContains', () => {
      const af = new AdvancedFilter();
      af.expression = AdvancedFilter.condition('name', 'notContains', 'li');
      expect(af.filter(rows)).toHaveLength(3);
    });

    it('startsWith', () => {
      const af = new AdvancedFilter();
      af.expression = AdvancedFilter.condition('name', 'startsWith', 'a');
      expect(af.filter(rows)).toHaveLength(1); // Alice
    });

    it('endsWith', () => {
      const af = new AdvancedFilter();
      af.expression = AdvancedFilter.condition('name', 'endsWith', 'e');
      expect(af.filter(rows)).toHaveLength(3); // Alice, Charlie, Eve (case-insensitive)
    });

    it('greaterThan', () => {
      const af = new AdvancedFilter();
      af.expression = AdvancedFilter.condition('age', 'greaterThan', 30);
      expect(af.filter(rows)).toHaveLength(2); // Charlie 35, Eve 40
    });

    it('lessThan', () => {
      const af = new AdvancedFilter();
      af.expression = AdvancedFilter.condition('age', 'lessThan', 30);
      expect(af.filter(rows)).toHaveLength(2); // Bob 25, Diana 28
    });

    it('greaterThanOrEqual', () => {
      const af = new AdvancedFilter();
      af.expression = AdvancedFilter.condition('age', 'greaterThanOrEqual', 30);
      expect(af.filter(rows)).toHaveLength(3); // Alice, Charlie, Eve
    });

    it('lessThanOrEqual', () => {
      const af = new AdvancedFilter();
      af.expression = AdvancedFilter.condition('age', 'lessThanOrEqual', 28);
      expect(af.filter(rows)).toHaveLength(2);
    });

    it('inRange', () => {
      const af = new AdvancedFilter();
      af.expression = AdvancedFilter.condition('age', 'inRange', 25, { valueTo: 30 });
      expect(af.filter(rows)).toHaveLength(3); // Bob 25, Diana 28, Alice 30
    });

    it('blank', () => {
      const af = new AdvancedFilter();
      af.expression = AdvancedFilter.condition('city', 'blank');
      expect(af.filter(rows)).toHaveLength(1); // Eve has empty city
    });

    it('notBlank', () => {
      const af = new AdvancedFilter();
      af.expression = AdvancedFilter.condition('city', 'notBlank');
      expect(af.filter(rows)).toHaveLength(4);
    });

    it('inSet', () => {
      const af = new AdvancedFilter();
      af.expression = AdvancedFilter.condition('city', 'inSet', undefined, {
        values: ['NYC', 'LA'],
      });
      expect(af.filter(rows)).toHaveLength(3); // Alice, Bob, Charlie
    });
  });

  describe('AND groups', () => {
    it('requires all conditions to match', () => {
      const af = new AdvancedFilter();
      af.expression = AdvancedFilter.and(
        AdvancedFilter.condition('status', 'equals', 'active'),
        AdvancedFilter.condition('age', 'greaterThan', 30),
      );
      const result = af.filter(rows);
      expect(result).toHaveLength(2); // Charlie 35, Eve 40
    });
  });

  describe('OR groups', () => {
    it('requires any condition to match', () => {
      const af = new AdvancedFilter();
      af.expression = AdvancedFilter.or(
        AdvancedFilter.condition('name', 'equals', 'Alice'),
        AdvancedFilter.condition('name', 'equals', 'Bob'),
      );
      const result = af.filter(rows);
      expect(result).toHaveLength(2);
    });
  });

  describe('NOT', () => {
    it('negates condition', () => {
      const af = new AdvancedFilter();
      af.expression = AdvancedFilter.not(
        AdvancedFilter.condition('status', 'equals', 'active'),
      );
      expect(af.filter(rows)).toHaveLength(2); // inactive rows
    });
  });

  describe('nested expressions', () => {
    it('supports nested AND/OR', () => {
      const af = new AdvancedFilter();
      // (status=active AND age>30) OR city=LA
      af.expression = AdvancedFilter.or(
        AdvancedFilter.and(
          AdvancedFilter.condition('status', 'equals', 'active'),
          AdvancedFilter.condition('age', 'greaterThan', 30),
        ),
        AdvancedFilter.condition('city', 'equals', 'LA'),
      );
      const result = af.filter(rows);
      // Charlie (active, 35), Eve (active, 40), Bob (LA)
      expect(result).toHaveLength(3);
    });
  });

  describe('external predicate', () => {
    it('applies external filter', () => {
      const af = new AdvancedFilter();
      af.externalPredicate = (row) => Number(row.age) >= 30;
      expect(af.filter(rows)).toHaveLength(3);
    });

    it('combines expression + external', () => {
      const af = new AdvancedFilter();
      af.expression = AdvancedFilter.condition('status', 'equals', 'active');
      af.externalPredicate = (row) => Number(row.age) > 30;
      // active AND age > 30 → Charlie, Eve
      expect(af.filter(rows)).toHaveLength(2);
    });
  });

  describe('testRow', () => {
    it('tests a single row', () => {
      const af = new AdvancedFilter();
      af.expression = AdvancedFilter.condition('name', 'equals', 'Alice');
      expect(af.testRow(rows[0])).toBe(true);
      expect(af.testRow(rows[1])).toBe(false);
    });

    it('returns true when no filter', () => {
      const af = new AdvancedFilter();
      expect(af.testRow(rows[0])).toBe(true);
    });
  });

  describe('clear', () => {
    it('clears all filters', () => {
      const af = new AdvancedFilter();
      af.expression = AdvancedFilter.condition('name', 'equals', 'Alice');
      af.externalPredicate = () => false;
      af.clear();
      expect(af.hasExpression).toBe(false);
      expect(af.hasExternalFilter).toBe(false);
      expect(af.filter(rows)).toHaveLength(5);
    });
  });

  describe('validate', () => {
    it('validates a valid expression', () => {
      const errors = AdvancedFilter.validate(
        AdvancedFilter.condition('name', 'equals', 'Alice'),
      );
      expect(errors).toHaveLength(0);
    });

    it('detects missing field', () => {
      const errors = AdvancedFilter.validate({
        type: 'condition',
        field: '',
        operator: 'equals',
        value: 'x',
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('detects inRange without valueTo', () => {
      const errors = AdvancedFilter.validate(
        AdvancedFilter.condition('age', 'inRange', 10),
      );
      expect(errors.length).toBeGreaterThan(0);
    });

    it('detects inSet without values', () => {
      const errors = AdvancedFilter.validate(
        AdvancedFilter.condition('city', 'inSet'),
      );
      expect(errors.length).toBeGreaterThan(0);
    });

    it('detects empty group', () => {
      const errors = AdvancedFilter.validate({
        type: 'group',
        operator: 'AND',
        conditions: [],
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('validates nested expressions', () => {
      const errors = AdvancedFilter.validate(
        AdvancedFilter.and(
          AdvancedFilter.condition('name', 'equals', 'x'),
          AdvancedFilter.condition('age', 'inRange', 10), // missing valueTo
        ),
      );
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
