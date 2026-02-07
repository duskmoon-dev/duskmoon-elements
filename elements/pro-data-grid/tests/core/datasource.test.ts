import { describe, it, expect } from 'bun:test';
import { ServerRowModel } from '../../src/core/datasource.js';
import type { IDatasource, IDatasourceGetRowsParams } from '../../src/core/datasource.js';

function makeDatasource(
  handler: (params: IDatasourceGetRowsParams) => void,
): IDatasource {
  return { getRows: handler };
}

function autoSuccessDatasource(totalRows = 200): IDatasource {
  return makeDatasource((params) => {
    const rows = [];
    for (let i = params.startRow; i < Math.min(params.endRow, totalRows); i++) {
      rows.push({ id: String(i), value: i });
    }
    params.success({ rowData: rows, rowCount: totalRows });
  });
}

describe('ServerRowModel', () => {
  it('starts with no datasource', () => {
    const model = new ServerRowModel();
    expect(model.datasource).toBeNull();
    expect(model.totalRowCount).toBe(-1);
    expect(model.isLoading).toBe(false);
  });

  it('sets datasource', () => {
    const model = new ServerRowModel();
    const ds = autoSuccessDatasource();
    model.datasource = ds;
    expect(model.datasource).toBe(ds);
  });

  describe('block loading', () => {
    it('calculates block index from row index', () => {
      const model = new ServerRowModel({ blockSize: 50 });
      expect(model.getBlockForRow(0)).toBe(0);
      expect(model.getBlockForRow(49)).toBe(0);
      expect(model.getBlockForRow(50)).toBe(1);
      expect(model.getBlockForRow(99)).toBe(1);
    });

    it('loads a block synchronously with auto-success datasource', () => {
      const model = new ServerRowModel({ blockSize: 10 });
      model.datasource = autoSuccessDatasource(100);

      model.requestBlock(0);

      expect(model.isBlockLoaded(0)).toBe(true);
      expect(model.totalRowCount).toBe(100);
      expect(model.loadedBlockCount).toBe(1);
    });

    it('retrieves rows from loaded blocks', () => {
      const model = new ServerRowModel({ blockSize: 10 });
      model.datasource = autoSuccessDatasource(100);

      model.requestBlock(0);

      const row = model.getRow(5);
      expect(row).toBeDefined();
      expect(row!.id).toBe('5');
    });

    it('returns undefined for rows in unloaded blocks', () => {
      const model = new ServerRowModel({ blockSize: 10 });
      model.datasource = autoSuccessDatasource(100);

      expect(model.getRow(5)).toBeUndefined();
    });

    it('does not re-request already loaded blocks', () => {
      let requestCount = 0;
      const model = new ServerRowModel({ blockSize: 10 });
      model.datasource = makeDatasource((params) => {
        requestCount++;
        params.success({ rowData: [], rowCount: 100 });
      });

      model.requestBlock(0);
      model.requestBlock(0);

      expect(requestCount).toBe(1);
    });

    it('handles failed blocks', () => {
      const model = new ServerRowModel({ blockSize: 10 });
      model.datasource = makeDatasource((params) => {
        params.fail(new Error('Network error'));
      });

      model.requestBlock(0);

      const block = model.getBlockState(0);
      expect(block).toBeDefined();
      expect(block!.state).toBe('failed');
      expect(block!.error).toBeDefined();
    });

    it('calls onSuccess callback', () => {
      const model = new ServerRowModel({ blockSize: 10 });
      model.datasource = autoSuccessDatasource(50);

      let successCalled = false;
      model.requestBlock(0, {
        onSuccess: () => {
          successCalled = true;
        },
      });

      expect(successCalled).toBe(true);
    });

    it('calls onFail callback', () => {
      const model = new ServerRowModel({ blockSize: 10 });
      model.datasource = makeDatasource((params) => params.fail());

      let failCalled = false;
      model.requestBlock(0, {
        onFail: () => {
          failCalled = true;
        },
      });

      expect(failCalled).toBe(true);
    });
  });

  describe('ensureBlocksForRange', () => {
    it('loads all blocks for a visible range', () => {
      const model = new ServerRowModel({ blockSize: 10 });
      model.datasource = autoSuccessDatasource(100);

      model.ensureBlocksForRange(5, 25);

      expect(model.isBlockLoaded(0)).toBe(true);
      expect(model.isBlockLoaded(1)).toBe(true);
      expect(model.isBlockLoaded(2)).toBe(true);
    });
  });

  describe('retry', () => {
    it('retries a failed block', () => {
      let attempt = 0;
      const model = new ServerRowModel({ blockSize: 10 });
      model.datasource = makeDatasource((params) => {
        attempt++;
        if (attempt === 1) {
          params.fail();
        } else {
          params.success({ rowData: [{ id: '0' }], rowCount: 1 });
        }
      });

      model.requestBlock(0);
      expect(model.getBlockState(0)!.state).toBe('failed');

      const retried = model.retryBlock(0);
      expect(retried).toBe(true);
      expect(model.isBlockLoaded(0)).toBe(true);
    });

    it('returns false when retrying non-failed block', () => {
      const model = new ServerRowModel({ blockSize: 10 });
      model.datasource = autoSuccessDatasource(50);

      model.requestBlock(0);
      expect(model.retryBlock(0)).toBe(false);
    });
  });

  describe('cache management', () => {
    it('purges all cache', () => {
      const model = new ServerRowModel({ blockSize: 10 });
      model.datasource = autoSuccessDatasource(100);

      model.requestBlock(0);
      model.requestBlock(1);
      expect(model.cacheBlockCount).toBe(2);

      model.purgeCache();
      expect(model.cacheBlockCount).toBe(0);
      expect(model.totalRowCount).toBe(-1);
    });

    it('purges a single block', () => {
      const model = new ServerRowModel({ blockSize: 10 });
      model.datasource = autoSuccessDatasource(100);

      model.requestBlock(0);
      model.requestBlock(1);

      const purged = model.purgeBlock(0);
      expect(purged).toBe(true);
      expect(model.cacheBlockCount).toBe(1);
      expect(model.isBlockLoaded(0)).toBe(false);
    });
  });

  describe('request parameters', () => {
    it('sends sort/filter model with request', () => {
      let receivedParams: IDatasourceGetRowsParams | null = null;
      const model = new ServerRowModel({ blockSize: 10 });
      model.datasource = makeDatasource((params) => {
        receivedParams = params;
        params.success({ rowData: [], rowCount: 0 });
      });

      model.setRequestParams({
        sortModel: [{ field: 'name', direction: 'asc' }],
        filterModel: { status: { type: 'text', operator: 'equals', value: 'active' } },
      });

      model.requestBlock(0);

      expect(receivedParams).not.toBeNull();
      expect(receivedParams!.sortModel).toEqual([{ field: 'name', direction: 'asc' }]);
      expect(receivedParams!.filterModel).toHaveProperty('status');
    });

    it('purges cache when params change', () => {
      const model = new ServerRowModel({ blockSize: 10 });
      model.datasource = autoSuccessDatasource(100);

      model.requestBlock(0);
      expect(model.isBlockLoaded(0)).toBe(true);

      model.setRequestParams({ sortModel: [{ field: 'name', direction: 'desc' }] });
      expect(model.isBlockLoaded(0)).toBe(false);
      expect(model.cacheBlockCount).toBe(0);
    });
  });

  describe('concurrent request limiting', () => {
    it('queues requests beyond max concurrent', () => {
      const pending: IDatasourceGetRowsParams[] = [];
      const model = new ServerRowModel({ blockSize: 10, maxConcurrentRequests: 1 });
      model.datasource = makeDatasource((params) => {
        pending.push(params);
      });

      model.requestBlock(0);
      model.requestBlock(1);

      // First is loading, second should be idle (queued)
      expect(model.isBlockLoading(0)).toBe(true);
      expect(model.getBlockState(1)!.state).toBe('idle');

      // Complete first request → second should auto-fetch
      pending[0].success({ rowData: [], rowCount: 100 });
      expect(model.isBlockLoaded(0)).toBe(true);
      // Second block should now be loading
      expect(pending.length).toBe(2);
    });
  });

  describe('destroy', () => {
    it('calls datasource destroy and cleans up', () => {
      let destroyed = false;
      const model = new ServerRowModel();
      model.datasource = {
        getRows: () => {},
        destroy: () => {
          destroyed = true;
        },
      };

      model.destroy();
      expect(destroyed).toBe(true);
      expect(model.datasource).toBeNull();
      expect(model.cacheBlockCount).toBe(0);
    });
  });
});
