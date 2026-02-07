import { describe, it, expect, beforeAll } from 'bun:test';
import { ElDmProDataGrid, registerProDataGrid } from '../../src/pro-data-grid.js';
import { ElDmGridColumn, registerGridColumn } from '../../src/grid-column.js';
import { ElDmGridColumnGroup, registerGridColumnGroup } from '../../src/grid-column-group.js';
import type { Row, ColumnDef } from '../../src/types.js';

beforeAll(() => {
  registerProDataGrid();
  registerGridColumn();
  registerGridColumnGroup();
});

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
