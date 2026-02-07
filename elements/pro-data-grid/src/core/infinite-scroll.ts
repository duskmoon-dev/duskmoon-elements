/**
 * Infinite scroll model for the data grid.
 *
 * Loads rows in blocks as the user scrolls, integrating with a datasource
 * for on-demand data fetching. Provides loading indicators per block.
 */

import type { Row, SortItem, FilterModel } from '../types.js';
import type { IDatasource, BlockState } from './datasource.js';

// ─── Types ──────────────────────────────────

export interface InfiniteScrollConfig {
  blockSize?: number;
  maxBlocksInCache?: number;
  overscanBlocks?: number;
  cacheOverflowSize?: number;
}

export interface InfiniteBlockInfo {
  blockIndex: number;
  startRow: number;
  endRow: number;
  state: 'idle' | 'loading' | 'loaded' | 'failed';
  hasData: boolean;
}

// ─── InfiniteScroll Model ───────────────────

export class InfiniteScroll {
  #datasource: IDatasource | null = null;
  #blocks = new Map<number, BlockState>();
  #blockSize: number;
  #maxBlocksInCache: number;
  #overscanBlocks: number;
  #totalRowCount = -1;
  #sortModel: SortItem[] = [];
  #filterModel: Record<string, FilterModel> = {};
  #activeRequests = 0;
  #maxConcurrentRequests = 2;
  #accessOrder: number[] = []; // LRU tracking

  constructor(config: InfiniteScrollConfig = {}) {
    this.#blockSize = config.blockSize ?? 100;
    this.#maxBlocksInCache = config.maxBlocksInCache ?? 10;
    this.#overscanBlocks = config.overscanBlocks ?? 1;
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
    this.reset();
  }

  get blockSize(): number {
    return this.#blockSize;
  }

  get totalRowCount(): number {
    return this.#totalRowCount;
  }

  get isLoading(): boolean {
    return this.#activeRequests > 0;
  }

  // ─── Parameters ────────────────────────────

  setParams(params: { sortModel?: SortItem[]; filterModel?: Record<string, FilterModel> }): void {
    let changed = false;

    if (params.sortModel !== undefined) {
      this.#sortModel = params.sortModel;
      changed = true;
    }
    if (params.filterModel !== undefined) {
      this.#filterModel = params.filterModel;
      changed = true;
    }

    if (changed) {
      this.reset();
    }
  }

  // ─── Row Access ────────────────────────────

  getRow(rowIndex: number): Row | undefined {
    const blockIndex = Math.floor(rowIndex / this.#blockSize);
    const block = this.#blocks.get(blockIndex);
    if (!block || block.state !== 'loaded') return undefined;

    // Update LRU
    this.#touchBlock(blockIndex);

    const offset = rowIndex - block.startRow;
    return block.rows[offset];
  }

  isRowLoaded(rowIndex: number): boolean {
    const blockIndex = Math.floor(rowIndex / this.#blockSize);
    return this.#blocks.get(blockIndex)?.state === 'loaded';
  }

  isRowLoading(rowIndex: number): boolean {
    const blockIndex = Math.floor(rowIndex / this.#blockSize);
    const state = this.#blocks.get(blockIndex)?.state;
    return state === 'loading' || state === 'idle';
  }

  // ─── Scroll Handling ───────────────────────

  onViewportChanged(
    startRow: number,
    endRow: number,
    callbacks?: {
      onBlockLoaded?: (blockIndex: number) => void;
      onBlockFailed?: (blockIndex: number) => void;
    },
  ): void {
    const firstBlock = Math.floor(startRow / this.#blockSize);
    const lastBlock = Math.floor(Math.max(0, endRow - 1) / this.#blockSize);

    // Include overscan blocks
    const startBlock = Math.max(0, firstBlock - this.#overscanBlocks);
    const endBlock = lastBlock + this.#overscanBlocks;

    for (let b = startBlock; b <= endBlock; b++) {
      this.#ensureBlock(b, callbacks);
    }

    // Evict distant blocks if over cache limit
    this.#evictBlocks();
  }

  // ─── Block Info ────────────────────────────

  getBlockInfo(blockIndex: number): InfiniteBlockInfo {
    const block = this.#blocks.get(blockIndex);
    return {
      blockIndex,
      startRow: blockIndex * this.#blockSize,
      endRow: (blockIndex + 1) * this.#blockSize,
      state: block?.state ?? 'idle',
      hasData: block?.state === 'loaded' && block.rows.length > 0,
    };
  }

  getLoadedBlockIndices(): number[] {
    const result: number[] = [];
    for (const [index, block] of this.#blocks) {
      if (block.state === 'loaded') result.push(index);
    }
    return result.sort((a, b) => a - b);
  }

  // ─── Retry ─────────────────────────────────

  retryBlock(
    blockIndex: number,
    callbacks?: {
      onBlockLoaded?: (blockIndex: number) => void;
      onBlockFailed?: (blockIndex: number) => void;
    },
  ): boolean {
    const block = this.#blocks.get(blockIndex);
    if (!block || block.state !== 'failed') return false;

    this.#blocks.delete(blockIndex);
    this.#ensureBlock(blockIndex, callbacks);
    return true;
  }

  // ─── Reset ─────────────────────────────────

  reset(): void {
    this.#blocks.clear();
    this.#accessOrder = [];
    this.#totalRowCount = -1;
    this.#activeRequests = 0;
  }

  // ─── Cleanup ───────────────────────────────

  destroy(): void {
    if (this.#datasource?.destroy) {
      this.#datasource.destroy();
    }
    this.#datasource = null;
    this.reset();
  }

  // ─── Private ───────────────────────────────

  #ensureBlock(
    blockIndex: number,
    callbacks?: {
      onBlockLoaded?: (blockIndex: number) => void;
      onBlockFailed?: (blockIndex: number) => void;
    },
  ): void {
    const existing = this.#blocks.get(blockIndex);
    if (existing && existing.state !== 'idle') {
      if (existing.state === 'loaded') {
        this.#touchBlock(blockIndex);
      }
      return;
    }

    if (!this.#datasource) return;

    if (this.#activeRequests >= this.#maxConcurrentRequests) {
      // Mark as queued
      if (!existing) {
        this.#blocks.set(blockIndex, {
          startRow: blockIndex * this.#blockSize,
          endRow: (blockIndex + 1) * this.#blockSize,
          state: 'idle',
          rows: [],
        });
      }
      return;
    }

    this.#fetchBlock(blockIndex, callbacks);
  }

  #fetchBlock(
    blockIndex: number,
    callbacks?: {
      onBlockLoaded?: (blockIndex: number) => void;
      onBlockFailed?: (blockIndex: number) => void;
    },
  ): void {
    if (!this.#datasource) return;

    const startRow = blockIndex * this.#blockSize;
    const endRow = startRow + this.#blockSize;

    const block: BlockState = {
      startRow,
      endRow,
      state: 'loading',
      rows: [],
    };
    this.#blocks.set(blockIndex, block);
    this.#activeRequests++;

    this.#datasource.getRows({
      startRow,
      endRow,
      sortModel: this.#sortModel,
      filterModel: this.#filterModel,
      groupKeys: [],
      pivotCols: [],
      pivotMode: false,

      success: (params) => {
        block.rows = params.rowData;
        block.state = 'loaded';
        this.#totalRowCount = params.rowCount;
        this.#activeRequests--;
        this.#touchBlock(blockIndex);
        callbacks?.onBlockLoaded?.(blockIndex);
      },

      fail: (error) => {
        block.state = 'failed';
        block.error = error;
        this.#activeRequests--;
        callbacks?.onBlockFailed?.(blockIndex);
      },
    });
  }

  #touchBlock(blockIndex: number): void {
    const idx = this.#accessOrder.indexOf(blockIndex);
    if (idx !== -1) {
      this.#accessOrder.splice(idx, 1);
    }
    this.#accessOrder.push(blockIndex);
  }

  #evictBlocks(): void {
    while (
      this.#accessOrder.length > this.#maxBlocksInCache &&
      this.#blocks.size > this.#maxBlocksInCache
    ) {
      const oldest = this.#accessOrder.shift();
      if (oldest !== undefined) {
        const block = this.#blocks.get(oldest);
        // Don't evict blocks currently loading
        if (block && block.state !== 'loading') {
          this.#blocks.delete(oldest);
        }
      }
    }
  }
}
