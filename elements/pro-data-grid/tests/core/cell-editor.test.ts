import { describe, it, expect } from 'bun:test';
import { CellEditor } from '../../src/core/cell-editor.js';
import type { Row, ColumnDef } from '../../src/types.js';

describe('CellEditor', () => {
  const textCol: ColumnDef = { field: 'name', header: 'Name', type: 'text', editable: true };
  const numCol: ColumnDef = { field: 'age', header: 'Age', type: 'number', editable: true };
  const boolCol: ColumnDef = {
    field: 'active',
    header: 'Active',
    type: 'boolean',
    editable: true,
  };
  const selectCol: ColumnDef = {
    field: 'status',
    header: 'Status',
    type: 'text',
    editable: true,
    editor: 'select',
    editorOptions: ['active', 'inactive', 'pending'],
  };
  const dateCol: ColumnDef = { field: 'date', header: 'Date', type: 'date', editable: true };
  const readonlyCol: ColumnDef = { field: 'id', header: 'ID', type: 'number', editable: false };

  const row: Row = { id: 1, name: 'Alice', age: 25, active: true, status: 'active', date: '2023-01-15' };

  it('starts with no editing state', () => {
    const editor = new CellEditor();
    expect(editor.isEditing).toBe(false);
    expect(editor.editingState).toBeNull();
  });

  it('starts editing an editable cell', () => {
    const editor = new CellEditor();
    const state = editor.startEditing(row, 0, textCol);
    expect(state).not.toBeNull();
    expect(state!.field).toBe('name');
    expect(state!.originalValue).toBe('Alice');
    expect(state!.editorType).toBe('text');
    expect(editor.isEditing).toBe(true);
  });

  it('returns null for non-editable cell', () => {
    const editor = new CellEditor();
    const state = editor.startEditing(row, 0, readonlyCol);
    expect(state).toBeNull();
    expect(editor.isEditing).toBe(false);
  });

  it('resolves editor type from column type', () => {
    const editor = new CellEditor();
    expect(editor.startEditing(row, 0, numCol)!.editorType).toBe('number');
    editor.cancelEditing();
    expect(editor.startEditing(row, 0, boolCol)!.editorType).toBe('checkbox');
    editor.cancelEditing();
    expect(editor.startEditing(row, 0, dateCol)!.editorType).toBe('date');
    editor.cancelEditing();
    expect(editor.startEditing(row, 0, selectCol)!.editorType).toBe('select');
  });

  it('uses key char as initial value for text editors', () => {
    const editor = new CellEditor();
    const state = editor.startEditing(row, 0, textCol, 'B');
    expect(state!.currentValue).toBe('B');
  });

  it('ignores key char for checkbox editor', () => {
    const editor = new CellEditor();
    const state = editor.startEditing(row, 0, boolCol, 'x');
    expect(state!.currentValue).toBe(true); // keeps original
  });

  describe('setValue', () => {
    it('updates current value', () => {
      const editor = new CellEditor();
      editor.startEditing(row, 0, textCol);
      editor.setValue('Bob');
      expect(editor.editingState!.currentValue).toBe('Bob');
    });

    it('does nothing when not editing', () => {
      const editor = new CellEditor();
      editor.setValue('Bob');
      expect(editor.editingState).toBeNull();
    });
  });

  describe('stopEditing', () => {
    it('returns change when value is modified', () => {
      const editor = new CellEditor();
      editor.startEditing(row, 0, textCol);
      editor.setValue('Bob');
      const change = editor.stopEditing();
      expect(change).not.toBeNull();
      expect(change!.field).toBe('name');
      expect(change!.oldValue).toBe('Alice');
      expect(change!.newValue).toBe('Bob');
      expect(editor.isEditing).toBe(false);
    });

    it('returns null when value is unchanged', () => {
      const editor = new CellEditor();
      editor.startEditing(row, 0, textCol);
      const change = editor.stopEditing();
      expect(change).toBeNull();
    });

    it('returns null when cancelled', () => {
      const editor = new CellEditor();
      editor.startEditing(row, 0, textCol);
      editor.setValue('Bob');
      const change = editor.stopEditing(true);
      expect(change).toBeNull();
    });

    it('parses number values', () => {
      const editor = new CellEditor();
      editor.startEditing(row, 0, numCol);
      editor.setValue('42');
      const change = editor.stopEditing();
      expect(change!.newValue).toBe(42);
    });

    it('parses boolean values', () => {
      const editor = new CellEditor();
      editor.startEditing(row, 0, boolCol);
      editor.setValue(false);
      const change = editor.stopEditing();
      expect(change!.newValue).toBe(false);
    });
  });

  describe('cancelEditing', () => {
    it('clears editing state', () => {
      const editor = new CellEditor();
      editor.startEditing(row, 0, textCol);
      editor.cancelEditing();
      expect(editor.isEditing).toBe(false);
    });
  });

  describe('validate', () => {
    it('passes when no validator', () => {
      const editor = new CellEditor();
      editor.startEditing(row, 0, textCol);
      const result = editor.validate(row, textCol);
      expect(result.isValid).toBe(true);
    });

    it('uses column validator', () => {
      const col: ColumnDef = {
        ...textCol,
        validator: (params) => (params.value as string).length >= 2 || 'Name too short',
      };
      const editor = new CellEditor();
      editor.startEditing(row, 0, col);
      editor.setValue('A');
      const result = editor.validate(row, col);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Name too short');
    });

    it('marks editing state as invalid', () => {
      const col: ColumnDef = {
        ...textCol,
        validator: () => false,
      };
      const editor = new CellEditor();
      editor.startEditing(row, 0, col);
      editor.validate(row, col);
      expect(editor.editingState!.isValid).toBe(false);
    });

    it('stopEditing returns null when invalid', () => {
      const col: ColumnDef = {
        ...textCol,
        validator: () => 'Error',
      };
      const editor = new CellEditor();
      editor.startEditing(row, 0, col);
      editor.setValue('x');
      editor.validate(row, col);
      const change = editor.stopEditing();
      expect(change).toBeNull();
    });
  });

  describe('renderEditor', () => {
    it('renders text input', () => {
      const editor = new CellEditor();
      editor.startEditing(row, 0, textCol);
      const html = editor.renderEditor(textCol);
      expect(html).toContain('type="text"');
      expect(html).toContain('data-editor');
    });

    it('renders number input', () => {
      const editor = new CellEditor();
      editor.startEditing(row, 0, numCol);
      const html = editor.renderEditor(numCol);
      expect(html).toContain('type="number"');
    });

    it('renders select with options', () => {
      const editor = new CellEditor();
      editor.startEditing(row, 0, selectCol);
      const html = editor.renderEditor(selectCol);
      expect(html).toContain('<select');
      expect(html).toContain('active');
      expect(html).toContain('inactive');
      expect(html).toContain('pending');
    });

    it('renders checkbox', () => {
      const editor = new CellEditor();
      editor.startEditing(row, 0, boolCol);
      const html = editor.renderEditor(boolCol);
      expect(html).toContain('type="checkbox"');
      expect(html).toContain('checked');
    });

    it('renders date input', () => {
      const editor = new CellEditor();
      editor.startEditing(row, 0, dateCol);
      const html = editor.renderEditor(dateCol);
      expect(html).toContain('type="date"');
    });

    it('returns empty string when not editing', () => {
      const editor = new CellEditor();
      expect(editor.renderEditor(textCol)).toBe('');
    });
  });

  describe('findNextEditableCell', () => {
    const columns: ColumnDef[] = [
      { field: 'id', header: 'ID', type: 'number', editable: false },
      { field: 'name', header: 'Name', type: 'text', editable: true },
      { field: 'age', header: 'Age', type: 'number', editable: true },
      { field: 'status', header: 'Status', type: 'text', editable: false },
    ];
    const rows: Row[] = [
      { id: 1, name: 'Alice', age: 25, status: 'active' },
      { id: 2, name: 'Bob', age: 30, status: 'inactive' },
    ];

    it('finds next editable cell forward', () => {
      const editor = new CellEditor();
      const next = editor.findNextEditableCell(0, 1, columns, rows, 'forward');
      expect(next).toEqual({ rowIndex: 0, colIndex: 2 });
    });

    it('wraps to next row', () => {
      const editor = new CellEditor();
      const next = editor.findNextEditableCell(0, 2, columns, rows, 'forward');
      expect(next).toEqual({ rowIndex: 1, colIndex: 1 });
    });

    it('finds previous editable cell backward', () => {
      const editor = new CellEditor();
      const prev = editor.findNextEditableCell(0, 2, columns, rows, 'backward');
      expect(prev).toEqual({ rowIndex: 0, colIndex: 1 });
    });

    it('returns null when no editable cell found', () => {
      const allReadonly: ColumnDef[] = [
        { field: 'a', header: 'A', type: 'text', editable: false },
      ];
      const editor = new CellEditor();
      const next = editor.findNextEditableCell(0, 0, allReadonly, rows, 'forward');
      expect(next).toBeNull();
    });
  });

  describe('editable function', () => {
    it('supports function-based editable', () => {
      const col: ColumnDef = {
        field: 'name',
        header: 'Name',
        type: 'text',
        editable: (params) => params.rowIndex === 0,
      };
      const editor = new CellEditor();

      const state0 = editor.startEditing(row, 0, col);
      expect(state0).not.toBeNull();
      editor.cancelEditing();

      const state1 = editor.startEditing(row, 1, col);
      expect(state1).toBeNull();
    });
  });

  describe('options', () => {
    it('defaults singleClickEdit to false', () => {
      const editor = new CellEditor();
      expect(editor.options.singleClickEdit).toBe(false);
    });

    it('accepts custom options', () => {
      const editor = new CellEditor({ singleClickEdit: true });
      expect(editor.options.singleClickEdit).toBe(true);
    });

    it('allows updating options', () => {
      const editor = new CellEditor();
      editor.options = { singleClickEdit: true };
      expect(editor.options.singleClickEdit).toBe(true);
    });
  });
});
