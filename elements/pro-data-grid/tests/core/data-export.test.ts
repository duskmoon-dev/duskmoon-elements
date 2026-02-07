import { describe, it, expect } from 'bun:test';
import { DataExport } from '../../src/core/data-export.js';
import type { Row, ColumnDef } from '../../src/types.js';

const columns: ColumnDef[] = [
  { field: 'name', header: 'Name' },
  { field: 'age', header: 'Age', type: 'number' },
  { field: 'email', header: 'Email' },
  { field: 'hidden', header: 'Hidden', hidden: true },
];

const rows: Row[] = [
  { name: 'Alice', age: 30, email: 'alice@test.com', hidden: 'x' },
  { name: 'Bob', age: 25, email: 'bob@test.com', hidden: 'y' },
  { name: 'Charlie', age: 35, email: 'charlie@test.com', hidden: 'z' },
];

describe('DataExport', () => {
  // ─── CSV ──────────────────────────────────────

  describe('CSV export', () => {
    it('generates RFC 4180 CSV with headers', () => {
      const exp = new DataExport();
      const csv = exp.getDataAsCsv(rows, columns);

      const lines = csv.split('\r\n');
      expect(lines[0]).toBe('Name,Age,Email');
      expect(lines[1]).toBe('Alice,30,alice@test.com');
      expect(lines[2]).toBe('Bob,25,bob@test.com');
      expect(lines[3]).toBe('Charlie,35,charlie@test.com');
    });

    it('excludes hidden columns by default', () => {
      const exp = new DataExport();
      const csv = exp.getDataAsCsv(rows, columns);
      expect(csv).not.toContain('Hidden');
      expect(csv).not.toContain('x');
    });

    it('includes all columns when allColumns=true', () => {
      const exp = new DataExport();
      const csv = exp.getDataAsCsv(rows, columns, { allColumns: true });
      expect(csv).toContain('Hidden');
    });

    it('selects specific columns', () => {
      const exp = new DataExport();
      const csv = exp.getDataAsCsv(rows, columns, { columns: ['name', 'age'] });
      const lines = csv.split('\r\n');
      expect(lines[0]).toBe('Name,Age');
      expect(lines[1]).toBe('Alice,30');
    });

    it('omits headers when includeHeaders=false', () => {
      const exp = new DataExport();
      const csv = exp.getDataAsCsv(rows, columns, { includeHeaders: false });
      const lines = csv.split('\r\n');
      expect(lines[0]).toBe('Alice,30,alice@test.com');
    });

    it('uses custom separator', () => {
      const exp = new DataExport();
      const csv = exp.getDataAsCsv(rows, columns, { separator: ';' });
      expect(csv).toContain('Name;Age;Email');
    });

    it('escapes values containing separator', () => {
      const exp = new DataExport();
      const csvRows: Row[] = [{ name: 'Smith, John', age: 40, email: 'john@test.com' }];
      const csv = exp.getDataAsCsv(csvRows, columns);
      expect(csv).toContain('"Smith, John"');
    });

    it('escapes values containing quotes', () => {
      const exp = new DataExport();
      const csvRows: Row[] = [{ name: 'The "Boss"', age: 50, email: 't@t.com' }];
      const csv = exp.getDataAsCsv(csvRows, columns);
      expect(csv).toContain('"The ""Boss"""');
    });

    it('escapes values containing newlines', () => {
      const exp = new DataExport();
      const csvRows: Row[] = [{ name: 'Line1\nLine2', age: 20, email: 'l@l.com' }];
      const csv = exp.getDataAsCsv(csvRows, columns);
      expect(csv).toContain('"Line1\nLine2"');
    });

    it('handles null values as empty string', () => {
      const exp = new DataExport();
      const csvRows: Row[] = [{ name: null, age: undefined, email: 'x' }];
      const csv = exp.getDataAsCsv(csvRows, columns);
      expect(csv).toContain(',,x');
    });

    it('uses processCellCallback', () => {
      const exp = new DataExport();
      const csv = exp.getDataAsCsv(rows, columns, {
        processCellCallback: (params) => `[${params.value}]`,
      });
      expect(csv).toContain('[Alice]');
    });

    it('uses processHeaderCallback', () => {
      const exp = new DataExport();
      const csv = exp.getDataAsCsv(rows, columns, {
        processHeaderCallback: (params) => params.column.field.toUpperCase(),
      });
      expect(csv.split('\r\n')[0]).toBe('NAME,AGE,EMAIL');
    });
  });

  // ─── JSON ─────────────────────────────────────

  describe('JSON export', () => {
    it('generates JSON array of objects', () => {
      const exp = new DataExport();
      const json = exp.getDataAsJson(rows, columns);
      const parsed = JSON.parse(json);

      expect(parsed.length).toBe(3);
      expect(parsed[0]).toEqual({
        name: 'Alice',
        age: 30,
        email: 'alice@test.com',
      });
    });

    it('excludes hidden columns by default', () => {
      const exp = new DataExport();
      const json = exp.getDataAsJson(rows, columns);
      const parsed = JSON.parse(json);
      expect(parsed[0]).not.toHaveProperty('hidden');
    });

    it('selects specific columns', () => {
      const exp = new DataExport();
      const json = exp.getDataAsJson(rows, columns, { columns: ['name'] });
      const parsed = JSON.parse(json);
      expect(Object.keys(parsed[0])).toEqual(['name']);
    });

    it('includes all columns when allColumns=true', () => {
      const exp = new DataExport();
      const json = exp.getDataAsJson(rows, columns, { allColumns: true });
      const parsed = JSON.parse(json);
      expect(parsed[0]).toHaveProperty('hidden');
    });
  });

  // ─── Excel XML ────────────────────────────────

  describe('Excel XML export', () => {
    it('generates valid SpreadsheetML XML', () => {
      const exp = new DataExport();
      const xml = exp.getDataAsExcelXml(rows, columns);

      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain('Workbook');
      expect(xml).toContain('<Worksheet ss:Name="Sheet1">');
      expect(xml).toContain('<Data ss:Type="String">Alice</Data>');
      expect(xml).toContain('<Data ss:Type="Number">30</Data>');
    });

    it('uses custom sheet name', () => {
      const exp = new DataExport();
      const xml = exp.getDataAsExcelXml(rows, columns, { sheetName: 'MyData' });
      expect(xml).toContain('ss:Name="MyData"');
    });

    it('includes styles by default', () => {
      const exp = new DataExport();
      const xml = exp.getDataAsExcelXml(rows, columns);
      expect(xml).toContain('<Styles>');
      expect(xml).toContain('ss:StyleID="header"');
    });

    it('omits styles when styles=false', () => {
      const exp = new DataExport();
      const xml = exp.getDataAsExcelXml(rows, columns, { styles: false });
      expect(xml).not.toContain('<Styles>');
    });

    it('escapes XML special characters', () => {
      const exp = new DataExport();
      const xmlRows: Row[] = [{ name: 'A & B <"test">', age: 1, email: '' }];
      const xml = exp.getDataAsExcelXml(xmlRows, columns);
      expect(xml).toContain('A &amp; B &lt;&quot;test&quot;&gt;');
    });

    it('excludes hidden columns by default', () => {
      const exp = new DataExport();
      const xml = exp.getDataAsExcelXml(rows, columns);
      expect(xml).not.toContain('Hidden');
    });

    it('uses custom column widths', () => {
      const exp = new DataExport();
      const xml = exp.getDataAsExcelXml(rows, columns, {
        columnWidths: { name: 200 },
      });
      expect(xml).toContain('ss:Width="200"');
    });

    it('includes headers by default', () => {
      const exp = new DataExport();
      const xml = exp.getDataAsExcelXml(rows, columns);
      // Header cells have style
      expect(xml).toContain('ss:StyleID="header"');
      expect(xml).toContain('>Name</Data>');
    });

    it('uses processHeaderCallback', () => {
      const exp = new DataExport();
      const xml = exp.getDataAsExcelXml(rows, columns, {
        processHeaderCallback: (params) => params.column.field.toUpperCase(),
      });
      expect(xml).toContain('>NAME</Data>');
    });

    it('uses processCellCallback', () => {
      const exp = new DataExport();
      const xml = exp.getDataAsExcelXml(rows, columns, {
        processCellCallback: (params) =>
          params.field === 'name' ? `[${params.value}]` : String(params.value ?? ''),
      });
      expect(xml).toContain('>[Alice]</Data>');
    });
  });
});
