/**
 * Internationalization (i18n) system for the data grid.
 *
 * Provides a complete locale text system with overridable strings,
 * RTL direction support, and number/date formatting helpers.
 */

// ─── Types ──────────────────────────────────

export interface LocaleText {
  // Pagination
  page: string;
  of: string;
  to: string;
  rows: string;
  firstPage: string;
  previousPage: string;
  nextPage: string;
  lastPage: string;

  // Sorting
  sortAscending: string;
  sortDescending: string;
  clearSort: string;

  // Filtering
  filterPlaceholder: string;
  contains: string;
  notContains: string;
  equals: string;
  notEquals: string;
  startsWith: string;
  endsWith: string;
  greaterThan: string;
  lessThan: string;
  greaterThanOrEqual: string;
  lessThanOrEqual: string;
  inRange: string;
  clearFilter: string;
  applyFilter: string;
  noFilter: string;

  // Selection
  selectAll: string;
  selectNone: string;
  selected: string;

  // Column menu
  columnMenu: string;
  hideColumn: string;
  pinLeft: string;
  pinRight: string;
  unpin: string;
  autoSize: string;

  // Status bar
  totalRows: string;
  filteredRows: string;
  selectedRows: string;
  sum: string;
  avg: string;
  min: string;
  max: string;
  count: string;

  // Loading / empty
  loading: string;
  noRowsToShow: string;

  // Clipboard / export
  copy: string;
  cut: string;
  paste: string;
  exportCsv: string;
  exportExcel: string;
  exportJson: string;

  // Find
  findPlaceholder: string;
  matchesFound: string;
  noMatches: string;

  // Row drag
  rowDragSingle: string;
  rowDragMultiple: string;

  // General
  search: string;
  reset: string;
  cancel: string;
  apply: string;
  ok: string;
}

export type LocaleTextOverrides = Partial<LocaleText>;

export type TextDirection = 'ltr' | 'rtl';

// ─── Default Locale (English) ────────────────

const defaultLocale: LocaleText = {
  // Pagination
  page: 'Page',
  of: 'of',
  to: 'to',
  rows: 'rows',
  firstPage: 'First Page',
  previousPage: 'Previous Page',
  nextPage: 'Next Page',
  lastPage: 'Last Page',

  // Sorting
  sortAscending: 'Sort Ascending',
  sortDescending: 'Sort Descending',
  clearSort: 'Clear Sort',

  // Filtering
  filterPlaceholder: 'Filter...',
  contains: 'Contains',
  notContains: 'Not Contains',
  equals: 'Equals',
  notEquals: 'Not Equals',
  startsWith: 'Starts With',
  endsWith: 'Ends With',
  greaterThan: 'Greater Than',
  lessThan: 'Less Than',
  greaterThanOrEqual: 'Greater Than or Equal',
  lessThanOrEqual: 'Less Than or Equal',
  inRange: 'In Range',
  clearFilter: 'Clear Filter',
  applyFilter: 'Apply Filter',
  noFilter: 'No Filter',

  // Selection
  selectAll: 'Select All',
  selectNone: 'Select None',
  selected: 'Selected',

  // Column menu
  columnMenu: 'Column Menu',
  hideColumn: 'Hide Column',
  pinLeft: 'Pin Left',
  pinRight: 'Pin Right',
  unpin: 'Unpin',
  autoSize: 'Auto Size',

  // Status bar
  totalRows: 'Total Rows',
  filteredRows: 'Filtered',
  selectedRows: 'Selected',
  sum: 'Sum',
  avg: 'Avg',
  min: 'Min',
  max: 'Max',
  count: 'Count',

  // Loading / empty
  loading: 'Loading...',
  noRowsToShow: 'No rows to show',

  // Clipboard / export
  copy: 'Copy',
  cut: 'Cut',
  paste: 'Paste',
  exportCsv: 'Export CSV',
  exportExcel: 'Export Excel',
  exportJson: 'Export JSON',

  // Find
  findPlaceholder: 'Find in grid...',
  matchesFound: '{count} matches found',
  noMatches: 'No matches',

  // Row drag
  rowDragSingle: '1 row',
  rowDragMultiple: '{count} rows',

  // General
  search: 'Search',
  reset: 'Reset',
  cancel: 'Cancel',
  apply: 'Apply',
  ok: 'OK',
};

// ─── Locale Manager ─────────────────────────

export class Locale {
  #overrides: LocaleTextOverrides = {};
  #direction: TextDirection = 'ltr';

  // ─── Text Access ───────────────────────────

  getText(key: keyof LocaleText): string {
    return this.#overrides[key] ?? defaultLocale[key];
  }

  getTextWithParams(key: keyof LocaleText, params: Record<string, string | number>): string {
    let text = this.getText(key);
    for (const [param, value] of Object.entries(params)) {
      text = text.replace(`{${param}}`, String(value));
    }
    return text;
  }

  // ─── Overrides ─────────────────────────────

  setLocaleText(overrides: LocaleTextOverrides): void {
    this.#overrides = { ...overrides };
  }

  mergeLocaleText(overrides: LocaleTextOverrides): void {
    this.#overrides = { ...this.#overrides, ...overrides };
  }

  resetLocaleText(): void {
    this.#overrides = {};
  }

  get overrides(): LocaleTextOverrides {
    return { ...this.#overrides };
  }

  // ─── Direction (RTL) ───────────────────────

  get direction(): TextDirection {
    return this.#direction;
  }

  set direction(dir: TextDirection) {
    this.#direction = dir;
  }

  get isRtl(): boolean {
    return this.#direction === 'rtl';
  }

  // ─── Formatting Helpers ────────────────────

  formatNumber(value: number, locale?: string): string {
    try {
      return new Intl.NumberFormat(locale).format(value);
    } catch {
      return String(value);
    }
  }

  formatDate(value: Date, options?: Intl.DateTimeFormatOptions, locale?: string): string {
    try {
      return new Intl.DateTimeFormat(locale, options).format(value);
    } catch {
      return String(value);
    }
  }

  formatCurrency(value: number, currency = 'USD', locale?: string): string {
    try {
      return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
    } catch {
      return String(value);
    }
  }

  // ─── Full Locale Snapshot ──────────────────

  getAllText(): LocaleText {
    return { ...defaultLocale, ...this.#overrides };
  }
}
