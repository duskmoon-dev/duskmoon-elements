import { describe, it, expect } from 'bun:test';
import { VirtualScroller } from '../../src/core/virtual-scroller.js';

describe('VirtualScroller', () => {
  const createScroller = (opts?: Partial<ConstructorParameters<typeof VirtualScroller>[0]>) =>
    new VirtualScroller({
      rowHeight: 40,
      viewportHeight: 400,
      totalRows: 1000,
      ...opts,
    });

  it('calculates total content height', () => {
    const s = createScroller();
    expect(s.totalContentHeight).toBe(40000);
  });

  it('calculates visible row count', () => {
    const s = createScroller();
    expect(s.visibleRowCount).toBe(10); // 400/40
  });

  it('returns correct visible range at scroll top 0', () => {
    const s = createScroller();
    s.scrollTop = 0;
    const range = s.getVisibleRange();
    expect(range.startIndex).toBe(0);
    expect(range.startOffset).toBe(0);
    expect(range.endIndex).toBeGreaterThanOrEqual(19); // visible + buffer
  });

  it('returns correct visible range after scrolling', () => {
    const s = createScroller();
    s.scrollTop = 2000; // row 50
    const range = s.getVisibleRange();
    expect(range.startIndex).toBeLessThanOrEqual(50);
    expect(range.endIndex).toBeGreaterThanOrEqual(59);
  });

  it('clamps scroll top to valid range', () => {
    const s = createScroller();
    s.scrollTop = -100;
    expect(s.scrollTop).toBe(0);

    s.scrollTop = 99999999;
    expect(s.scrollTop).toBe(s.totalContentHeight - s.viewportHeight);
  });

  it('getScrollTopForRow returns current scrollTop if row already visible', () => {
    const s = createScroller();
    s.scrollTop = 0;
    const top = s.getScrollTopForRow(5); // row 5 is at 200px, viewport 0-400
    expect(top).toBe(0);
  });

  it('getScrollTopForRow scrolls down for rows below viewport', () => {
    const s = createScroller();
    s.scrollTop = 0;
    const top = s.getScrollTopForRow(20); // row 20 at 800px, needs to scroll
    expect(top).toBeGreaterThan(0);
  });

  it('getRowIndexAtOffset returns correct index', () => {
    const s = createScroller();
    expect(s.getRowIndexAtOffset(0)).toBe(0);
    expect(s.getRowIndexAtOffset(40)).toBe(1);
    expect(s.getRowIndexAtOffset(200)).toBe(5);
  });

  it('getRowOffset returns correct offset', () => {
    const s = createScroller();
    expect(s.getRowOffset(0)).toBe(0);
    expect(s.getRowOffset(10)).toBe(400);
  });

  it('updates totalRows dynamically', () => {
    const s = createScroller();
    s.totalRows = 500;
    expect(s.totalContentHeight).toBe(20000);
    expect(s.totalRows).toBe(500);
  });

  it('handles zero rows', () => {
    const s = createScroller({ totalRows: 0 });
    expect(s.totalContentHeight).toBe(0);
    const range = s.getVisibleRange();
    expect(range.startIndex).toBe(0);
    expect(range.endIndex).toBe(0); // clamped to -1, but max(0, ...) should be handled
  });

  it('handles viewport larger than content', () => {
    const s = createScroller({ totalRows: 3, viewportHeight: 400 });
    const range = s.getVisibleRange();
    expect(range.startIndex).toBe(0);
    expect(range.endIndex).toBe(2);
  });

  it('respects buffer multiplier', () => {
    const s = createScroller({ bufferMultiplier: 2 });
    s.scrollTop = 4000; // row 100
    const range = s.getVisibleRange();
    // With buffer 2x = 20 extra rows each side
    expect(range.startIndex).toBeLessThanOrEqual(80);
    expect(range.endIndex).toBeGreaterThanOrEqual(129);
  });

  it('getScrollState returns snapshot', () => {
    const s = createScroller();
    s.scrollTop = 500;
    const state = s.getScrollState();
    expect(state.scrollTop).toBe(500);
    expect(state.viewportHeight).toBe(400);
  });
});
