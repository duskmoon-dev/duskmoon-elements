import { describe, it, expect } from 'bun:test';
import { TransactionManager } from '../../src/core/transaction.js';
import type { Row } from '../../src/types.js';

const rows: Row[] = [
  { id: '1', name: 'Alice', age: 30 },
  { id: '2', name: 'Bob', age: 25 },
  { id: '3', name: 'Charlie', age: 35 },
];

describe('TransactionManager', () => {
  it('starts with empty log', () => {
    const tm = new TransactionManager();
    expect(tm.logSize).toBe(0);
    expect(tm.rowKey).toBe('id');
  });

  describe('add', () => {
    it('adds rows at the end by default', () => {
      const tm = new TransactionManager();
      const { rows: result, result: txResult } = tm.apply([...rows], {
        add: [{ id: '4', name: 'Diana', age: 28 }],
      });

      expect(result.length).toBe(4);
      expect(result[3].name).toBe('Diana');
      expect(txResult.add.length).toBe(1);
    });

    it('adds rows at specified index', () => {
      const tm = new TransactionManager();
      const { rows: result } = tm.apply([...rows], {
        add: [{ id: '4', name: 'Diana', age: 28 }],
        addIndex: 1,
      });

      expect(result.length).toBe(4);
      expect(result[1].name).toBe('Diana');
      expect(result[2].name).toBe('Bob');
    });

    it('clamps addIndex to array bounds', () => {
      const tm = new TransactionManager();
      const { rows: result } = tm.apply([...rows], {
        add: [{ id: '4', name: 'Diana' }],
        addIndex: 100,
      });

      expect(result.length).toBe(4);
      expect(result[3].name).toBe('Diana');
    });
  });

  describe('update', () => {
    it('updates existing rows by merging fields', () => {
      const tm = new TransactionManager();
      const { rows: result, result: txResult } = tm.apply([...rows], {
        update: [{ id: '2', name: 'Bobby', age: 26 }],
      });

      expect(result.length).toBe(3);
      expect(result[1].name).toBe('Bobby');
      expect(result[1].age).toBe(26);
      expect(txResult.update.length).toBe(1);
      expect(txResult.update[0].oldRow.name).toBe('Bob');
      expect(txResult.update[0].newRow.name).toBe('Bobby');
    });

    it('preserves fields not in update', () => {
      const tm = new TransactionManager();
      const { rows: result } = tm.apply([...rows], {
        update: [{ id: '1', age: 31 }],
      });

      expect(result[0].name).toBe('Alice');
      expect(result[0].age).toBe(31);
    });

    it('ignores updates for non-existent keys', () => {
      const tm = new TransactionManager();
      const { rows: result, result: txResult } = tm.apply([...rows], {
        update: [{ id: '99', name: 'Nobody' }],
      });

      expect(result.length).toBe(3);
      expect(txResult.update.length).toBe(0);
    });
  });

  describe('remove', () => {
    it('removes rows by key', () => {
      const tm = new TransactionManager();
      const { rows: result, result: txResult } = tm.apply([...rows], {
        remove: [{ id: '2' }],
      });

      expect(result.length).toBe(2);
      expect(result.find((r) => r.id === '2')).toBeUndefined();
      expect(txResult.remove.length).toBe(1);
      expect(txResult.remove[0].name).toBe('Bob');
    });

    it('removes multiple rows', () => {
      const tm = new TransactionManager();
      const { rows: result } = tm.apply([...rows], {
        remove: [{ id: '1' }, { id: '3' }],
      });

      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Bob');
    });

    it('ignores non-existent remove targets', () => {
      const tm = new TransactionManager();
      const { rows: result, result: txResult } = tm.apply([...rows], {
        remove: [{ id: '99' }],
      });

      expect(result.length).toBe(3);
      expect(txResult.remove.length).toBe(0);
    });
  });

  describe('combined operations', () => {
    it('processes remove → update → add in order', () => {
      const tm = new TransactionManager();
      const { rows: result } = tm.apply([...rows], {
        remove: [{ id: '1' }],
        update: [{ id: '2', name: 'Bobby' }],
        add: [{ id: '4', name: 'Diana' }],
      });

      expect(result.length).toBe(3); // 3 - 1 + 1
      expect(result.find((r) => r.id === '1')).toBeUndefined();
      expect(result.find((r) => r.name === 'Bobby')).toBeDefined();
      expect(result.find((r) => r.name === 'Diana')).toBeDefined();
    });
  });

  describe('batch', () => {
    it('applies multiple transactions sequentially', () => {
      const tm = new TransactionManager();
      const { rows: result, results } = tm.applyBatch([...rows], [
        { add: [{ id: '4', name: 'Diana' }] },
        { remove: [{ id: '1' }] },
      ]);

      expect(result.length).toBe(3); // 3 + 1 - 1
      expect(results.length).toBe(2);
      expect(results[0].add.length).toBe(1);
      expect(results[1].remove.length).toBe(1);
    });
  });

  describe('undo', () => {
    it('builds undo transaction for add', () => {
      const tm = new TransactionManager();
      tm.apply([...rows], {
        add: [{ id: '4', name: 'Diana' }],
      });

      const undoTx = tm.buildUndoTransaction();
      expect(undoTx).not.toBeNull();
      expect(undoTx!.remove).toHaveLength(1);
      expect(undoTx!.remove![0].id).toBe('4');
    });

    it('builds undo transaction for remove', () => {
      const tm = new TransactionManager();
      tm.apply([...rows], {
        remove: [{ id: '2' }],
      });

      const undoTx = tm.buildUndoTransaction();
      expect(undoTx).not.toBeNull();
      expect(undoTx!.add).toHaveLength(1);
      expect(undoTx!.add![0].name).toBe('Bob');
    });

    it('builds undo transaction for update', () => {
      const tm = new TransactionManager();
      tm.apply([...rows], {
        update: [{ id: '1', name: 'Alicia' }],
      });

      const undoTx = tm.buildUndoTransaction();
      expect(undoTx).not.toBeNull();
      expect(undoTx!.update).toHaveLength(1);
      expect(undoTx!.update![0].name).toBe('Alice');
    });

    it('returns null when no log', () => {
      const tm = new TransactionManager();
      expect(tm.buildUndoTransaction()).toBeNull();
    });
  });

  describe('validation', () => {
    it('detects duplicate keys on add', () => {
      const tm = new TransactionManager();
      const errors = tm.validate(rows, {
        add: [{ id: '1', name: 'Duplicate' }],
      });

      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('Duplicate key: 1');
    });

    it('detects missing update targets', () => {
      const tm = new TransactionManager();
      const errors = tm.validate(rows, {
        update: [{ id: '99', name: 'Nobody' }],
      });

      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('Update target not found: 99');
    });

    it('detects missing remove targets', () => {
      const tm = new TransactionManager();
      const errors = tm.validate(rows, {
        remove: [{ id: '99' }],
      });

      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('Remove target not found: 99');
    });

    it('returns empty array when valid', () => {
      const tm = new TransactionManager();
      const errors = tm.validate(rows, {
        add: [{ id: '4', name: 'Diana' }],
        update: [{ id: '1', age: 31 }],
        remove: [{ id: '3' }],
      });

      expect(errors).toEqual([]);
    });
  });

  describe('log management', () => {
    it('records transactions in log', () => {
      const tm = new TransactionManager();
      tm.apply([...rows], { add: [{ id: '4' }] });
      tm.apply([...rows], { remove: [{ id: '1' }] });

      expect(tm.logSize).toBe(2);
      const log = tm.log;
      expect(log.length).toBe(2);
      expect(log[0].timestamp).toBeGreaterThan(0);
    });

    it('clears log', () => {
      const tm = new TransactionManager();
      tm.apply([...rows], { add: [{ id: '4' }] });
      tm.clearLog();
      expect(tm.logSize).toBe(0);
    });

    it('trims log at max size', () => {
      const tm = new TransactionManager({ maxLogSize: 3 });
      for (let i = 0; i < 5; i++) {
        tm.apply([...rows], { add: [{ id: `${10 + i}` }] });
      }
      expect(tm.logSize).toBe(3);
    });
  });

  describe('custom rowKey', () => {
    it('uses custom rowKey for matching', () => {
      const tm = new TransactionManager({ rowKey: 'uid' });
      const customRows: Row[] = [
        { uid: 'a', name: 'Alice' },
        { uid: 'b', name: 'Bob' },
      ];

      const { rows: result } = tm.apply(customRows, {
        remove: [{ uid: 'a' }],
      });

      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Bob');
    });
  });
});
