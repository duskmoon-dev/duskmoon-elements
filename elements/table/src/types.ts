/**
 * Column definition for table columns
 */
export interface TableColumn {
  /** Unique identifier/key for the column - used for data mapping */
  key: string;
  /** Display label in header */
  label: string;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Column width (CSS value, e.g., '100px', '20%', 'auto') */
  width?: string;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Whether column is hidden */
  hidden?: boolean;
}

/**
 * Row data - flexible object with any properties
 */
export interface TableRow {
  /** Unique row identifier (required for selection) */
  id: string | number;
  /** Row data - key matches column.key */
  [key: string]: unknown;
}

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Selection mode
 */
export type SelectionMode = 'none' | 'single' | 'multiple';

/**
 * Sort event detail
 */
export interface TableSortEventDetail {
  column: string;
  direction: SortDirection;
}

/**
 * Select event detail
 */
export interface TableSelectEventDetail {
  selectedIds: (string | number)[];
  selectedRows: TableRow[];
}

/**
 * Page change event detail
 */
export interface TablePageEventDetail {
  page: number;
  pageSize: number;
}

/**
 * Row click event detail
 */
export interface TableRowClickEventDetail {
  row: TableRow;
  rowIndex: number;
}
