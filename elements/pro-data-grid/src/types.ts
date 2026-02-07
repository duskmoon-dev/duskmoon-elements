/**
 * Type definitions for el-dm-pro-data-grid
 */

// ─── Core Types ──────────────────────────────

export type Row = Record<string, unknown>;

export interface SortItem {
  field: string;
  direction: 'asc' | 'desc';
}

export interface CellChange {
  rowIndex: number;
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

// ─── Column Definitions ──────────────────────

export interface ColumnDef {
  field: string;
  header: string;
  colId?: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  flex?: number;
  resizable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean | ((params: EditableParams) => boolean);
  hidden?: boolean;
  lockVisible?: boolean;
  lockPosition?: boolean;
  pinned?: 'left' | 'right' | false;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'badge' | 'custom';
  format?: string;
  align?: 'left' | 'center' | 'right';
  headerAlign?: 'left' | 'center' | 'right';
  cssClass?: string | ((params: CellClassParams) => string);
  cellStyle?: Record<string, string> | ((params: CellStyleParams) => Record<string, string>);
  renderer?: (params: CellRendererParams) => string | HTMLElement;
  headerRenderer?: (params: HeaderRendererParams) => string | HTMLElement;
  filterType?: 'text' | 'number' | 'date' | 'set' | 'multi';
  filterOptions?: string[];
  filterParams?: FilterParams;
  floatingFilter?: boolean;
  floatingFilterRenderer?: (params: FloatingFilterParams) => string | HTMLElement;
  editor?: 'text' | 'number' | 'select' | 'date' | 'checkbox' | 'richText';
  editorOptions?: string[];
  editorParams?: EditorParams;
  validator?: (params: ValidatorParams) => boolean | string;
  comparator?: (a: unknown, b: unknown, rowA: Row, rowB: Row, isDesc: boolean) => number;
  rowGroup?: boolean;
  rowGroupIndex?: number;
  enableRowGroup?: boolean;
  pivot?: boolean;
  pivotIndex?: number;
  enablePivot?: boolean;
  aggFunc?: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'first' | 'last' | string;
  enableValue?: boolean;
  colSpan?: (params: ColSpanParams) => number;
  rowSpan?: (params: RowSpanParams) => number;
  tooltipField?: string;
  tooltipRenderer?: (params: TooltipParams) => string;
  children?: ColumnDef[];
  groupId?: string;
  openByDefault?: boolean;
  marryChildren?: boolean;
}

// ─── Callback Parameter Types ────────────────

export interface CellRendererParams {
  value: unknown;
  row: Row;
  field: string;
  rowIndex: number;
  column: ColumnDef;
}

export interface HeaderRendererParams {
  column: ColumnDef;
  sortDirection: 'asc' | 'desc' | null;
  sortIndex: number | null;
}

export interface CellClassParams {
  value: unknown;
  row: Row;
  field: string;
  rowIndex: number;
}

export interface CellStyleParams {
  value: unknown;
  row: Row;
  field: string;
  rowIndex: number;
}

export interface EditableParams {
  row: Row;
  field: string;
  rowIndex: number;
}

export interface ValidatorParams {
  value: unknown;
  oldValue: unknown;
  row: Row;
  field: string;
}

export interface ColSpanParams {
  row: Row;
  field: string;
  rowIndex: number;
}

export interface RowSpanParams {
  row: Row;
  field: string;
  rowIndex: number;
}

export interface TooltipParams {
  value: unknown;
  row: Row;
  field: string;
}

export interface FloatingFilterParams {
  column: ColumnDef;
  currentValue: string;
  onFilterChange: (value: string) => void;
}

export interface FilterParams {
  debounceMs?: number;
  buttons?: ('apply' | 'clear' | 'reset' | 'cancel')[];
  closeOnApply?: boolean;
  values?: unknown[];
  valueFormatter?: (value: unknown) => string;
}

export interface EditorParams {
  values?: unknown[];
  valueFormatter?: (value: unknown) => string;
  valueSetter?: (params: { value: unknown; row: Row; field: string }) => boolean;
}

// ─── Filter Models ───────────────────────────

export type FilterModel =
  | TextFilterModel
  | NumberFilterModel
  | DateFilterModel
  | SetFilterModel
  | MultiFilterModel;

export interface TextFilterModel {
  type: 'text';
  operator:
    | 'contains'
    | 'notContains'
    | 'equals'
    | 'notEqual'
    | 'startsWith'
    | 'endsWith'
    | 'blank'
    | 'notBlank';
  value: string;
  condition2?: { operator: string; value: string };
  join?: 'AND' | 'OR';
}

export interface NumberFilterModel {
  type: 'number';
  operator:
    | 'equals'
    | 'notEqual'
    | 'lessThan'
    | 'lessThanOrEqual'
    | 'greaterThan'
    | 'greaterThanOrEqual'
    | 'inRange'
    | 'blank'
    | 'notBlank';
  value: number;
  valueTo?: number;
  condition2?: { operator: string; value: number; valueTo?: number };
  join?: 'AND' | 'OR';
}

export interface DateFilterModel {
  type: 'date';
  operator: 'equals' | 'notEqual' | 'lessThan' | 'greaterThan' | 'inRange' | 'blank' | 'notBlank';
  value: string;
  valueTo?: string;
  condition2?: { operator: string; value: string; valueTo?: string };
  join?: 'AND' | 'OR';
}

export interface SetFilterModel {
  type: 'set';
  values: unknown[];
  miniFilter?: string;
}

export interface MultiFilterModel {
  type: 'multi';
  filterModels: FilterModel[];
}

// ─── Grid State ──────────────────────────────

export interface GridState {
  columns: ColumnState[];
  sort: SortItem[];
  filter: Record<string, FilterModel>;
  group: { groupColumns: string[]; expandedGroups: string[][] };
  pivot: { pivotMode: boolean; pivotColumns: string[] };
  rangeSelection?: CellRange[];
  pagination?: { currentPage: number; pageSize: number };
  sideBar?: { openToolPanel: string | null };
  scroll?: { top: number; left: number };
}

export interface ColumnState {
  colId: string;
  width: number;
  pinned: 'left' | 'right' | null;
  hidden: boolean;
  sortIndex: number | null;
  sortDirection: 'asc' | 'desc' | null;
  rowGroupIndex: number | null;
  pivotIndex: number | null;
  aggFunc: string | null;
  flex: number | null;
}

// ─── Range Selection ─────────────────────────

export interface CellRange {
  startRow: { index: number };
  endRow: { index: number };
  columns: ColumnDef[];
  startColumn: ColumnDef;
}

export interface CellRangeParams {
  rowStartIndex: number;
  rowEndIndex: number;
  columns: string[];
}

// ─── Virtual Scroller ────────────────────────

export interface ScrollState {
  scrollTop: number;
  scrollLeft: number;
  viewportHeight: number;
  viewportWidth: number;
}

export interface VisibleRange {
  startIndex: number;
  endIndex: number;
  startOffset: number;
}

// ─── Event Details ───────────────────────────

export interface SortChangeDetail {
  sortModel: SortItem[];
}

export interface FilterChangeDetail {
  filterModel: Record<string, FilterModel>;
}

export interface PageChangeDetail {
  page: number;
  pageSize: number;
}

export interface SelectionChangeDetail {
  selectedRows: Row[];
  added: Row[];
  removed: Row[];
}

export interface CellClickDetail {
  row: Row;
  field: string;
  value: unknown;
  rowIndex: number;
}

export interface RowClickDetail {
  row: Row;
  index: number;
}

export interface ColumnResizeDetail {
  field: string;
  width: number;
}

export interface ColumnMoveDetail {
  field: string;
  fromIndex: number;
  toIndex: number;
}

// ─── Internal Types ──────────────────────────

export interface ColumnStateInternal {
  def: ColumnDef;
  width: number;
  left: number;
  visible: boolean;
  sortDirection: 'asc' | 'desc' | null;
  sortIndex: number | null;
}
