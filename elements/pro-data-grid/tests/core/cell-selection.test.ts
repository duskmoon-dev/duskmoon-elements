import { describe, it, expect } from 'bun:test';
import { CellSelection } from '../../src/core/cell-selection.js';
import type { Row, ColumnDef } from '../../src/types.js';

const columns: ColumnDef[] = [
  { field: 'name', header: 'Name' },
  { field: 'age', header: 'Age', type: 'number' },
  { field: 'email', header: 'Email' },
  { field: 'score', header: 'Score', type: 'number' },
];

const rows: Row[] = [
  { name: 'Alice', age: 30, email: 'alice@test.com', score: 95 },
  { name: 'Bob', age: 25, email: 'bob@test.com', score: 88 },
  { name: 'Charlie', age: 35, email: 'charlie@test.com', score: 72 },
  { name: 'Diana', age: 28, email: 'diana@test.com', score: 91 },
  { name: 'Eve', age: 32, email: 'eve@test.com', score: 85 },
];

describe('CellSelection', () => {
  it('starts disabled with no ranges', () => {
    const sel = new CellSelection();
    expect(sel.enabled).toBe(false);
    expect(sel.rangeCount).toBe(0);
  });

  it('does nothing when disabled', () => {
    const sel = new CellSelection();
    sel.setColumns(columns);
    sel.startSelection(0, 'name');
    expect(sel.rangeCount).toBe(0);
  });

  describe('single cell selection', () => {
    it('selects a single cell', () => {
      const sel = new CellSelection();
      sel.enabled = true;
      sel.setColumns(columns);

      sel.startSelection(0, 'name');
      sel.endSelection();

      expect(sel.rangeCount).toBe(1);
      expect(sel.isCellSelected(0, 'name')).toBe(true);
      expect(sel.isCellSelected(0, 'age')).toBe(false);
      expect(sel.isCellSelected(1, 'name')).toBe(false);
    });

    it('replaces previous selection on new click', () => {
      const sel = new CellSelection();
      sel.enabled = true;
      sel.setColumns(columns);

      sel.startSelection(0, 'name');
      sel.endSelection();
      sel.startSelection(1, 'age');
      sel.endSelection();

      expect(sel.rangeCount).toBe(1);
      expect(sel.isCellSelected(0, 'name')).toBe(false);
      expect(sel.isCellSelected(1, 'age')).toBe(true);
    });
  });

  describe('drag selection (rectangular range)', () => {
    it('selects a rectangular range', () => {
      const sel = new CellSelection();
      sel.enabled = true;
      sel.setColumns(columns);

      sel.startSelection(0, 'name');
      sel.updateSelection(2, 'age');
      sel.endSelection();

      expect(sel.rangeCount).toBe(1);
      // All cells in the 3×2 rectangle
      expect(sel.isCellSelected(0, 'name')).toBe(true);
      expect(sel.isCellSelected(0, 'age')).toBe(true);
      expect(sel.isCellSelected(1, 'name')).toBe(true);
      expect(sel.isCellSelected(1, 'age')).toBe(true);
      expect(sel.isCellSelected(2, 'name')).toBe(true);
      expect(sel.isCellSelected(2, 'age')).toBe(true);
      // Outside the range
      expect(sel.isCellSelected(0, 'email')).toBe(false);
      expect(sel.isCellSelected(3, 'name')).toBe(false);
    });
  });

  describe('multi-range selection (Ctrl+click)', () => {
    it('adds new range with ctrlKey', () => {
      const sel = new CellSelection();
      sel.enabled = true;
      sel.setColumns(columns);

      sel.startSelection(0, 'name');
      sel.endSelection();

      sel.startSelection(2, 'email', true); // Ctrl+click
      sel.endSelection();

      expect(sel.rangeCount).toBe(2);
      expect(sel.isCellSelected(0, 'name')).toBe(true);
      expect(sel.isCellSelected(2, 'email')).toBe(true);
    });
  });

  describe('extend selection (Shift+click)', () => {
    it('extends the last range', () => {
      const sel = new CellSelection();
      sel.enabled = true;
      sel.setColumns(columns);

      sel.startSelection(0, 'name');
      sel.endSelection();

      sel.extendSelection(2, 'age');

      expect(sel.isCellSelected(0, 'name')).toBe(true);
      expect(sel.isCellSelected(1, 'name')).toBe(true);
      expect(sel.isCellSelected(2, 'name')).toBe(true);
      expect(sel.isCellSelected(0, 'age')).toBe(true);
      expect(sel.isCellSelected(2, 'age')).toBe(true);
    });

    it('creates new range when no existing ranges', () => {
      const sel = new CellSelection();
      sel.enabled = true;
      sel.setColumns(columns);

      sel.extendSelection(1, 'age');
      expect(sel.rangeCount).toBe(1);
      expect(sel.isCellSelected(1, 'age')).toBe(true);
    });
  });

  describe('selectRange (programmatic)', () => {
    it('selects a range via params', () => {
      const sel = new CellSelection();
      sel.enabled = true;
      sel.setColumns(columns);

      sel.selectRange({ rowStartIndex: 1, rowEndIndex: 3, columns: ['name', 'age'] });

      expect(sel.rangeCount).toBe(1);
      expect(sel.isCellSelected(1, 'name')).toBe(true);
      expect(sel.isCellSelected(3, 'age')).toBe(true);
      expect(sel.isCellSelected(0, 'name')).toBe(false);
    });
  });

  describe('clearSelections', () => {
    it('clears all ranges', () => {
      const sel = new CellSelection();
      sel.enabled = true;
      sel.setColumns(columns);

      sel.startSelection(0, 'name');
      sel.endSelection();

      sel.clearSelections();
      expect(sel.rangeCount).toBe(0);
    });
  });

  describe('getRangeData', () => {
    it('returns 2D array of cell values', () => {
      const sel = new CellSelection();
      sel.enabled = true;
      sel.setColumns(columns);

      sel.selectRange({ rowStartIndex: 0, rowEndIndex: 1, columns: ['name', 'age'] });

      const data = sel.getRangeData(rows);
      expect(data).toEqual([
        ['Alice', '30'],
        ['Bob', '25'],
      ]);
    });

    it('returns empty array when no ranges', () => {
      const sel = new CellSelection();
      expect(sel.getRangeData(rows)).toEqual([]);
    });
  });

  describe('getRangeHeaders', () => {
    it('returns column headers of first range', () => {
      const sel = new CellSelection();
      sel.enabled = true;
      sel.setColumns(columns);
      sel.selectRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['name', 'age'] });

      expect(sel.getRangeHeaders()).toEqual(['Name', 'Age']);
    });
  });

  describe('getAggregation', () => {
    it('computes sum, avg, min, max, count for numeric values', () => {
      const sel = new CellSelection();
      sel.enabled = true;
      sel.setColumns(columns);

      sel.selectRange({ rowStartIndex: 0, rowEndIndex: 2, columns: ['score'] });

      const agg = sel.getAggregation(rows);
      expect(agg.sum).toBe(95 + 88 + 72);
      expect(agg.count).toBe(3);
      expect(agg.numericCount).toBe(3);
      expect(agg.min).toBe(72);
      expect(agg.max).toBe(95);
      expect(agg.avg).toBeCloseTo(85, 1);
    });

    it('handles mixed numeric/non-numeric values', () => {
      const sel = new CellSelection();
      sel.enabled = true;
      sel.setColumns(columns);

      sel.selectRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['name', 'age'] });
      const agg = sel.getAggregation(rows);
      // name is 'Alice' (non-numeric), age is 30
      expect(agg.count).toBe(2);
      expect(agg.numericCount).toBe(1);
      expect(agg.sum).toBe(30);
    });
  });

  describe('deleteRangeValues', () => {
    it('returns changes for non-null values in range', () => {
      const sel = new CellSelection();
      sel.enabled = true;
      sel.setColumns(columns);

      sel.selectRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['name'] });
      const changes = sel.deleteRangeValues(rows);

      expect(changes.length).toBe(1);
      expect(changes[0]).toEqual({ rowIndex: 0, field: 'name', oldValue: 'Alice' });
    });
  });

  describe('fill handle', () => {
    it('fillHandle property defaults to false', () => {
      const sel = new CellSelection();
      expect(sel.fillHandle).toBe(false);
    });

    it('fills single value downward', () => {
      const sel = new CellSelection();
      sel.enabled = true;
      sel.fillHandle = true;
      sel.setColumns(columns);

      const sourceRange = {
        startRow: { index: 0 },
        endRow: { index: 0 },
        columns: [columns[1]], // age
        startColumn: columns[1],
      };

      const result = sel.fill(rows, sourceRange, 2);

      expect(result.changes.length).toBe(2);
      expect(result.changes[0]).toEqual({ rowIndex: 1, field: 'age', value: 30 });
      expect(result.changes[1]).toEqual({ rowIndex: 2, field: 'age', value: 30 });
    });

    it('detects linear sequence and extrapolates', () => {
      const sel = new CellSelection();
      sel.enabled = true;
      sel.setColumns(columns);

      // Rows with sequence: 10, 20
      const seqRows: Row[] = [
        { val: 10 },
        { val: 20 },
        { val: 0 },
        { val: 0 },
      ];
      const seqCols: ColumnDef[] = [{ field: 'val', header: 'Val', type: 'number' }];
      sel.setColumns(seqCols);

      const sourceRange = {
        startRow: { index: 0 },
        endRow: { index: 1 },
        columns: [seqCols[0]],
        startColumn: seqCols[0],
      };

      const result = sel.fill(seqRows, sourceRange, 3);

      expect(result.changes.length).toBe(2);
      expect(result.changes[0]).toEqual({ rowIndex: 2, field: 'val', value: 30 });
      expect(result.changes[1]).toEqual({ rowIndex: 3, field: 'val', value: 40 });
    });

    it('repeats text values cyclically', () => {
      const sel = new CellSelection();
      sel.enabled = true;
      sel.setColumns(columns);

      const textRows: Row[] = [
        { val: 'A' },
        { val: 'B' },
        { val: '' },
        { val: '' },
        { val: '' },
      ];
      const textCols: ColumnDef[] = [{ field: 'val', header: 'Val' }];
      sel.setColumns(textCols);

      const sourceRange = {
        startRow: { index: 0 },
        endRow: { index: 1 },
        columns: [textCols[0]],
        startColumn: textCols[0],
      };

      const result = sel.fill(textRows, sourceRange, 4);

      expect(result.changes.length).toBe(3);
      expect(result.changes[0].value).toBe('A');
      expect(result.changes[1].value).toBe('B');
      expect(result.changes[2].value).toBe('A');
    });
  });

  describe('configure', () => {
    it('updates settings', () => {
      const sel = new CellSelection();
      sel.configure({ enabled: true, fillHandle: true });
      expect(sel.enabled).toBe(true);
      expect(sel.fillHandle).toBe(true);
    });

    it('disabling clears ranges', () => {
      const sel = new CellSelection();
      sel.enabled = true;
      sel.setColumns(columns);
      sel.startSelection(0, 'name');
      sel.endSelection();
      expect(sel.rangeCount).toBe(1);

      sel.enabled = false;
      expect(sel.rangeCount).toBe(0);
    });
  });
});
