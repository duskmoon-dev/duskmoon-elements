import { describe, it, expect } from 'bun:test';
import { UndoRedoManager } from '../../src/core/undo-redo.js';
import type { CellChange } from '../../src/types.js';

describe('UndoRedoManager', () => {
  const makeChange = (field: string, oldVal: unknown, newVal: unknown): CellChange => ({
    rowIndex: 0,
    field,
    oldValue: oldVal,
    newValue: newVal,
  });

  it('starts empty', () => {
    const mgr = new UndoRedoManager();
    expect(mgr.canUndo).toBe(false);
    expect(mgr.canRedo).toBe(false);
    expect(mgr.undoSize).toBe(0);
    expect(mgr.redoSize).toBe(0);
  });

  it('push adds to undo stack', () => {
    const mgr = new UndoRedoManager();
    mgr.push(makeChange('name', 'Alice', 'Bob'));
    expect(mgr.canUndo).toBe(true);
    expect(mgr.undoSize).toBe(1);
  });

  it('push clears redo stack', () => {
    const mgr = new UndoRedoManager();
    mgr.push(makeChange('name', 'Alice', 'Bob'));
    mgr.undo();
    expect(mgr.canRedo).toBe(true);
    mgr.push(makeChange('name', 'Alice', 'Charlie'));
    expect(mgr.canRedo).toBe(false);
  });

  describe('undo', () => {
    it('returns inverse change', () => {
      const mgr = new UndoRedoManager();
      mgr.push(makeChange('name', 'Alice', 'Bob'));
      const change = mgr.undo();
      expect(change).not.toBeNull();
      expect(change!.oldValue).toBe('Bob');
      expect(change!.newValue).toBe('Alice');
    });

    it('moves change to redo stack', () => {
      const mgr = new UndoRedoManager();
      mgr.push(makeChange('name', 'Alice', 'Bob'));
      mgr.undo();
      expect(mgr.canUndo).toBe(false);
      expect(mgr.canRedo).toBe(true);
    });

    it('returns null when empty', () => {
      const mgr = new UndoRedoManager();
      expect(mgr.undo()).toBeNull();
    });
  });

  describe('redo', () => {
    it('re-applies change', () => {
      const mgr = new UndoRedoManager();
      mgr.push(makeChange('name', 'Alice', 'Bob'));
      mgr.undo();
      const change = mgr.redo();
      expect(change).not.toBeNull();
      expect(change!.newValue).toBe('Bob');
    });

    it('moves change back to undo stack', () => {
      const mgr = new UndoRedoManager();
      mgr.push(makeChange('name', 'Alice', 'Bob'));
      mgr.undo();
      mgr.redo();
      expect(mgr.canUndo).toBe(true);
      expect(mgr.canRedo).toBe(false);
    });

    it('returns null when empty', () => {
      const mgr = new UndoRedoManager();
      expect(mgr.redo()).toBeNull();
    });
  });

  it('supports multiple undo/redo', () => {
    const mgr = new UndoRedoManager();
    mgr.push(makeChange('name', 'A', 'B'));
    mgr.push(makeChange('name', 'B', 'C'));
    mgr.push(makeChange('name', 'C', 'D'));

    expect(mgr.undoSize).toBe(3);

    const u1 = mgr.undo()!;
    expect(u1.newValue).toBe('C');

    const u2 = mgr.undo()!;
    expect(u2.newValue).toBe('B');

    expect(mgr.undoSize).toBe(1);
    expect(mgr.redoSize).toBe(2);

    const r1 = mgr.redo()!;
    expect(r1.newValue).toBe('C');
  });

  describe('maxDepth', () => {
    it('trims undo stack when over limit', () => {
      const mgr = new UndoRedoManager(3);
      mgr.push(makeChange('a', 1, 2));
      mgr.push(makeChange('b', 1, 2));
      mgr.push(makeChange('c', 1, 2));
      mgr.push(makeChange('d', 1, 2));
      expect(mgr.undoSize).toBe(3);
    });

    it('can be updated', () => {
      const mgr = new UndoRedoManager(10);
      for (let i = 0; i < 10; i++) {
        mgr.push(makeChange('x', i, i + 1));
      }
      expect(mgr.undoSize).toBe(10);
      mgr.maxDepth = 5;
      expect(mgr.undoSize).toBe(5);
    });

    it('minimum depth is 1', () => {
      const mgr = new UndoRedoManager();
      mgr.maxDepth = 0;
      expect(mgr.maxDepth).toBe(1);
    });
  });

  it('clear empties both stacks', () => {
    const mgr = new UndoRedoManager();
    mgr.push(makeChange('name', 'A', 'B'));
    mgr.undo();
    mgr.clear();
    expect(mgr.canUndo).toBe(false);
    expect(mgr.canRedo).toBe(false);
  });

  it('getState returns snapshot', () => {
    const mgr = new UndoRedoManager();
    mgr.push(makeChange('name', 'A', 'B'));
    mgr.push(makeChange('age', 25, 30));
    mgr.undo();

    const state = mgr.getState();
    expect(state.undoStack.length).toBe(1);
    expect(state.redoStack.length).toBe(1);
    expect(state.undoStack[0].field).toBe('name');
    expect(state.redoStack[0].field).toBe('age');
  });
});
