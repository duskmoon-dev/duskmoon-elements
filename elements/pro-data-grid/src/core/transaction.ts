/**
 * Transaction manager for the data grid.
 *
 * Supports add/update/remove operations on the dataset without
 * replacing the entire array. Maintains a transaction log for
 * audit/undo purposes.
 */

import type { Row } from '../types.js';

// ─── Types ──────────────────────────────────

export interface RowTransaction {
  add?: Row[];
  addIndex?: number;
  update?: Row[];
  remove?: Row[];
}

export interface TransactionResult {
  add: Row[];
  update: Array<{ oldRow: Row; newRow: Row }>;
  remove: Row[];
}

export interface TransactionLogEntry {
  timestamp: number;
  transaction: RowTransaction;
  result: TransactionResult;
}

// ─── TransactionManager ─────────────────────

export class TransactionManager {
  #rowKey: string;
  #log: TransactionLogEntry[] = [];
  #maxLogSize: number;

  constructor(options: { rowKey?: string; maxLogSize?: number } = {}) {
    this.#rowKey = options.rowKey ?? 'id';
    this.#maxLogSize = options.maxLogSize ?? 100;
  }

  // ─── Configuration ─────────────────────────

  get rowKey(): string {
    return this.#rowKey;
  }

  set rowKey(key: string) {
    this.#rowKey = key;
  }

  get logSize(): number {
    return this.#log.length;
  }

  get log(): TransactionLogEntry[] {
    return [...this.#log];
  }

  // ─── Apply Transaction ─────────────────────

  apply(rows: Row[], tx: RowTransaction): { rows: Row[]; result: TransactionResult } {
    const result: TransactionResult = {
      add: [],
      update: [],
      remove: [],
    };

    let newRows = [...rows];

    // Process removes first (by rowKey)
    if (tx.remove && tx.remove.length > 0) {
      const removeKeys = new Set(tx.remove.map((r) => String(r[this.#rowKey])));
      const removed: Row[] = [];

      newRows = newRows.filter((row) => {
        const key = String(row[this.#rowKey]);
        if (removeKeys.has(key)) {
          removed.push(row);
          return false;
        }
        return true;
      });

      result.remove = removed;
    }

    // Process updates (match by rowKey, merge fields)
    if (tx.update && tx.update.length > 0) {
      const updateMap = new Map<string, Row>();
      for (const row of tx.update) {
        updateMap.set(String(row[this.#rowKey]), row);
      }

      newRows = newRows.map((row) => {
        const key = String(row[this.#rowKey]);
        const updateRow = updateMap.get(key);
        if (updateRow) {
          const merged = { ...row, ...updateRow };
          result.update.push({ oldRow: row, newRow: merged });
          return merged;
        }
        return row;
      });
    }

    // Process adds
    if (tx.add && tx.add.length > 0) {
      const addIndex = tx.addIndex ?? newRows.length;
      const clampedIndex = Math.max(0, Math.min(addIndex, newRows.length));
      newRows.splice(clampedIndex, 0, ...tx.add);
      result.add = [...tx.add];
    }

    // Record in log
    this.#recordLog(tx, result);

    return { rows: newRows, result };
  }

  // ─── Batch Transactions ────────────────────

  applyBatch(
    rows: Row[],
    transactions: RowTransaction[],
  ): { rows: Row[]; results: TransactionResult[] } {
    const results: TransactionResult[] = [];
    let currentRows = rows;

    for (const tx of transactions) {
      const { rows: newRows, result } = this.apply(currentRows, tx);
      currentRows = newRows;
      results.push(result);
    }

    return { rows: currentRows, results };
  }

  // ─── Undo Last Transaction ─────────────────

  buildUndoTransaction(): RowTransaction | null {
    if (this.#log.length === 0) return null;

    const lastEntry = this.#log[this.#log.length - 1];
    const { result } = lastEntry;

    // Reverse the transaction:
    // - Added rows → remove them
    // - Removed rows → add them back
    // - Updated rows → restore old values
    const undoTx: RowTransaction = {};

    if (result.add.length > 0) {
      undoTx.remove = result.add;
    }

    if (result.remove.length > 0) {
      undoTx.add = result.remove;
    }

    if (result.update.length > 0) {
      undoTx.update = result.update.map((u) => u.oldRow);
    }

    return undoTx;
  }

  // ─── Validation ────────────────────────────

  validate(rows: Row[], tx: RowTransaction): string[] {
    const errors: string[] = [];

    // Check for duplicate keys in adds
    if (tx.add && tx.add.length > 0) {
      const existingKeys = new Set(rows.map((r) => String(r[this.#rowKey])));
      for (const row of tx.add) {
        const key = String(row[this.#rowKey]);
        if (existingKeys.has(key)) {
          errors.push(`Duplicate key: ${key}`);
        }
      }
    }

    // Check that update targets exist
    if (tx.update && tx.update.length > 0) {
      const existingKeys = new Set(rows.map((r) => String(r[this.#rowKey])));
      for (const row of tx.update) {
        const key = String(row[this.#rowKey]);
        if (!existingKeys.has(key)) {
          errors.push(`Update target not found: ${key}`);
        }
      }
    }

    // Check that remove targets exist
    if (tx.remove && tx.remove.length > 0) {
      const existingKeys = new Set(rows.map((r) => String(r[this.#rowKey])));
      for (const row of tx.remove) {
        const key = String(row[this.#rowKey]);
        if (!existingKeys.has(key)) {
          errors.push(`Remove target not found: ${key}`);
        }
      }
    }

    return errors;
  }

  // ─── Clear ─────────────────────────────────

  clearLog(): void {
    this.#log = [];
  }

  // ─── Private ───────────────────────────────

  #recordLog(tx: RowTransaction, result: TransactionResult): void {
    this.#log.push({
      timestamp: Date.now(),
      transaction: tx,
      result,
    });

    // Trim log if over max size
    while (this.#log.length > this.#maxLogSize) {
      this.#log.shift();
    }
  }
}
