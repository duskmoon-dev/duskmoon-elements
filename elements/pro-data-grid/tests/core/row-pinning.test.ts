import { describe, it, expect } from 'bun:test';
import { RowPinning } from '../../src/core/row-pinning.js';
import type { Row } from '../../src/types.js';

const rows: Row[] = [
  { id: '1', name: 'Alice', total: 100 },
  { id: '2', name: 'Bob', total: 200 },
  { id: '3', name: 'Charlie', total: 300 },
];

describe('RowPinning', () => {
  it('starts with no pinned rows', () => {
    const rp = new RowPinning();
    expect(rp.topCount).toBe(0);
    expect(rp.bottomCount).toBe(0);
    expect(rp.hasPinnedRows).toBe(false);
  });

  describe('pinTop/pinBottom', () => {
    it('pins a row to the top', () => {
      const rp = new RowPinning();
      rp.pinTop(rows[0]);
      expect(rp.topCount).toBe(1);
      expect(rp.hasTopRows).toBe(true);
      expect(rp.topRows[0]).toEqual(rows[0]);
    });

    it('pins a row to the bottom', () => {
      const rp = new RowPinning();
      rp.pinBottom(rows[1]);
      expect(rp.bottomCount).toBe(1);
      expect(rp.hasBottomRows).toBe(true);
    });

    it('supports multiple pinned rows', () => {
      const rp = new RowPinning();
      rp.pinTop(rows[0]);
      rp.pinTop(rows[1]);
      expect(rp.topCount).toBe(2);
    });
  });

  describe('isPinned', () => {
    it('returns "top" for top-pinned rows', () => {
      const rp = new RowPinning();
      rp.pinTop(rows[0]);
      expect(rp.isPinned(rows[0])).toBe('top');
    });

    it('returns "bottom" for bottom-pinned rows', () => {
      const rp = new RowPinning();
      rp.pinBottom(rows[1]);
      expect(rp.isPinned(rows[1])).toBe('bottom');
    });

    it('returns false for unpinned rows', () => {
      const rp = new RowPinning();
      expect(rp.isPinned(rows[0])).toBe(false);
    });
  });

  describe('unpin', () => {
    it('unpins a top row', () => {
      const rp = new RowPinning();
      rp.pinTop(rows[0]);
      const result = rp.unpin(rows[0]);
      expect(result).toBe(true);
      expect(rp.topCount).toBe(0);
    });

    it('unpins a bottom row', () => {
      const rp = new RowPinning();
      rp.pinBottom(rows[1]);
      const result = rp.unpin(rows[1]);
      expect(result).toBe(true);
      expect(rp.bottomCount).toBe(0);
    });

    it('returns false when row not pinned', () => {
      const rp = new RowPinning();
      expect(rp.unpin(rows[0])).toBe(false);
    });
  });

  describe('configure', () => {
    it('sets top and bottom rows', () => {
      const rp = new RowPinning();
      rp.configure({ topRows: [rows[0]], bottomRows: [rows[2]] });
      expect(rp.topCount).toBe(1);
      expect(rp.bottomCount).toBe(1);
      expect(rp.hasPinnedRows).toBe(true);
    });
  });

  describe('clear', () => {
    it('clears all pinned rows', () => {
      const rp = new RowPinning();
      rp.pinTop(rows[0]);
      rp.pinBottom(rows[1]);
      rp.clear();
      expect(rp.topCount).toBe(0);
      expect(rp.bottomCount).toBe(0);
      expect(rp.hasPinnedRows).toBe(false);
    });
  });

  describe('immutability', () => {
    it('topRows getter returns a copy', () => {
      const rp = new RowPinning();
      rp.pinTop(rows[0]);
      const top = rp.topRows;
      top.push(rows[1]);
      expect(rp.topCount).toBe(1); // not affected
    });

    it('bottomRows getter returns a copy', () => {
      const rp = new RowPinning();
      rp.pinBottom(rows[0]);
      const bottom = rp.bottomRows;
      bottom.push(rows[1]);
      expect(rp.bottomCount).toBe(1);
    });
  });
});
