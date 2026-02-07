/**
 * Data export engine — CSV, JSON, and Excel (XLSX) export.
 *
 * CSV follows RFC 4180. JSON exports as array of objects.
 * XLSX is generated as a lightweight SpreadsheetML XML (Office Open XML)
 * without heavy external dependencies.
 */

import type { Row, ColumnDef } from '../types.js';

// ─── Public Types ────────────────────────────

export interface CsvExportParams {
  filename?: string;
  includeHeaders?: boolean;
  includeGroupHeaders?: boolean;
  selectedOnly?: boolean;
  columns?: string[];
  allColumns?: boolean;
  separator?: string;
  processCellCallback?: (params: ExportCellParams) => string;
  processHeaderCallback?: (params: ExportHeaderParams) => string;
}

export interface JsonExportParams {
  filename?: string;
  selectedOnly?: boolean;
  columns?: string[];
  allColumns?: boolean;
}

export interface ExcelExportParams extends CsvExportParams {
  sheetName?: string;
  styles?: boolean;
  author?: string;
  freezeRows?: number;
  freezeColumns?: number;
  autoFilter?: boolean;
  columnWidths?: Record<string, number>;
}

export interface ExportCellParams {
  value: unknown;
  row: Row;
  field: string;
  rowIndex: number;
  column: ColumnDef;
}

export interface ExportHeaderParams {
  column: ColumnDef;
}

// ─── DataExport Class ────────────────────────

export class DataExport {
  /**
   * Generate a CSV string from row data (RFC 4180 compliant).
   */
  getDataAsCsv(rows: Row[], columns: ColumnDef[], params: CsvExportParams = {}): string {
    const cols = this.#resolveColumns(columns, params.columns, params.allColumns);
    const sep = params.separator ?? ',';
    const lines: string[] = [];

    // Headers
    if (params.includeHeaders !== false) {
      const headerCells = cols.map((col) => {
        if (params.processHeaderCallback) {
          return this.#escapeCsv(params.processHeaderCallback({ column: col }), sep);
        }
        return this.#escapeCsv(col.header || col.field, sep);
      });
      lines.push(headerCells.join(sep));
    }

    // Data rows
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const cells = cols.map((col) => {
        const value = row[col.field];
        if (params.processCellCallback) {
          return this.#escapeCsv(
            params.processCellCallback({ value, row, field: col.field, rowIndex: i, column: col }),
            sep,
          );
        }
        return this.#escapeCsv(value == null ? '' : String(value), sep);
      });
      lines.push(cells.join(sep));
    }

    return lines.join('\r\n');
  }

  /**
   * Export CSV as a file download.
   */
  exportCsv(rows: Row[], columns: ColumnDef[], params: CsvExportParams = {}): void {
    const csv = this.getDataAsCsv(rows, columns, params);
    const filename = params.filename || 'export.csv';
    this.#downloadFile(csv, filename, 'text/csv;charset=utf-8;');
  }

  /**
   * Generate a JSON string from row data.
   */
  getDataAsJson(rows: Row[], columns: ColumnDef[], params: JsonExportParams = {}): string {
    const cols = this.#resolveColumns(columns, params.columns, params.allColumns);
    const fields = cols.map((c) => c.field);

    const data = rows.map((row) => {
      const obj: Record<string, unknown> = {};
      for (const field of fields) {
        obj[field] = row[field];
      }
      return obj;
    });

    return JSON.stringify(data, null, 2);
  }

  /**
   * Export JSON as a file download.
   */
  exportJson(rows: Row[], columns: ColumnDef[], params: JsonExportParams = {}): void {
    const json = this.getDataAsJson(rows, columns, params);
    const filename = params.filename || 'export.json';
    this.#downloadFile(json, filename, 'application/json;charset=utf-8;');
  }

  /**
   * Generate an XLSX file as a Blob using SpreadsheetML XML.
   * This is a lightweight approach without external dependencies.
   */
  getDataAsExcelXml(rows: Row[], columns: ColumnDef[], params: ExcelExportParams = {}): string {
    const cols = this.#resolveColumns(columns, params.columns, params.allColumns);
    const sheetName = params.sheetName || 'Sheet1';

    const xmlParts: string[] = [];
    xmlParts.push('<?xml version="1.0" encoding="UTF-8"?>');
    xmlParts.push('<?mso-application progid="Excel.Sheet"?>');
    xmlParts.push(
      '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"',
      ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
    );

    // Styles
    if (params.styles !== false) {
      xmlParts.push('<Styles>');
      xmlParts.push(
        '<Style ss:ID="header"><Font ss:Bold="1"/>' +
          '<Interior ss:Color="#E0E0E0" ss:Pattern="Solid"/></Style>',
      );
      xmlParts.push('<Style ss:ID="number"><NumberFormat ss:Format="0.00"/></Style>');
      xmlParts.push('</Styles>');
    }

    // Worksheet
    xmlParts.push(`<Worksheet ss:Name="${this.#escapeXml(sheetName)}">`);
    xmlParts.push('<Table>');

    // Column widths
    for (const col of cols) {
      const width = params.columnWidths?.[col.field] ?? col.width ?? 100;
      xmlParts.push(`<Column ss:Width="${width}"/>`);
    }

    // Header row
    if (params.includeHeaders !== false) {
      xmlParts.push('<Row>');
      for (const col of cols) {
        const header = params.processHeaderCallback
          ? params.processHeaderCallback({ column: col })
          : col.header || col.field;
        xmlParts.push(
          `<Cell${params.styles !== false ? ' ss:StyleID="header"' : ''}>` +
            `<Data ss:Type="String">${this.#escapeXml(header)}</Data></Cell>`,
        );
      }
      xmlParts.push('</Row>');
    }

    // Data rows
    for (let i = 0; i < rows.length; i++) {
      xmlParts.push('<Row>');
      for (const col of cols) {
        const value = rows[i][col.field];
        const cellValue = params.processCellCallback
          ? params.processCellCallback({
              value,
              row: rows[i],
              field: col.field,
              rowIndex: i,
              column: col,
            })
          : value;

        const numVal = Number(cellValue);
        const isNum = cellValue != null && cellValue !== '' && !Number.isNaN(numVal);

        if (isNum) {
          const styleAttr = params.styles !== false ? ' ss:StyleID="number"' : '';
          xmlParts.push(`<Cell${styleAttr}><Data ss:Type="Number">${numVal}</Data></Cell>`);
        } else {
          const str = cellValue == null ? '' : String(cellValue);
          xmlParts.push(`<Cell><Data ss:Type="String">${this.#escapeXml(str)}</Data></Cell>`);
        }
      }
      xmlParts.push('</Row>');
    }

    xmlParts.push('</Table>');
    xmlParts.push('</Worksheet>');
    xmlParts.push('</Workbook>');

    return xmlParts.join('');
  }

  /**
   * Export Excel XML as a file download.
   */
  exportExcel(rows: Row[], columns: ColumnDef[], params: ExcelExportParams = {}): void {
    const xml = this.getDataAsExcelXml(rows, columns, params);
    const filename = params.filename || 'export.xls';
    this.#downloadFile(xml, filename, 'application/vnd.ms-excel;charset=utf-8;');
  }

  // ─── Private helpers ────────────────────────

  #resolveColumns(
    allColumns: ColumnDef[],
    requestedFields?: string[],
    includeAll?: boolean,
  ): ColumnDef[] {
    if (includeAll) return allColumns;
    if (requestedFields && requestedFields.length > 0) {
      return requestedFields
        .map((field) => allColumns.find((c) => c.field === field))
        .filter((c): c is ColumnDef => c !== undefined);
    }
    // By default, only visible (non-hidden) columns
    return allColumns.filter((c) => !c.hidden);
  }

  /**
   * Escape a value for CSV (RFC 4180).
   * Wraps in quotes if the value contains the separator, quotes, or newlines.
   */
  #escapeCsv(value: string, separator: string): string {
    if (
      value.includes(separator) ||
      value.includes('"') ||
      value.includes('\n') ||
      value.includes('\r')
    ) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  #escapeXml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  #downloadFile(content: string, filename: string, mimeType: string): void {
    if (typeof document === 'undefined') return;

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
