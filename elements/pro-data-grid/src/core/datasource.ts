/**
 * Datasource interface and server-side row model for the data grid.
 *
 * Provides a request/response pattern where the grid sends parameters
 * (sort, filter, group keys, pagination) and the consumer returns data.
 */

import type { Row, SortItem, FilterModel } from '../types.js';

// ─── Interfaces ──────────────────────────────

export interface IDatasourceGetRowsParams {
  startRow: number;
  endRow: number;
  sortModel: SortItem[];
  filterModel: Record<string, FilterModel>;
  groupKeys: string[];
  pivotCols: string[];
  pivotMode: boolean;
  success(params: { rowData: Row[]; rowCount: number }): void;
  fail(error?: unknown): void;
}

export interface IDatasource {
  getRows(params: IDatasourceGetRowsParams): void;
  destroy?(): void;
}

export type ServerRowModelState = 'idle' | 'loading' | 'loaded' | 'failed';

export interface BlockState {
  startRow: number;
  endRow: number;
  state: ServerRowModelState;
  rows: Row[];
  error?: unknown;
}

// ─── Server-Side Row Model ───────────────────

export class ServerRowModel {
  #datasource: IDatasource | null = null;
  #blocks = new Map<number, BlockState>();
  #blockSize: number;
  #totalRowCount = -1; // unknown until first response
  #sortModel: SortItem[] = [];
  #filterModel: Record<string, FilterModel> = {};
  #groupKeys: string[] = [];
  #pivotCols: string[] = [];
  #pivotMode = false;
  #maxConcurrentRequests: number;
  #activeRequests = 0;
  #pendingBlocks: number[] = [];

  constructor(options: { blockSize?: number; maxConcurrentRequests?: number } = {}) {
    this.#blockSize = options.blockSize ?? 100;
    this.#maxConcurrentRequests = options.maxConcurrentRequests ?? 2;
  }

  // ─── Configuration ─────────────────────────

  get datasource(): IDatasource | null {
    return this.#datasource;
  }

  set datasource(ds: IDatasource | null) {
    if (this.#datasource?.destroy) {
      this.#datasource.destroy();
    }
    this.#datasource = ds;
    this.purgeCache();
  }

  get blockSize(): number {
    return this.#blockSize;
  }

  set blockSize(size: number) {
    this.#blockSize = Math.max(1, size);
  }

  get totalRowCount(): number {
    return this.#totalRowCount;
  }

  get isLoading(): boolean {
    return this.#activeRequests > 0;
  }

  get loadedBlockCount(): number {
    let count = 0;
    for (const block of this.#blocks.values()) {
      if (block.state === 'loaded') count++;
    }
    return count;
  }

  // ─── Request Parameters ────────────────────

  setRequestParams(params: {
    sortModel?: SortItem[];
    filterModel?: Record<string, FilterModel>;
    groupKeys?: string[];
    pivotCols?: string[];
    pivotMode?: boolean;
  }): void {
    let changed = false;

    if (params.sortModel !== undefined) {
      this.#sortModel = params.sortModel;
      changed = true;
    }
    if (params.filterModel !== undefined) {
      this.#filterModel = params.filterModel;
      changed = true;
    }
    if (params.groupKeys !== undefined) {
      this.#groupKeys = params.groupKeys;
      changed = true;
    }
    if (params.pivotCols !== undefined) {
      this.#pivotCols = params.pivotCols;
      changed = true;
    }
    if (params.pivotMode !== undefined) {
      this.#pivotMode = params.pivotMode;
      changed = true;
    }

    if (changed) {
      this.purgeCache();
    }
  }

  // ─── Block Loading ─────────────────────────

  getBlockForRow(rowIndex: number): number {
    return Math.floor(rowIndex / this.#blockSize);
  }

  getRow(rowIndex: number): Row | undefined {
    const blockIndex = this.getBlockForRow(rowIndex);
    const block = this.#blocks.get(blockIndex);
    if (!block || block.state !== 'loaded') return undefined;
    const offset = rowIndex - block.startRow;
    return block.rows[offset];
  }

  getBlockState(blockIndex: number): BlockState | undefined {
    return this.#blocks.get(blockIndex);
  }

  isBlockLoaded(blockIndex: number): boolean {
    return this.#blocks.get(blockIndex)?.state === 'loaded';
  }

  isBlockLoading(blockIndex: number): boolean {
    return this.#blocks.get(blockIndex)?.state === 'loading';
  }

  requestBlock(
    blockIndex: number,
    callbacks?: {
      onSuccess?: (block: BlockState) => void;
      onFail?: (block: BlockState) => void;
    },
  ): void {
    if (!this.#datasource) return;

    const existing = this.#blocks.get(blockIndex);
    if (existing && (existing.state === 'loading' || existing.state === 'loaded')) {
      return; // Already loading or loaded
    }

    const startRow = blockIndex * this.#blockSize;
    const endRow = startRow + this.#blockSize;

    const block: BlockState = {
      startRow,
      endRow,
      state: 'loading',
      rows: [],
    };
    this.#blocks.set(blockIndex, block);

    if (this.#activeRequests >= this.#maxConcurrentRequests) {
      // Queue for later
      block.state = 'idle';
      this.#pendingBlocks.push(blockIndex);
      return;
    }

    this.#fetchBlock(blockIndex, block, callbacks);
  }

  #fetchBlock(
    blockIndex: number,
    block: BlockState,
    callbacks?: {
      onSuccess?: (block: BlockState) => void;
      onFail?: (block: BlockState) => void;
    },
  ): void {
    if (!this.#datasource) return;

    block.state = 'loading';
    this.#activeRequests++;

    this.#datasource.getRows({
      startRow: block.startRow,
      endRow: block.endRow,
      sortModel: this.#sortModel,
      filterModel: this.#filterModel,
      groupKeys: this.#groupKeys,
      pivotCols: this.#pivotCols,
      pivotMode: this.#pivotMode,

      success: (params) => {
        block.rows = params.rowData;
        block.state = 'loaded';
        this.#totalRowCount = params.rowCount;
        this.#activeRequests--;
        callbacks?.onSuccess?.(block);
        this.#drainPending(callbacks);
      },

      fail: (error) => {
        block.state = 'failed';
        block.error = error;
        this.#activeRequests--;
        callbacks?.onFail?.(block);
        this.#drainPending(callbacks);
      },
    });
  }

  #drainPending(callbacks?: {
    onSuccess?: (block: BlockState) => void;
    onFail?: (block: BlockState) => void;
  }): void {
    while (this.#pendingBlocks.length > 0 && this.#activeRequests < this.#maxConcurrentRequests) {
      const nextBlockIndex = this.#pendingBlocks.shift()!;
      const block = this.#blocks.get(nextBlockIndex);
      if (block && block.state === 'idle') {
        this.#fetchBlock(nextBlockIndex, block, callbacks);
      }
    }
  }

  // ─── Visible Range Loading ─────────────────

  ensureBlocksForRange(
    startRow: number,
    endRow: number,
    callbacks?: {
      onSuccess?: (block: BlockState) => void;
      onFail?: (block: BlockState) => void;
    },
  ): void {
    const firstBlock = this.getBlockForRow(startRow);
    const lastBlock = this.getBlockForRow(Math.max(0, endRow - 1));

    for (let b = firstBlock; b <= lastBlock; b++) {
      this.requestBlock(b, callbacks);
    }
  }

  // ─── Retry ─────────────────────────────────

  retryBlock(
    blockIndex: number,
    callbacks?: {
      onSuccess?: (block: BlockState) => void;
      onFail?: (block: BlockState) => void;
    },
  ): boolean {
    const block = this.#blocks.get(blockIndex);
    if (!block || block.state !== 'failed') return false;

    block.state = 'idle';
    block.error = undefined;
    block.rows = [];

    this.requestBlock(blockIndex, callbacks);
    return true;
  }

  // ─── Cache Management ──────────────────────

  purgeCache(): void {
    this.#blocks.clear();
    this.#pendingBlocks = [];
    this.#totalRowCount = -1;
  }

  purgeBlock(blockIndex: number): boolean {
    return this.#blocks.delete(blockIndex);
  }

  get cacheBlockCount(): number {
    return this.#blocks.size;
  }

  // ─── Cleanup ───────────────────────────────

  destroy(): void {
    if (this.#datasource?.destroy) {
      this.#datasource.destroy();
    }
    this.#datasource = null;
    this.purgeCache();
  }
}
