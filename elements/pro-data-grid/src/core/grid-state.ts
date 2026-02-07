/**
 * State persistence for the data grid.
 *
 * Captures and restores grid state: sort model, filter model, column state,
 * selection, pagination, grouping, expanded rows, and scroll position.
 */

import type { SortItem, FilterModel, ColumnDef } from '../types.js';

// ─── Types ──────────────────────────────────

export interface ColumnState {
  field: string;
  width?: number;
  visible?: boolean;
  pinned?: 'left' | 'right' | false;
  sort?: 'asc' | 'desc' | null;
  sortIndex?: number;
  flex?: number;
}

export interface GridState {
  sortModel?: SortItem[];
  filterModel?: Record<string, FilterModel>;
  columnState?: ColumnState[];
  selectedRowKeys?: string[];
  currentPage?: number;
  pageSize?: number;
  groupColumns?: string[];
  expandedGroups?: string[];
  expandedRows?: string[];
  scrollTop?: number;
  scrollLeft?: number;
  quickFilterText?: string;
}

export type GridStateKey = keyof GridState;

// ─── GridStateManager ───────────────────────

export class GridStateManager {
  #state: GridState = {};
  #storageKey: string | null = null;
  #autoSaveKeys: Set<GridStateKey> = new Set();

  // ─── Capture ───────────────────────────────

  captureState(params: {
    sortModel?: SortItem[];
    filterModel?: Record<string, FilterModel>;
    columns?: ColumnDef[];
    columnWidths?: Map<string, number>;
    columnVisibility?: Map<string, boolean>;
    selectedRowKeys?: string[];
    currentPage?: number;
    pageSize?: number;
    groupColumns?: string[];
    expandedGroups?: string[];
    expandedRows?: string[];
    scrollTop?: number;
    scrollLeft?: number;
    quickFilterText?: string;
  }): GridState {
    const state: GridState = {};

    if (params.sortModel) {
      state.sortModel = [...params.sortModel];
    }

    if (params.filterModel) {
      state.filterModel = { ...params.filterModel };
    }

    if (params.columns) {
      state.columnState = params.columns.map((col) => ({
        field: col.field,
        width: params.columnWidths?.get(col.field),
        visible: params.columnVisibility?.get(col.field) ?? true,
        sort: null,
        pinned: false,
      }));

      // Apply sort info to column state
      if (params.sortModel) {
        for (const sort of params.sortModel) {
          const colState = state.columnState.find((c) => c.field === sort.field);
          if (colState) {
            colState.sort = sort.direction;
            colState.sortIndex = params.sortModel.indexOf(sort);
          }
        }
      }
    }

    if (params.selectedRowKeys) {
      state.selectedRowKeys = [...params.selectedRowKeys];
    }

    if (params.currentPage !== undefined) state.currentPage = params.currentPage;
    if (params.pageSize !== undefined) state.pageSize = params.pageSize;

    if (params.groupColumns) {
      state.groupColumns = [...params.groupColumns];
    }

    if (params.expandedGroups) {
      state.expandedGroups = [...params.expandedGroups];
    }

    if (params.expandedRows) {
      state.expandedRows = [...params.expandedRows];
    }

    if (params.scrollTop !== undefined) state.scrollTop = params.scrollTop;
    if (params.scrollLeft !== undefined) state.scrollLeft = params.scrollLeft;
    if (params.quickFilterText !== undefined) state.quickFilterText = params.quickFilterText;

    this.#state = state;
    return { ...state };
  }

  // ─── Get / Set ─────────────────────────────

  getState(): GridState {
    return { ...this.#state };
  }

  setState(state: GridState): void {
    this.#state = { ...state };
  }

  getStateValue<K extends GridStateKey>(key: K): GridState[K] {
    return this.#state[key];
  }

  setStateValue<K extends GridStateKey>(key: K, value: GridState[K]): void {
    this.#state[key] = value;
    if (this.#autoSaveKeys.has(key) && this.#storageKey) {
      this.saveToStorage();
    }
  }

  // ─── Reset ─────────────────────────────────

  resetState(keys?: GridStateKey[]): GridState {
    if (keys) {
      for (const key of keys) {
        delete this.#state[key];
      }
    } else {
      this.#state = {};
    }
    return { ...this.#state };
  }

  // ─── Diff ──────────────────────────────────

  diffState(otherState: GridState): GridStateKey[] {
    const changedKeys: GridStateKey[] = [];
    const allKeys = new Set([
      ...Object.keys(this.#state),
      ...Object.keys(otherState),
    ]) as Set<GridStateKey>;

    for (const key of allKeys) {
      const current = JSON.stringify(this.#state[key]);
      const other = JSON.stringify(otherState[key]);
      if (current !== other) {
        changedKeys.push(key);
      }
    }

    return changedKeys;
  }

  // ─── Storage Persistence ───────────────────

  setStorageKey(key: string | null): void {
    this.#storageKey = key;
  }

  get storageKey(): string | null {
    return this.#storageKey;
  }

  setAutoSaveKeys(keys: GridStateKey[]): void {
    this.#autoSaveKeys = new Set(keys);
  }

  saveToStorage(): boolean {
    if (!this.#storageKey) return false;
    try {
      const json = JSON.stringify(this.#state);
      localStorage.setItem(this.#storageKey, json);
      return true;
    } catch {
      return false;
    }
  }

  loadFromStorage(): GridState | null {
    if (!this.#storageKey) return null;
    try {
      const json = localStorage.getItem(this.#storageKey);
      if (!json) return null;
      const state = JSON.parse(json) as GridState;
      this.#state = state;
      return { ...state };
    } catch {
      return null;
    }
  }

  clearStorage(): void {
    if (this.#storageKey) {
      try {
        localStorage.removeItem(this.#storageKey);
      } catch {
        // ignore
      }
    }
  }

  // ─── Serialization ─────────────────────────

  toJSON(): string {
    return JSON.stringify(this.#state);
  }

  fromJSON(json: string): GridState | null {
    try {
      const state = JSON.parse(json) as GridState;
      this.#state = state;
      return { ...state };
    } catch {
      return null;
    }
  }
}
