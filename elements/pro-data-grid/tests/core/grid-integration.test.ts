import { describe, it, expect, beforeAll } from 'bun:test';
import { ElDmProDataGrid, registerProDataGrid } from '../../src/pro-data-grid.js';
import { ElDmGridColumn, registerGridColumn } from '../../src/grid-column.js';
import { ElDmGridColumnGroup, registerGridColumnGroup } from '../../src/grid-column-group.js';
import type { Row, ColumnDef, FilterModel } from '../../src/types.js';

beforeAll(() => {
  registerProDataGrid();
  registerGridColumn();
  registerGridColumnGroup();
});

// Helper: typed access to reactive properties
type GridProps = {
  selectionMode: string;
  pageSize: number;
  currentPage: number;
  editable: boolean;
  enableRowGrouping: boolean;
  groupDefaultExpanded: number;
  striped: boolean;
  bordered: boolean;
  loading: boolean;
};

const props = (el: ElDmProDataGrid) => el as unknown as GridProps;

describe('ElDmProDataGrid — integration', () => {
  const sampleData: Row[] = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `User ${String.fromCharCode(65 + (i % 26))}`,
    email: `user${i + 1}@test.com`,
    age: 20 + (i % 40),
    active: i % 2 === 0,
  }));

  const sampleColumns: ColumnDef[] = [
    { field: 'id', header: 'ID', width: 80, type: 'number', sortable: true },
    { field: 'name', header: 'Name', width: 200, sortable: true },
    { field: 'email', header: 'Email', width: 250 },
    { field: 'age', header: 'Age', width: 100, type: 'number', sortable: true },
    { field: 'active', header: 'Active', width: 100, type: 'boolean' },
  ];

  const createElement = (): ElDmProDataGrid => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    return el;
  };

  const cleanup = (el: HTMLElement) => {
    el.remove();
  };

  it('registers as a custom element', () => {
    expect(customElements.get('el-dm-pro-data-grid')).toBe(ElDmProDataGrid);
  });

  it('creates an instance with shadow DOM', () => {
    const el = createElement();
    expect(el.shadowRoot).toBeTruthy();
    cleanup(el);
  });

  it('accepts data and columns programmatically', () => {
    const el = createElement();
    el.columns = sampleColumns;
    el.data = sampleData;
    expect(el.data.length).toBe(50);
    expect(el.columns.length).toBe(5);
    cleanup(el);
  });

  it('applies sort model', () => {
    const el = createElement();
    el.columns = sampleColumns;
    el.data = sampleData;
    el.sortModel = [{ field: 'age', direction: 'asc' }];
    expect(el.sortModel).toEqual([{ field: 'age', direction: 'asc' }]);
    cleanup(el);
  });

  it('emits sort-change event', () => {
    const el = createElement();
    el.columns = sampleColumns;
    el.data = sampleData;

    let emitted = false;
    el.addEventListener('sort-change', () => {
      emitted = true;
    });

    el.sortModel = [{ field: 'name', direction: 'desc' }];
    expect(emitted).toBe(true);
    cleanup(el);
  });

  it('reflects boolean attributes (striped, bordered, loading)', () => {
    const el = createElement();
    (el as unknown as { striped: boolean }).striped = true;
    (el as unknown as { bordered: boolean }).bordered = true;
    (el as unknown as { loading: boolean }).loading = true;

    expect(el.hasAttribute('striped')).toBe(true);
    expect(el.hasAttribute('bordered')).toBe(true);
    expect(el.hasAttribute('loading')).toBe(true);
    cleanup(el);
  });

  it('exports CSV data', () => {
    const el = createElement();
    el.columns = sampleColumns;
    el.data = sampleData.slice(0, 2);

    // We can't easily test file download, but we can verify the method exists
    expect(typeof el.exportCsv).toBe('function');
    cleanup(el);
  });

  it('supports scrollToRow method', () => {
    const el = createElement();
    el.columns = sampleColumns;
    el.data = sampleData;
    expect(typeof el.scrollToRow).toBe('function');
    cleanup(el);
  });

  it('supports selectAll and deselectAll', () => {
    const el = createElement();
    (el as unknown as { selectionMode: string }).selectionMode = 'multiple';
    el.columns = sampleColumns;
    el.data = sampleData;

    el.selectAll();
    expect(el.selectedRows.length).toBe(50);

    el.deselectAll();
    expect(el.selectedRows.length).toBe(0);
    cleanup(el);
  });
});

describe('ElDmGridColumn', () => {
  it('registers as a custom element', () => {
    expect(customElements.get('el-dm-grid-column')).toBe(ElDmGridColumn);
  });

  it('exposes columnDef from attributes', () => {
    const el = document.createElement('el-dm-grid-column') as ElDmGridColumn;
    el.setAttribute('field', 'name');
    el.setAttribute('header', 'Full Name');
    el.setAttribute('width', '200');
    el.setAttribute('sortable', '');
    el.setAttribute('filterable', '');
    el.setAttribute('type', 'text');

    const def = el.columnDef;
    expect(def.field).toBe('name');
    expect(def.header).toBe('Full Name');
    expect(def.width).toBe(200);
    expect(def.sortable).toBe(true);
    expect(def.filterable).toBe(true);
    expect(def.type).toBe('text');
  });

  it('handles missing attributes with defaults', () => {
    const el = document.createElement('el-dm-grid-column') as ElDmGridColumn;
    el.setAttribute('field', 'id');

    const def = el.columnDef;
    expect(def.field).toBe('id');
    expect(def.header).toBe('id'); // falls back to field
    expect(def.width).toBeUndefined();
    expect(def.sortable).toBe(false);
  });
});

describe('ElDmGridColumnGroup', () => {
  it('registers as a custom element', () => {
    expect(customElements.get('el-dm-grid-column-group')).toBe(ElDmGridColumnGroup);
  });

  it('reads group attributes', () => {
    const el = document.createElement('el-dm-grid-column-group') as ElDmGridColumnGroup;
    el.setAttribute('header', 'Personal Info');
    el.setAttribute('group-id', 'personal');

    expect(el.header).toBe('Personal Info');
    expect(el.groupId).toBe('personal');
  });

  it('collects column defs from children', () => {
    const group = document.createElement('el-dm-grid-column-group') as ElDmGridColumnGroup;
    group.setAttribute('header', 'Contact');

    const col1 = document.createElement('el-dm-grid-column') as ElDmGridColumn;
    col1.setAttribute('field', 'email');
    col1.setAttribute('header', 'Email');

    const col2 = document.createElement('el-dm-grid-column') as ElDmGridColumn;
    col2.setAttribute('field', 'phone');
    col2.setAttribute('header', 'Phone');

    group.appendChild(col1);
    group.appendChild(col2);

    const defs = group.columnDefs;
    expect(defs.length).toBe(2);
    expect(defs[0].field).toBe('email');
    expect(defs[1].field).toBe('phone');
  });
});

// ─── Engine Composition Tests ───────────────────────────────

describe('Filter → Sort pipeline', () => {
  const data: Row[] = [
    { id: 1, name: 'Alice', age: 30, dept: 'Eng' },
    { id: 2, name: 'Bob', age: 25, dept: 'Sales' },
    { id: 3, name: 'Charlie', age: 35, dept: 'Eng' },
    { id: 4, name: 'Diana', age: 28, dept: 'HR' },
    { id: 5, name: 'Eve', age: 32, dept: 'Eng' },
  ];
  const cols: ColumnDef[] = [
    { field: 'id', header: 'ID', type: 'number', sortable: true },
    { field: 'name', header: 'Name', sortable: true, filterable: true },
    { field: 'age', header: 'Age', type: 'number', sortable: true, filterable: true },
    { field: 'dept', header: 'Dept', sortable: true, filterable: true },
  ];

  const makeGrid = () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    el.columns = cols;
    el.data = data;
    return el;
  };

  it('filter reduces rows then sort reorders them', () => {
    const el = makeGrid();
    // Filter to only Eng department
    el.filterModel = {
      dept: { type: 'text', operator: 'equals', value: 'Eng' } as FilterModel,
    };
    // Sort by age ascending
    el.sortModel = [{ field: 'age', direction: 'asc' }];

    // CSV export should show filtered+sorted data
    const csv = el.getDataAsCsv();
    const lines = csv.trim().split('\n');
    // Header + 3 Eng rows
    expect(lines.length).toBe(4);
    // Sorted by age: Alice(30), Eve(32), Charlie(35)
    expect(lines[1]).toContain('Alice');
    expect(lines[2]).toContain('Eve');
    expect(lines[3]).toContain('Charlie');
    el.remove();
  });

  it('clearing filter restores all rows', () => {
    const el = makeGrid();
    el.filterModel = {
      dept: { type: 'text', operator: 'equals', value: 'HR' } as FilterModel,
    };
    let csv = el.getDataAsCsv();
    expect(csv.trim().split('\n').length).toBe(2); // header + 1 HR row

    el.filterModel = {};
    csv = el.getDataAsCsv();
    expect(csv.trim().split('\n').length).toBe(6); // header + 5 rows
    el.remove();
  });

  it('sort-change event includes updated sort model', () => {
    const el = makeGrid();
    let detail: unknown = null;
    el.addEventListener('sort-change', ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);

    el.sortModel = [{ field: 'name', direction: 'desc' }];
    expect(detail).toEqual({ sortModel: [{ field: 'name', direction: 'desc' }] });
    el.remove();
  });
});

describe('Filter + Pagination composition', () => {
  const data: Row[] = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    category: i < 12 ? 'A' : 'B',
  }));
  const cols: ColumnDef[] = [
    { field: 'id', header: 'ID', type: 'number' },
    { field: 'name', header: 'Name' },
    { field: 'category', header: 'Cat', filterable: true },
  ];

  it('pagination works on filtered data', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    props(el).pageSize = 5;
    el.columns = cols;
    el.data = data;

    // Without filter: 20 rows, page 1 shows 5
    let csv = el.getDataAsCsv();
    // getDataAsCsv uses processedRows (all filtered), not paginated
    expect(csv.trim().split('\n').length).toBe(21); // header + 20

    // Filter to category A: 12 rows
    el.filterModel = {
      category: { type: 'text', operator: 'equals', value: 'A' } as FilterModel,
    };
    csv = el.getDataAsCsv();
    expect(csv.trim().split('\n').length).toBe(13); // header + 12

    el.remove();
  });
});

describe('Selection + Export composition', () => {
  const data: Row[] = [
    { id: 1, name: 'Alice', value: 100 },
    { id: 2, name: 'Bob', value: 200 },
    { id: 3, name: 'Charlie', value: 300 },
  ];
  const cols: ColumnDef[] = [
    { field: 'id', header: 'ID', type: 'number' },
    { field: 'name', header: 'Name' },
    { field: 'value', header: 'Value', type: 'number' },
  ];

  it('selectAll + deselectAll cycle works', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    props(el).selectionMode = 'multiple';
    el.columns = cols;
    el.data = data;

    el.selectAll();
    expect(el.selectedRows.length).toBe(3);

    el.deselectAll();
    expect(el.selectedRows.length).toBe(0);

    el.remove();
  });

  it('selection-change event fires with details', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    props(el).selectionMode = 'multiple';
    el.columns = cols;
    el.data = data;

    const events: unknown[] = [];
    el.addEventListener('selection-change', ((e: CustomEvent) => {
      events.push(e.detail);
    }) as EventListener);

    el.selectAll();
    expect(events.length).toBeGreaterThanOrEqual(1);

    el.remove();
  });

  it('getDataAsJson returns valid JSON', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    el.columns = cols;
    el.data = data;

    const json = el.getDataAsJson();
    const parsed = JSON.parse(json);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(3);
    expect(parsed[0].name).toBe('Alice');

    el.remove();
  });
});

describe('Transaction API', () => {
  const data: Row[] = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ];
  const cols: ColumnDef[] = [
    { field: 'id', header: 'ID', type: 'number' },
    { field: 'name', header: 'Name' },
  ];

  it('adds rows via transaction', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    el.columns = cols;
    el.data = [...data];

    const result = el.applyTransaction({
      add: [{ id: 3, name: 'Charlie' }],
    });

    expect(result.add.length).toBe(1);
    expect(el.data.length).toBe(3);
    el.remove();
  });

  it('removes rows via transaction', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    el.columns = cols;
    el.data = [...data];

    const result = el.applyTransaction({
      remove: [{ id: 1 }],
    });

    expect(result.remove.length).toBe(1);
    expect(el.data.length).toBe(1);
    expect(el.data[0].name).toBe('Bob');
    el.remove();
  });

  it('updates rows via transaction', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    el.columns = cols;
    el.data = [...data];

    const result = el.applyTransaction({
      update: [{ id: 2, name: 'Bobby' }],
    });

    expect(result.update.length).toBe(1);
    expect(el.data.find((r) => r.id === 2)?.name).toBe('Bobby');
    el.remove();
  });

  it('emits row-data-updated event', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    el.columns = cols;
    el.data = [...data];

    let detail: unknown = null;
    el.addEventListener('row-data-updated', ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);

    el.applyTransaction({ add: [{ id: 3, name: 'Eve' }] });
    expect(detail).toBeTruthy();

    el.remove();
  });
});

describe('State persistence', () => {
  const data: Row[] = [
    { id: 1, name: 'Alice', age: 30 },
    { id: 2, name: 'Bob', age: 25 },
  ];
  const cols: ColumnDef[] = [
    { field: 'id', header: 'ID', type: 'number', sortable: true },
    { field: 'name', header: 'Name', sortable: true },
    { field: 'age', header: 'Age', type: 'number', sortable: true },
  ];

  it('captures and restores grid state', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    el.columns = cols;
    el.data = data;
    el.sortModel = [{ field: 'age', direction: 'asc' }];

    const state = el.getState();
    expect(state.sortModel).toEqual([{ field: 'age', direction: 'asc' }]);

    // Reset and verify state is cleared
    el.resetState();
    expect(el.sortModel).toEqual([]);

    // Restore and verify
    el.setState(state);
    expect(el.sortModel).toEqual([{ field: 'age', direction: 'asc' }]);

    el.remove();
  });

  it('emits state-changed event on setState', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    el.columns = cols;
    el.data = data;

    let emitted = false;
    el.addEventListener('state-changed', () => {
      emitted = true;
    });

    el.setState({ sortModel: [{ field: 'name', direction: 'desc' }] });
    expect(emitted).toBe(true);

    el.remove();
  });
});

describe('Row pinning', () => {
  const data: Row[] = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
  ];
  const cols: ColumnDef[] = [
    { field: 'id', header: 'ID' },
    { field: 'name', header: 'Name' },
  ];

  it('pins row to top and bottom', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    el.columns = cols;
    el.data = data;

    el.pinRowTop(data[0]);
    expect(el.pinnedTopRows.length).toBe(1);
    expect(el.pinnedTopRows[0].name).toBe('Alice');

    el.pinRowBottom(data[2]);
    expect(el.pinnedBottomRows.length).toBe(1);
    expect(el.pinnedBottomRows[0].name).toBe('Charlie');

    el.remove();
  });

  it('unpins a pinned row', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    el.columns = cols;
    el.data = data;

    el.pinRowTop(data[0]);
    expect(el.pinnedTopRows.length).toBe(1);

    el.unpinRow(data[0]);
    expect(el.pinnedTopRows.length).toBe(0);

    el.remove();
  });

  it('emits row-pinned events', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    el.columns = cols;
    el.data = data;

    const events: unknown[] = [];
    el.addEventListener('row-pinned', ((e: CustomEvent) => {
      events.push(e.detail);
    }) as EventListener);

    el.pinRowTop(data[0]);
    el.pinRowBottom(data[1]);

    expect(events.length).toBe(2);
    expect((events[0] as { position: string }).position).toBe('top');
    expect((events[1] as { position: string }).position).toBe('bottom');

    el.remove();
  });
});

describe('Column operations', () => {
  const data: Row[] = [
    { id: 1, name: 'Alice', age: 30 },
  ];
  const cols: ColumnDef[] = [
    { field: 'id', header: 'ID', width: 80 },
    { field: 'name', header: 'Name', width: 200 },
    { field: 'age', header: 'Age', width: 100 },
  ];

  it('hides and shows columns', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    el.columns = cols;
    el.data = data;

    el.setColumnVisible('age', false);
    // CSV should not include age column
    const csv = el.getDataAsCsv();
    const headerLine = csv.trim().split('\n')[0];
    expect(headerLine).not.toContain('Age');

    el.setColumnVisible('age', true);
    const csv2 = el.getDataAsCsv();
    const headerLine2 = csv2.trim().split('\n')[0];
    expect(headerLine2).toContain('Age');

    el.remove();
  });

  it('pins column left/right', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    el.columns = cols;
    el.data = data;

    // Pin left — should not throw
    el.pinColumn('id', 'left');
    el.pinColumn('age', 'right');

    // Unpin
    el.pinColumn('id', false);
    el.pinColumn('age', false);

    el.remove();
  });
});

describe('i18n (Locale)', () => {
  it('provides access to locale instance', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    el.columns = [];
    el.data = [];

    expect(el.locale).toBeTruthy();
    expect(typeof el.locale.getText).toBe('function');

    el.remove();
  });

  it('setLocaleText merges custom translations', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    el.columns = [];
    el.data = [];

    el.setLocaleText({ noRowsToShow: 'No data available' });
    expect(el.locale.getText('noRowsToShow')).toBe('No data available');

    el.remove();
  });
});

describe('Quick filter', () => {
  const data: Row[] = [
    { id: 1, name: 'Alice Anderson', role: 'Engineer' },
    { id: 2, name: 'Bob Brown', role: 'Manager' },
    { id: 3, name: 'Charlie Clark', role: 'Engineer' },
  ];
  const cols: ColumnDef[] = [
    { field: 'id', header: 'ID', type: 'number' },
    { field: 'name', header: 'Name' },
    { field: 'role', header: 'Role' },
  ];

  it('setQuickFilterText and getQuickFilterText round-trip', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    el.columns = cols;
    el.data = data;

    el.setQuickFilterText('alice');
    expect(el.getQuickFilterText()).toBe('alice');

    // CSV export reflects filtered data
    const csv = el.getDataAsCsv();
    const lines = csv.trim().split('\n');
    expect(lines.length).toBe(2); // header + Alice

    el.setQuickFilterText('');
    const csv2 = el.getDataAsCsv();
    expect(csv2.trim().split('\n').length).toBe(4); // header + 3

    el.remove();
  });
});

describe('Row grouping', () => {
  const data: Row[] = [
    { id: 1, name: 'Alice', dept: 'Eng', salary: 100 },
    { id: 2, name: 'Bob', dept: 'Sales', salary: 200 },
    { id: 3, name: 'Charlie', dept: 'Eng', salary: 150 },
    { id: 4, name: 'Diana', dept: 'Sales', salary: 180 },
  ];
  const cols: ColumnDef[] = [
    { field: 'id', header: 'ID', type: 'number' },
    { field: 'name', header: 'Name' },
    { field: 'dept', header: 'Dept', enableRowGroup: true },
    { field: 'salary', header: 'Salary', type: 'number', aggFunc: 'sum' },
  ];

  it('setRowGroupColumns triggers group-change event', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    props(el).enableRowGrouping = true;
    el.columns = cols;
    el.data = data;

    let detail: unknown = null;
    el.addEventListener('group-change', ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);

    el.setRowGroupColumns(['dept']);
    expect(detail).toEqual({ groupColumns: ['dept'] });
    expect(el.rowGroupColumns).toEqual(['dept']);

    el.remove();
  });
});

describe('Advanced filter expressions', () => {
  const data: Row[] = [
    { id: 1, name: 'Alice', age: 30 },
    { id: 2, name: 'Bob', age: 25 },
    { id: 3, name: 'Charlie', age: 35 },
    { id: 4, name: 'Diana', age: 28 },
  ];
  const cols: ColumnDef[] = [
    { field: 'id', header: 'ID', type: 'number' },
    { field: 'name', header: 'Name' },
    { field: 'age', header: 'Age', type: 'number' },
  ];

  it('sets and gets advanced filter expression', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    el.columns = cols;
    el.data = data;

    const expr = {
      type: 'condition' as const,
      field: 'age',
      operator: 'greaterThan' as const,
      value: 29,
    };

    el.advancedFilterExpression = expr;
    expect(el.advancedFilterExpression).toEqual(expr);

    el.remove();
  });

  it('setExternalFilter applies custom predicate', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    el.columns = cols;
    el.data = data;

    el.setExternalFilter((row) => (row.age as number) >= 30);

    const csv = el.getDataAsCsv();
    const lines = csv.trim().split('\n');
    // header + Alice(30), Charlie(35)
    expect(lines.length).toBe(3);

    el.setExternalFilter(null);
    const csv2 = el.getDataAsCsv();
    expect(csv2.trim().split('\n').length).toBe(5); // header + 4

    el.remove();
  });
});

describe('Row expanding', () => {
  const data: Row[] = [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
  ];
  const cols: ColumnDef[] = [
    { field: 'id', header: 'ID' },
    { field: 'name', header: 'Name' },
  ];

  it('expand and collapse row by id', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    el.columns = cols;
    el.data = data;

    el.expandRow('1');
    expect(el.isRowExpanded('1')).toBe(true);
    expect(el.getExpandedRows()).toContain('1');

    el.collapseRow('1');
    expect(el.isRowExpanded('1')).toBe(false);

    el.remove();
  });

  it('expandAllRows and collapseAllRows', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    el.columns = cols;
    el.data = data;

    el.expandAllRows();
    expect(el.getExpandedRows().length).toBe(2);

    el.collapseAllRows();
    expect(el.getExpandedRows().length).toBe(0);

    el.remove();
  });

  it('toggleRowExpand toggles state', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    el.columns = cols;
    el.data = data;

    el.toggleRowExpand('2');
    expect(el.isRowExpanded('2')).toBe(true);

    el.toggleRowExpand('2');
    expect(el.isRowExpanded('2')).toBe(false);

    el.remove();
  });
});

describe('Chained operations (multi-engine pipeline)', () => {
  const data: Row[] = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `User_${String.fromCharCode(74 - i)}`, // J, I, H, G, F, E, D, C, B, A
    score: (i + 1) * 10, // 10, 20, ..., 100
    group: i < 5 ? 'X' : 'Y',
  }));
  const cols: ColumnDef[] = [
    { field: 'id', header: 'ID', type: 'number', sortable: true },
    { field: 'name', header: 'Name', sortable: true },
    { field: 'score', header: 'Score', type: 'number', sortable: true, filterable: true },
    { field: 'group', header: 'Group', filterable: true },
  ];

  it('filter → sort → export pipeline', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    el.columns = cols;
    el.data = data;

    // Filter: score > 30 (rows 4-10, score 40-100)
    el.filterModel = {
      score: {
        type: 'number',
        operator: 'greaterThan',
        value: 30,
      } as FilterModel,
    };

    // Sort by name ascending
    el.sortModel = [{ field: 'name', direction: 'asc' }];

    const csv = el.getDataAsCsv();
    const lines = csv.trim().split('\n');
    expect(lines.length).toBe(8); // header + 7 rows (scores 40-100)

    // First data row should be alphabetically first name among score > 30
    // Names for score>30: User_G(40), User_F(50), User_E(60), User_D(70), User_C(80), User_B(90), User_A(100)
    // Sorted asc: User_A, User_B, User_C, User_D, User_E, User_F, User_G
    expect(lines[1]).toContain('User_A');
    expect(lines[7]).toContain('User_G');

    el.remove();
  });

  it('quick filter + column filter compose (both applied)', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    el.columns = cols;
    el.data = data;

    // Quick filter for "User_A" — matches only User_A (score=100)
    el.setQuickFilterText('User_A');

    // Also filter by group=X (scores 10-50)
    el.filterModel = {
      group: { type: 'text', operator: 'equals', value: 'X' } as FilterModel,
    };

    // User_A has score=100, group=Y → fails group filter
    const csv = el.getDataAsCsv();
    const lines = csv.trim().split('\n');
    expect(lines.length).toBe(1); // header only, no matching rows

    el.remove();
  });

  it('transaction after filter updates correctly', () => {
    const el = document.createElement('el-dm-pro-data-grid') as ElDmProDataGrid;
    document.body.appendChild(el);
    el.columns = cols;
    el.data = [...data];

    // Filter to group X
    el.filterModel = {
      group: { type: 'text', operator: 'equals', value: 'X' } as FilterModel,
    };

    // Add a row in group X
    el.applyTransaction({
      add: [{ id: 11, name: 'User_New', score: 55, group: 'X' }],
    });

    const csv = el.getDataAsCsv();
    // Should include the new row in filtered results (group X now has 6 rows)
    expect(csv).toContain('User_New');

    el.remove();
  });
});
