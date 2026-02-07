import { describe, it, expect } from 'bun:test';
import { ClipboardService } from '../../src/core/clipboard-service.js';
import type { Row, ColumnDef } from '../../src/types.js';

const columns: ColumnDef[] = [
  { field: 'name', header: 'Name' },
  { field: 'age', header: 'Age', type: 'number' },
  { field: 'email', header: 'Email' },
];

const rows: Row[] = [
  { name: 'Alice', age: 30, email: 'alice@test.com' },
  { name: 'Bob', age: 25, email: 'bob@test.com' },
  { name: 'Charlie', age: 35, email: 'charlie@test.com' },
];

describe('ClipboardService', () => {
  describe('formatForClipboard', () => {
    it('formats data as tab-separated text', () => {
      const svc = new ClipboardService();
      const data = [
        ['Alice', '30'],
        ['Bob', '25'],
      ];
      const result = svc.formatForClipboard(data);
      expect(result).toBe('Alice\t30\nBob\t25');
    });

    it('includes headers when requested', () => {
      const svc = new ClipboardService();
      const data = [['Alice', '30']];
      const headers = ['Name', 'Age'];
      const result = svc.formatForClipboard(data, headers, { includeHeaders: true });
      expect(result).toBe('Name\tAge\nAlice\t30');
    });

    it('uses configured separator', () => {
      const svc = new ClipboardService();
      svc.separator = ',';
      const data = [['Alice', '30']];
      expect(svc.formatForClipboard(data)).toBe('Alice,30');
    });

    it('respects includeHeaders from configure', () => {
      const svc = new ClipboardService();
      svc.includeHeaders = true;
      const data = [['Alice', '30']];
      const headers = ['Name', 'Age'];
      const result = svc.formatForClipboard(data, headers);
      expect(result).toBe('Name\tAge\nAlice\t30');
    });
  });

  describe('formatRowsForClipboard', () => {
    it('formats rows with columns', () => {
      const svc = new ClipboardService();
      const result = svc.formatRowsForClipboard(rows, columns, [0, 1]);
      expect(result).toBe('Alice\t30\talice@test.com\nBob\t25\tbob@test.com');
    });

    it('includes headers when configured', () => {
      const svc = new ClipboardService();
      const result = svc.formatRowsForClipboard(rows, columns, [0], {
        includeHeaders: true,
      });
      expect(result).toBe('Name\tAge\tEmail\nAlice\t30\talice@test.com');
    });

    it('uses processCellCallback', () => {
      const svc = new ClipboardService();
      svc.configure({
        processCellCallback: (params) => `[${params.value}]`,
      });
      const result = svc.formatRowsForClipboard(rows, columns, [0]);
      expect(result).toBe('[Alice]\t[30]\t[alice@test.com]');
    });

    it('handles null values as empty string', () => {
      const svc = new ClipboardService();
      const nullRows: Row[] = [{ name: null, age: undefined, email: 'test' }];
      const result = svc.formatRowsForClipboard(nullRows, columns, [0]);
      expect(result).toBe('\t\ttest');
    });
  });

  describe('parseClipboardText', () => {
    it('parses tab-separated text', () => {
      const svc = new ClipboardService();
      const result = svc.parseClipboardText('Alice\t30\nBob\t25');
      expect(result).toEqual([
        ['Alice', '30'],
        ['Bob', '25'],
      ]);
    });

    it('handles trailing newline', () => {
      const svc = new ClipboardService();
      const result = svc.parseClipboardText('Alice\t30\n');
      expect(result).toEqual([['Alice', '30']]);
    });

    it('handles Windows line endings', () => {
      const svc = new ClipboardService();
      const result = svc.parseClipboardText('Alice\t30\r\nBob\t25');
      expect(result).toEqual([
        ['Alice', '30'],
        ['Bob', '25'],
      ]);
    });

    it('returns empty array for empty string', () => {
      const svc = new ClipboardService();
      expect(svc.parseClipboardText('')).toEqual([]);
    });
  });

  describe('applyPaste', () => {
    it('applies paste data starting at position', () => {
      const svc = new ClipboardService();
      const data = [
        ['NewAlice', '31'],
        ['NewBob', '26'],
      ];
      const result = svc.applyPaste(data, rows, columns, 0, 'name');

      expect(result.changes.length).toBe(4);
      expect(result.changes[0]).toEqual({
        rowIndex: 0,
        field: 'name',
        oldValue: 'Alice',
        newValue: 'NewAlice',
      });
      expect(result.changes[1]).toEqual({
        rowIndex: 0,
        field: 'age',
        oldValue: 30,
        newValue: 31, // coerced to number
      });
    });

    it('stops at row boundary', () => {
      const svc = new ClipboardService();
      const data = [['X'], ['Y'], ['Z'], ['W']]; // More rows than available
      const result = svc.applyPaste(data, rows, columns, 1, 'name');
      expect(result.changes.length).toBe(2); // only rows[1] and rows[2]
    });

    it('stops at column boundary', () => {
      const svc = new ClipboardService();
      const data = [['A', '1', 'x@x.com', 'extra']]; // More columns than available
      const result = svc.applyPaste(data, rows, columns, 0, 'name');
      expect(result.changes.length).toBe(3); // only 3 columns
    });

    it('skips non-editable columns', () => {
      const svc = new ClipboardService();
      const readonlyCols: ColumnDef[] = [
        { field: 'name', header: 'Name', editable: false },
        { field: 'age', header: 'Age', type: 'number' },
      ];
      const data = [['NewName', '99']];
      const result = svc.applyPaste(data, rows, readonlyCols, 0, 'name');
      expect(result.changes.length).toBe(1);
      expect(result.changes[0].field).toBe('age');
    });

    it('coerces boolean values', () => {
      const svc = new ClipboardService();
      const boolCols: ColumnDef[] = [
        { field: 'active', header: 'Active', type: 'boolean' },
      ];
      const boolRows: Row[] = [{ active: false }];
      const data = [['true']];
      const result = svc.applyPaste(data, boolRows, boolCols, 0, 'active');
      expect(result.changes[0].newValue).toBe(true);
    });

    it('returns empty when suppressPaste is true', () => {
      const svc = new ClipboardService();
      svc.suppressPaste = true;
      const result = svc.applyPaste([['x']], rows, columns, 0, 'name');
      expect(result.changes.length).toBe(0);
    });
  });

  describe('configure', () => {
    it('updates all settings', () => {
      const svc = new ClipboardService();
      svc.configure({
        separator: ',',
        includeHeaders: true,
      });
      expect(svc.separator).toBe(',');
      expect(svc.includeHeaders).toBe(true);
    });
  });
});
