import { describe, it, expect } from 'bun:test';
import { ColumnController } from '../../src/core/column-controller.js';
import type { ColumnDef } from '../../src/types.js';

describe('ColumnController', () => {
  const makeDefs = (): ColumnDef[] => [
    { field: 'id', header: 'ID', width: 80, sortable: true },
    { field: 'name', header: 'Name', width: 200, sortable: true, resizable: true },
    { field: 'email', header: 'Email', width: 250, resizable: true },
    { field: 'status', header: 'Status', width: 120, hidden: true },
  ];

  it('initializes columns from definitions', () => {
    const ctrl = new ColumnController();
    ctrl.setColumns(makeDefs());
    expect(ctrl.columns.length).toBe(4);
  });

  it('filters visible columns (excludes hidden)', () => {
    const ctrl = new ColumnController();
    ctrl.setColumns(makeDefs());
    expect(ctrl.visibleColumns.length).toBe(3); // status is hidden
  });

  it('calculates total width of visible columns', () => {
    const ctrl = new ColumnController();
    ctrl.setColumns(makeDefs());
    expect(ctrl.totalWidth).toBe(80 + 200 + 250);
  });

  it('calculates left positions correctly', () => {
    const ctrl = new ColumnController();
    ctrl.setColumns(makeDefs());
    const visible = ctrl.visibleColumns;
    expect(visible[0].left).toBe(0);
    expect(visible[1].left).toBe(80);
    expect(visible[2].left).toBe(280);
  });

  it('resizes a column with constraints', () => {
    const ctrl = new ColumnController();
    ctrl.setColumns([
      { field: 'name', header: 'Name', width: 200, minWidth: 100, maxWidth: 300 },
    ]);
    ctrl.resizeColumn('name', 500);
    expect(ctrl.columns[0].width).toBe(300); // clamped to max

    ctrl.resizeColumn('name', 10);
    expect(ctrl.columns[0].width).toBe(100); // clamped to min
  });

  it('toggles column visibility', () => {
    const ctrl = new ColumnController();
    ctrl.setColumns(makeDefs());
    expect(ctrl.visibleColumns.length).toBe(3);

    ctrl.setColumnVisible('email', false);
    expect(ctrl.visibleColumns.length).toBe(2);

    ctrl.setColumnVisible('email', true);
    expect(ctrl.visibleColumns.length).toBe(3);
  });

  it('respects lockVisible flag', () => {
    const ctrl = new ColumnController();
    ctrl.setColumns([{ field: 'id', header: 'ID', width: 80, lockVisible: true }]);
    ctrl.setColumnVisible('id', false);
    expect(ctrl.visibleColumns.length).toBe(1); // unchanged
  });

  it('moves a column to a new position', () => {
    const ctrl = new ColumnController();
    ctrl.setColumns(makeDefs());
    const original = ctrl.visibleColumns.map((c) => c.def.field);
    expect(original).toEqual(['id', 'name', 'email']);

    ctrl.moveColumn('email', 0);
    const after = ctrl.visibleColumns.map((c) => c.def.field);
    expect(after).toEqual(['email', 'id', 'name']);
  });

  it('respects lockPosition flag', () => {
    const ctrl = new ColumnController();
    ctrl.setColumns([
      { field: 'id', header: 'ID', width: 80, lockPosition: true },
      { field: 'name', header: 'Name', width: 200 },
    ]);
    ctrl.moveColumn('id', 1);
    expect(ctrl.columns[0].def.field).toBe('id'); // unchanged
  });

  it('applies sort model to column state', () => {
    const ctrl = new ColumnController();
    ctrl.setColumns(makeDefs());
    ctrl.applySortModel([
      { field: 'name', direction: 'asc' },
      { field: 'id', direction: 'desc' },
    ]);

    const nameCol = ctrl.getColumn('name');
    expect(nameCol?.sortDirection).toBe('asc');
    expect(nameCol?.sortIndex).toBe(0);

    const idCol = ctrl.getColumn('id');
    expect(idCol?.sortDirection).toBe('desc');
    expect(idCol?.sortIndex).toBe(1);

    const emailCol = ctrl.getColumn('email');
    expect(emailCol?.sortDirection).toBeNull();
    expect(emailCol?.sortIndex).toBeNull();
  });

  it('sizeColumnsToFit distributes space using flex', () => {
    const ctrl = new ColumnController();
    ctrl.setColumns([
      { field: 'id', header: 'ID', width: 80 },
      { field: 'name', header: 'Name', width: 200, flex: 2, minWidth: 50 },
      { field: 'email', header: 'Email', width: 250, flex: 1, minWidth: 50 },
    ]);
    ctrl.sizeColumnsToFit(800);
    // Remaining = 800 - 80 = 720, flex total = 3
    // name = 720 * 2/3 = 480, email = 720 * 1/3 = 240
    const name = ctrl.getColumn('name');
    const email = ctrl.getColumn('email');
    expect(name?.width).toBeCloseTo(480, 0);
    expect(email?.width).toBeCloseTo(240, 0);
  });

  it('getColumn returns undefined for unknown field', () => {
    const ctrl = new ColumnController();
    ctrl.setColumns(makeDefs());
    expect(ctrl.getColumn('nonexistent')).toBeUndefined();
  });
});
