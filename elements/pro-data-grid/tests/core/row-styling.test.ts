import { describe, it, expect } from 'bun:test';
import { RowStyling } from '../../src/core/row-styling.js';
import type { Row } from '../../src/types.js';

const rows: Row[] = [
  { id: '1', name: 'Alice', status: 'active' },
  { id: '2', name: 'Bob', status: 'inactive' },
  { id: '3', name: 'Charlie', status: 'active' },
];

describe('RowStyling', () => {
  describe('getRowClass', () => {
    it('returns empty when no callback set', () => {
      const rs = new RowStyling();
      expect(rs.getRowClass(rows[0], 0)).toBe('');
    });

    it('uses configured getRowClass callback', () => {
      const rs = new RowStyling();
      rs.configure({
        getRowClass: (params) => (params.row.status === 'active' ? 'row-active' : 'row-inactive'),
      });
      expect(rs.getRowClass(rows[0], 0)).toBe('row-active');
      expect(rs.getRowClass(rows[1], 1)).toBe('row-inactive');
    });
  });

  describe('getRowStyle', () => {
    it('returns empty object when no callback set', () => {
      const rs = new RowStyling();
      expect(rs.getRowStyle(rows[0], 0)).toEqual({});
    });

    it('uses configured getRowStyle callback', () => {
      const rs = new RowStyling();
      rs.configure({
        getRowStyle: (params) =>
          params.row.status === 'active' ? { background: 'green' } : {},
      });
      expect(rs.getRowStyle(rows[0], 0)).toEqual({ background: 'green' });
      expect(rs.getRowStyle(rows[1], 1)).toEqual({});
    });
  });

  describe('getRowHeight', () => {
    it('returns undefined when no callback set', () => {
      const rs = new RowStyling();
      expect(rs.getRowHeight(rows[0], 0)).toBeUndefined();
    });

    it('uses configured getRowHeight callback', () => {
      const rs = new RowStyling();
      rs.configure({
        getRowHeight: (params) => (params.rowIndex === 0 ? 80 : 40),
      });
      expect(rs.getRowHeight(rows[0], 0)).toBe(80);
      expect(rs.getRowHeight(rows[1], 1)).toBe(40);
    });
  });

  describe('isFullWidthRow', () => {
    it('returns false when no callback set', () => {
      const rs = new RowStyling();
      expect(rs.isFullWidthRow(rows[0])).toBe(false);
    });

    it('uses configured predicate', () => {
      const rs = new RowStyling();
      rs.configure({
        isFullWidthRow: (row) => row.name === 'Bob',
      });
      expect(rs.isFullWidthRow(rows[0])).toBe(false);
      expect(rs.isFullWidthRow(rows[1])).toBe(true);
    });
  });

  describe('renderFullWidthRow', () => {
    it('returns empty when no renderer set', () => {
      const rs = new RowStyling();
      expect(rs.renderFullWidthRow(rows[0])).toBe('');
    });

    it('uses configured renderer', () => {
      const rs = new RowStyling();
      rs.configure({
        fullWidthRenderer: (row) => `<div>Full: ${row.name}</div>`,
      });
      expect(rs.renderFullWidthRow(rows[0])).toBe('<div>Full: Alice</div>');
    });
  });

  describe('showRowNumbers', () => {
    it('defaults to false', () => {
      const rs = new RowStyling();
      expect(rs.showRowNumbers).toBe(false);
    });

    it('can be toggled', () => {
      const rs = new RowStyling();
      rs.showRowNumbers = true;
      expect(rs.showRowNumbers).toBe(true);
    });
  });

  describe('getRowNumberColumn', () => {
    it('generates row number column def', () => {
      const rs = new RowStyling();
      const col = rs.getRowNumberColumn();
      expect(col.field).toBe('__rowNumber');
      expect(col.header).toBe('#');
      expect(col.sortable).toBe(false);
      expect(col.editable).toBe(false);
    });
  });

  describe('animateRows', () => {
    it('defaults to false', () => {
      const rs = new RowStyling();
      expect(rs.animateRows).toBe(false);
    });

    it('can be toggled', () => {
      const rs = new RowStyling();
      rs.animateRows = true;
      expect(rs.animateRows).toBe(true);
    });
  });

  describe('styleToString', () => {
    it('converts object to CSS string', () => {
      const rs = new RowStyling();
      const result = rs.styleToString({ background: 'red', fontSize: '14px' });
      expect(result).toContain('background:red');
      expect(result).toContain('font-size:14px');
    });

    it('handles camelCase to kebab-case', () => {
      const rs = new RowStyling();
      const result = rs.styleToString({ backgroundColor: '#fff' });
      expect(result).toBe('background-color:#fff');
    });
  });

  describe('computeRowOffsets', () => {
    it('computes cumulative offsets with default height', () => {
      const rs = new RowStyling();
      const { offsets, totalHeight } = rs.computeRowOffsets(rows, 40);
      expect(offsets).toEqual([0, 40, 80]);
      expect(totalHeight).toBe(120);
    });

    it('computes offsets with variable heights', () => {
      const rs = new RowStyling();
      rs.configure({
        getRowHeight: (params) => (params.rowIndex === 1 ? 80 : 40),
      });
      const { offsets, totalHeight } = rs.computeRowOffsets(rows, 40);
      expect(offsets).toEqual([0, 40, 120]);
      expect(totalHeight).toBe(160);
    });
  });
});
