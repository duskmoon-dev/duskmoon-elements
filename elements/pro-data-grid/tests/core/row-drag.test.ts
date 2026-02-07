import { describe, it, expect } from 'bun:test';
import { RowDrag } from '../../src/core/row-drag.js';
import type { Row } from '../../src/types.js';

const rows: Row[] = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' },
  { id: '4', name: 'Diana' },
  { id: '5', name: 'Eve' },
];

describe('RowDrag', () => {
  it('starts disabled', () => {
    const rd = new RowDrag();
    expect(rd.enabled).toBe(false);
    expect(rd.isDragging).toBe(false);
  });

  it('does nothing when disabled', () => {
    const rd = new RowDrag();
    rd.startDrag([rows[0]], 0);
    expect(rd.isDragging).toBe(false);
  });

  describe('single row drag (managed)', () => {
    it('starts and ends drag', () => {
      const rd = new RowDrag();
      rd.enabled = true;

      rd.startDrag([rows[2]], 2);
      expect(rd.isDragging).toBe(true);
      expect(rd.dragState.sourceIndex).toBe(2);
      expect(rd.dragState.draggedRows.length).toBe(1);

      rd.updateTarget(0);
      const result = rd.endDrag(rows);

      expect(result).not.toBeNull();
      expect(result!.rows[0].name).toBe('Charlie');
      expect(result!.rows[1].name).toBe('Alice');
      expect(rd.isDragging).toBe(false);
    });

    it('moves row down', () => {
      const rd = new RowDrag();
      rd.enabled = true;

      rd.startDrag([rows[0]], 0);
      rd.updateTarget(3);
      const result = rd.endDrag(rows);

      expect(result).not.toBeNull();
      // Alice moved from 0 to 3 (adjusted to 2 after removal)
      expect(result!.rows[0].name).toBe('Bob');
      expect(result!.rows[1].name).toBe('Charlie');
      expect(result!.rows[2].name).toBe('Alice');
    });

    it('no-op when drag not started', () => {
      const rd = new RowDrag();
      const result = rd.endDrag(rows);
      expect(result).toBeNull();
    });
  });

  describe('multi-row drag', () => {
    it('drags multiple rows', () => {
      const rd = new RowDrag();
      rd.configure({ enabled: true, multiRow: true });

      rd.startDrag([rows[0], rows[1]], 0);
      rd.updateTarget(4);
      const result = rd.endDrag(rows);

      expect(result).not.toBeNull();
      expect(result!.rows.length).toBe(5);
      // Alice and Bob moved after Diana
      expect(result!.rows[0].name).toBe('Charlie');
      expect(result!.rows[1].name).toBe('Diana');
      expect(result!.rows[2].name).toBe('Alice');
      expect(result!.rows[3].name).toBe('Bob');
    });

    it('single-row mode ignores extra rows', () => {
      const rd = new RowDrag();
      rd.configure({ enabled: true, multiRow: false });

      rd.startDrag([rows[0], rows[1]], 0);
      expect(rd.dragState.draggedRows.length).toBe(1);
    });
  });

  describe('unmanaged mode', () => {
    it('returns dragged rows without reordering', () => {
      const rd = new RowDrag();
      rd.configure({ enabled: true, managed: false });

      rd.startDrag([rows[0]], 0);
      rd.updateTarget(3);
      const result = rd.endDrag(rows);

      expect(result).not.toBeNull();
      expect(result!.rows.length).toBe(1); // just the dragged rows
      expect(result!.toIndex).toBe(3);
    });
  });

  describe('cancelDrag', () => {
    it('cancels the drag', () => {
      const rd = new RowDrag();
      rd.enabled = true;

      rd.startDrag([rows[0]], 0);
      rd.cancelDrag();
      expect(rd.isDragging).toBe(false);
    });
  });

  describe('getDragText', () => {
    it('returns default text for single row', () => {
      const rd = new RowDrag();
      rd.enabled = true;

      rd.startDrag([rows[0]], 0);
      expect(rd.getDragText()).toBe('1 row');
    });

    it('returns count for multiple rows', () => {
      const rd = new RowDrag();
      rd.configure({ enabled: true, multiRow: true });

      rd.startDrag([rows[0], rows[1]], 0);
      expect(rd.getDragText()).toBe('2 rows');
    });

    it('uses custom rowDragText', () => {
      const rd = new RowDrag();
      rd.configure({
        enabled: true,
        rowDragText: (row) => `Dragging ${row.name}`,
      });

      rd.startDrag([rows[0]], 0);
      expect(rd.getDragText()).toBe('Dragging Alice');
    });

    it('returns empty when not dragging', () => {
      const rd = new RowDrag();
      expect(rd.getDragText()).toBe('');
    });
  });

  describe('showDragHandle', () => {
    it('shows when enabled and dragHandleColumn', () => {
      const rd = new RowDrag();
      rd.configure({ enabled: true, dragHandleColumn: true });
      expect(rd.showDragHandle).toBe(true);
    });

    it('hides when not enabled', () => {
      const rd = new RowDrag();
      expect(rd.showDragHandle).toBe(false);
    });
  });
});
