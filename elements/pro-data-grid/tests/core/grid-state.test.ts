import { describe, it, expect } from 'bun:test';
import { GridStateManager } from '../../src/core/grid-state.js';
import type { GridState } from '../../src/core/grid-state.js';

describe('GridStateManager', () => {
  it('starts with empty state', () => {
    const gsm = new GridStateManager();
    const state = gsm.getState();
    expect(Object.keys(state).length).toBe(0);
  });

  describe('captureState', () => {
    it('captures sort model', () => {
      const gsm = new GridStateManager();
      const state = gsm.captureState({
        sortModel: [{ field: 'name', direction: 'asc' }],
      });

      expect(state.sortModel).toEqual([{ field: 'name', direction: 'asc' }]);
    });

    it('captures filter model', () => {
      const gsm = new GridStateManager();
      const state = gsm.captureState({
        filterModel: { name: { type: 'text', operator: 'contains', value: 'a' } },
      });

      expect(state.filterModel).toHaveProperty('name');
    });

    it('captures column state with widths and visibility', () => {
      const gsm = new GridStateManager();
      const widths = new Map([
        ['name', 150],
        ['age', 80],
      ]);
      const visibility = new Map([
        ['name', true],
        ['age', false],
      ]);

      const state = gsm.captureState({
        columns: [
          { field: 'name', header: 'Name' },
          { field: 'age', header: 'Age' },
        ],
        columnWidths: widths,
        columnVisibility: visibility,
      });

      expect(state.columnState).toHaveLength(2);
      expect(state.columnState![0].width).toBe(150);
      expect(state.columnState![1].visible).toBe(false);
    });

    it('captures pagination state', () => {
      const gsm = new GridStateManager();
      const state = gsm.captureState({
        currentPage: 3,
        pageSize: 25,
      });

      expect(state.currentPage).toBe(3);
      expect(state.pageSize).toBe(25);
    });

    it('captures selection and grouping', () => {
      const gsm = new GridStateManager();
      const state = gsm.captureState({
        selectedRowKeys: ['1', '3'],
        groupColumns: ['status'],
        expandedGroups: ['active'],
      });

      expect(state.selectedRowKeys).toEqual(['1', '3']);
      expect(state.groupColumns).toEqual(['status']);
      expect(state.expandedGroups).toEqual(['active']);
    });

    it('captures scroll position', () => {
      const gsm = new GridStateManager();
      const state = gsm.captureState({
        scrollTop: 500,
        scrollLeft: 100,
      });

      expect(state.scrollTop).toBe(500);
      expect(state.scrollLeft).toBe(100);
    });
  });

  describe('getState / setState', () => {
    it('gets a copy of state', () => {
      const gsm = new GridStateManager();
      gsm.captureState({ currentPage: 2 });
      const state = gsm.getState();
      state.currentPage = 99;
      expect(gsm.getState().currentPage).toBe(2); // not affected
    });

    it('sets state from object', () => {
      const gsm = new GridStateManager();
      gsm.setState({
        sortModel: [{ field: 'name', direction: 'desc' }],
        currentPage: 5,
      });

      const state = gsm.getState();
      expect(state.sortModel).toEqual([{ field: 'name', direction: 'desc' }]);
      expect(state.currentPage).toBe(5);
    });
  });

  describe('getStateValue / setStateValue', () => {
    it('gets individual state values', () => {
      const gsm = new GridStateManager();
      gsm.captureState({ currentPage: 3 });
      expect(gsm.getStateValue('currentPage')).toBe(3);
    });

    it('sets individual state values', () => {
      const gsm = new GridStateManager();
      gsm.setStateValue('currentPage', 7);
      expect(gsm.getStateValue('currentPage')).toBe(7);
    });
  });

  describe('resetState', () => {
    it('resets all state', () => {
      const gsm = new GridStateManager();
      gsm.captureState({ currentPage: 3, pageSize: 25 });
      gsm.resetState();
      const state = gsm.getState();
      expect(state.currentPage).toBeUndefined();
      expect(state.pageSize).toBeUndefined();
    });

    it('resets specific keys', () => {
      const gsm = new GridStateManager();
      gsm.captureState({ currentPage: 3, pageSize: 25 });
      gsm.resetState(['currentPage']);
      const state = gsm.getState();
      expect(state.currentPage).toBeUndefined();
      expect(state.pageSize).toBe(25);
    });
  });

  describe('diffState', () => {
    it('detects changed keys', () => {
      const gsm = new GridStateManager();
      gsm.captureState({ currentPage: 1, pageSize: 10 });

      const other: GridState = { currentPage: 2, pageSize: 10 };
      const diff = gsm.diffState(other);

      expect(diff).toContain('currentPage');
      expect(diff).not.toContain('pageSize');
    });

    it('detects new keys in other', () => {
      const gsm = new GridStateManager();
      gsm.captureState({ currentPage: 1 });

      const other: GridState = { currentPage: 1, quickFilterText: 'hello' };
      const diff = gsm.diffState(other);

      expect(diff).toContain('quickFilterText');
    });
  });

  describe('serialization', () => {
    it('toJSON produces valid JSON', () => {
      const gsm = new GridStateManager();
      gsm.captureState({ currentPage: 2, pageSize: 50 });
      const json = gsm.toJSON();
      const parsed = JSON.parse(json);
      expect(parsed.currentPage).toBe(2);
      expect(parsed.pageSize).toBe(50);
    });

    it('fromJSON restores state', () => {
      const gsm = new GridStateManager();
      const json = JSON.stringify({ currentPage: 5, pageSize: 100 });
      const state = gsm.fromJSON(json);
      expect(state).not.toBeNull();
      expect(state!.currentPage).toBe(5);
      expect(gsm.getState().currentPage).toBe(5);
    });

    it('fromJSON returns null for invalid JSON', () => {
      const gsm = new GridStateManager();
      const result = gsm.fromJSON('not json');
      expect(result).toBeNull();
    });
  });

  describe('storageKey', () => {
    it('defaults to null', () => {
      const gsm = new GridStateManager();
      expect(gsm.storageKey).toBeNull();
    });

    it('can be set', () => {
      const gsm = new GridStateManager();
      gsm.setStorageKey('my-grid');
      expect(gsm.storageKey).toBe('my-grid');
    });
  });
});
