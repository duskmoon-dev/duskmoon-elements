import { describe, it, expect } from 'bun:test';
import { SelectionManager } from '../../src/core/selection-manager.js';
import type { Row } from '../../src/types.js';

describe('SelectionManager', () => {
  const rows: Row[] = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
    { id: 4, name: 'Diana' },
    { id: 5, name: 'Eve' },
  ];

  const create = (mode: 'none' | 'single' | 'multiple' = 'multiple') => {
    const mgr = new SelectionManager('id');
    mgr.mode = mode;
    return mgr;
  };

  it('starts with no selection', () => {
    const mgr = create();
    expect(mgr.selectedCount).toBe(0);
  });

  it('none mode ignores clicks', () => {
    const mgr = create('none');
    const result = mgr.handleClick(rows[0], 0, rows, false, false);
    expect(result.added.length).toBe(0);
    expect(mgr.selectedCount).toBe(0);
  });

  describe('single mode', () => {
    it('selects one row on click', () => {
      const mgr = create('single');
      const result = mgr.handleClick(rows[0], 0, rows, false, false);
      expect(result.added.length).toBe(1);
      expect(result.added[0].name).toBe('Alice');
      expect(mgr.selectedCount).toBe(1);
    });

    it('replaces selection on second click', () => {
      const mgr = create('single');
      mgr.handleClick(rows[0], 0, rows, false, false);
      const result = mgr.handleClick(rows[1], 1, rows, false, false);
      expect(mgr.selectedCount).toBe(1);
      expect(mgr.isSelected(rows[1])).toBe(true);
      expect(mgr.isSelected(rows[0])).toBe(false);
    });

    it('deselects on clicking same row', () => {
      const mgr = create('single');
      mgr.handleClick(rows[0], 0, rows, false, false);
      const result = mgr.handleClick(rows[0], 0, rows, false, false);
      expect(mgr.selectedCount).toBe(0);
    });
  });

  describe('multiple mode', () => {
    it('regular click selects only one row', () => {
      const mgr = create('multiple');
      mgr.handleClick(rows[0], 0, rows, false, false);
      mgr.handleClick(rows[1], 1, rows, false, false);
      expect(mgr.selectedCount).toBe(1);
      expect(mgr.isSelected(rows[1])).toBe(true);
    });

    it('ctrl+click toggles selection', () => {
      const mgr = create('multiple');
      mgr.handleClick(rows[0], 0, rows, false, true);
      mgr.handleClick(rows[2], 2, rows, false, true);
      expect(mgr.selectedCount).toBe(2);
      expect(mgr.isSelected(rows[0])).toBe(true);
      expect(mgr.isSelected(rows[2])).toBe(true);

      // Ctrl+click again to deselect
      mgr.handleClick(rows[0], 0, rows, false, true);
      expect(mgr.selectedCount).toBe(1);
      expect(mgr.isSelected(rows[0])).toBe(false);
    });

    it('shift+click selects range', () => {
      const mgr = create('multiple');
      mgr.handleClick(rows[1], 1, rows, false, false);
      mgr.handleClick(rows[3], 3, rows, true, false);
      expect(mgr.selectedCount).toBe(3); // rows 1, 2, 3
      expect(mgr.isSelected(rows[1])).toBe(true);
      expect(mgr.isSelected(rows[2])).toBe(true);
      expect(mgr.isSelected(rows[3])).toBe(true);
    });
  });

  describe('selectAll / deselectAll', () => {
    it('selectAll selects all rows', () => {
      const mgr = create('multiple');
      const { added } = mgr.selectAll(rows);
      expect(added.length).toBe(5);
      expect(mgr.selectedCount).toBe(5);
      expect(mgr.isAllSelected(rows)).toBe(true);
    });

    it('deselectAll clears all', () => {
      const mgr = create('multiple');
      mgr.selectAll(rows);
      const { removed } = mgr.deselectAll(rows);
      expect(removed.length).toBe(5);
      expect(mgr.selectedCount).toBe(0);
    });

    it('selectAll does not double-add already selected', () => {
      const mgr = create('multiple');
      mgr.handleClick(rows[0], 0, rows, false, false);
      const { added } = mgr.selectAll(rows);
      expect(added.length).toBe(4); // only 4 new
      expect(mgr.selectedCount).toBe(5);
    });
  });

  describe('toggle', () => {
    it('toggles individual row', () => {
      const mgr = create('multiple');
      mgr.toggle(rows[0]);
      expect(mgr.isSelected(rows[0])).toBe(true);
      mgr.toggle(rows[0]);
      expect(mgr.isSelected(rows[0])).toBe(false);
    });
  });

  describe('isIndeterminate', () => {
    it('returns false when none selected', () => {
      const mgr = create('multiple');
      expect(mgr.isIndeterminate(rows)).toBe(false);
    });

    it('returns true when some selected', () => {
      const mgr = create('multiple');
      mgr.toggle(rows[0]);
      mgr.toggle(rows[1]);
      expect(mgr.isIndeterminate(rows)).toBe(true);
    });

    it('returns false when all selected', () => {
      const mgr = create('multiple');
      mgr.selectAll(rows);
      expect(mgr.isIndeterminate(rows)).toBe(false);
    });
  });

  it('getSelectedRows returns correct rows', () => {
    const mgr = create('multiple');
    mgr.toggle(rows[1]);
    mgr.toggle(rows[3]);
    const selected = mgr.getSelectedRows(rows);
    expect(selected.length).toBe(2);
    expect(selected.map((r) => r.name)).toEqual(['Bob', 'Diana']);
  });

  it('setting mode to none clears selection', () => {
    const mgr = create('multiple');
    mgr.selectAll(rows);
    mgr.mode = 'none';
    expect(mgr.selectedCount).toBe(0);
  });
});
