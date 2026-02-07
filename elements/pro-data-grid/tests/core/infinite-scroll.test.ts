import { describe, it, expect } from 'bun:test';
import { InfiniteScroll } from '../../src/core/infinite-scroll.js';
import type { IDatasource, IDatasourceGetRowsParams } from '../../src/core/datasource.js';

function autoSuccessDatasource(totalRows = 500): IDatasource {
  return {
    getRows(params: IDatasourceGetRowsParams) {
      const rows = [];
      for (let i = params.startRow; i < Math.min(params.endRow, totalRows); i++) {
        rows.push({ id: String(i), value: i });
      }
      params.success({ rowData: rows, rowCount: totalRows });
    },
  };
}

describe('InfiniteScroll', () => {
  it('starts empty', () => {
    const inf = new InfiniteScroll();
    expect(inf.datasource).toBeNull();
    expect(inf.totalRowCount).toBe(-1);
    expect(inf.isLoading).toBe(false);
  });

  it('sets datasource', () => {
    const inf = new InfiniteScroll();
    const ds = autoSuccessDatasource();
    inf.datasource = ds;
    expect(inf.datasource).toBe(ds);
  });

  describe('row access', () => {
    it('returns undefined for unloaded rows', () => {
      const inf = new InfiniteScroll({ blockSize: 10 });
      inf.datasource = autoSuccessDatasource();
      expect(inf.getRow(0)).toBeUndefined();
      expect(inf.isRowLoaded(0)).toBe(false);
    });

    it('loads rows on viewport change', () => {
      const inf = new InfiniteScroll({ blockSize: 10, overscanBlocks: 0 });
      inf.datasource = autoSuccessDatasource();

      inf.onViewportChanged(0, 10);

      expect(inf.isRowLoaded(0)).toBe(true);
      expect(inf.getRow(0)).toBeDefined();
      expect(inf.getRow(0)!.id).toBe('0');
      expect(inf.getRow(9)).toBeDefined();
      expect(inf.totalRowCount).toBe(500);
    });

    it('loads multiple blocks for larger viewport', () => {
      const inf = new InfiniteScroll({ blockSize: 10, overscanBlocks: 0 });
      inf.datasource = autoSuccessDatasource();

      inf.onViewportChanged(0, 25);

      expect(inf.isRowLoaded(0)).toBe(true);
      expect(inf.isRowLoaded(15)).toBe(true);
      expect(inf.isRowLoaded(24)).toBe(true);
    });

    it('includes overscan blocks', () => {
      const inf = new InfiniteScroll({ blockSize: 10, overscanBlocks: 1 });
      inf.datasource = autoSuccessDatasource();

      inf.onViewportChanged(10, 20); // Block 1 visible

      // Block 0 (overscan before) and block 2 (overscan after) should also be loaded
      expect(inf.isRowLoaded(0)).toBe(true);
      expect(inf.isRowLoaded(10)).toBe(true);
      expect(inf.isRowLoaded(20)).toBe(true);
    });
  });

  describe('block info', () => {
    it('returns block info', () => {
      const inf = new InfiniteScroll({ blockSize: 10 });
      inf.datasource = autoSuccessDatasource();

      inf.onViewportChanged(0, 10);

      const info = inf.getBlockInfo(0);
      expect(info.blockIndex).toBe(0);
      expect(info.startRow).toBe(0);
      expect(info.endRow).toBe(10);
      expect(info.state).toBe('loaded');
      expect(info.hasData).toBe(true);
    });

    it('returns idle for unloaded blocks', () => {
      const inf = new InfiniteScroll({ blockSize: 10 });
      const info = inf.getBlockInfo(5);
      expect(info.state).toBe('idle');
      expect(info.hasData).toBe(false);
    });

    it('lists loaded block indices', () => {
      const inf = new InfiniteScroll({ blockSize: 10, overscanBlocks: 0 });
      inf.datasource = autoSuccessDatasource();

      inf.onViewportChanged(0, 20);

      const loaded = inf.getLoadedBlockIndices();
      expect(loaded).toEqual([0, 1]);
    });
  });

  describe('cache eviction (LRU)', () => {
    it('evicts oldest blocks when cache limit exceeded', () => {
      const inf = new InfiniteScroll({
        blockSize: 10,
        maxBlocksInCache: 3,
        overscanBlocks: 0,
      });
      inf.datasource = autoSuccessDatasource();

      // Load blocks 0, 1, 2
      inf.onViewportChanged(0, 30);
      expect(inf.getLoadedBlockIndices()).toEqual([0, 1, 2]);

      // Load block 3 → should evict block 0
      inf.onViewportChanged(30, 40);
      const loaded = inf.getLoadedBlockIndices();
      expect(loaded).not.toContain(0);
      expect(loaded).toContain(3);
    });
  });

  describe('retry', () => {
    it('retries a failed block', () => {
      let attempt = 0;
      const inf = new InfiniteScroll({ blockSize: 10, overscanBlocks: 0 });
      inf.datasource = {
        getRows(params) {
          attempt++;
          if (attempt === 1) {
            params.fail(new Error('fail'));
          } else {
            params.success({ rowData: [{ id: '0' }], rowCount: 1 });
          }
        },
      };

      inf.onViewportChanged(0, 10);
      expect(inf.getBlockInfo(0).state).toBe('failed');

      const retried = inf.retryBlock(0);
      expect(retried).toBe(true);
      expect(inf.isRowLoaded(0)).toBe(true);
    });

    it('returns false for non-failed blocks', () => {
      const inf = new InfiniteScroll({ blockSize: 10, overscanBlocks: 0 });
      inf.datasource = autoSuccessDatasource();

      inf.onViewportChanged(0, 10);
      expect(inf.retryBlock(0)).toBe(false);
    });
  });

  describe('parameter changes', () => {
    it('resets cache on sort change', () => {
      const inf = new InfiniteScroll({ blockSize: 10, overscanBlocks: 0 });
      inf.datasource = autoSuccessDatasource();

      inf.onViewportChanged(0, 10);
      expect(inf.isRowLoaded(0)).toBe(true);

      inf.setParams({ sortModel: [{ field: 'name', direction: 'asc' }] });
      expect(inf.isRowLoaded(0)).toBe(false);
      expect(inf.totalRowCount).toBe(-1);
    });

    it('resets cache on filter change', () => {
      const inf = new InfiniteScroll({ blockSize: 10, overscanBlocks: 0 });
      inf.datasource = autoSuccessDatasource();

      inf.onViewportChanged(0, 10);
      inf.setParams({ filterModel: { x: { type: 'text', operator: 'equals', value: 'a' } } });
      expect(inf.isRowLoaded(0)).toBe(false);
    });
  });

  describe('callbacks', () => {
    it('fires onBlockLoaded callback', () => {
      const inf = new InfiniteScroll({ blockSize: 10, overscanBlocks: 0 });
      inf.datasource = autoSuccessDatasource();

      const loadedBlocks: number[] = [];
      inf.onViewportChanged(0, 20, {
        onBlockLoaded: (idx) => loadedBlocks.push(idx),
      });

      expect(loadedBlocks).toEqual([0, 1]);
    });

    it('fires onBlockFailed callback', () => {
      const inf = new InfiniteScroll({ blockSize: 10, overscanBlocks: 0 });
      inf.datasource = {
        getRows(params) {
          params.fail(new Error('err'));
        },
      };

      const failedBlocks: number[] = [];
      inf.onViewportChanged(0, 10, {
        onBlockFailed: (idx) => failedBlocks.push(idx),
      });

      expect(failedBlocks).toEqual([0]);
    });
  });

  describe('reset & destroy', () => {
    it('resets all state', () => {
      const inf = new InfiniteScroll({ blockSize: 10, overscanBlocks: 0 });
      inf.datasource = autoSuccessDatasource();

      inf.onViewportChanged(0, 20);
      inf.reset();

      expect(inf.totalRowCount).toBe(-1);
      expect(inf.getLoadedBlockIndices()).toEqual([]);
    });

    it('destroys datasource', () => {
      let destroyed = false;
      const inf = new InfiniteScroll();
      inf.datasource = {
        getRows: () => {},
        destroy: () => {
          destroyed = true;
        },
      };

      inf.destroy();
      expect(destroyed).toBe(true);
      expect(inf.datasource).toBeNull();
    });
  });
});
