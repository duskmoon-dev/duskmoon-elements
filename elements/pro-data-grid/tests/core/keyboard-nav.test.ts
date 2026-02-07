import { describe, it, expect } from 'bun:test';
import { KeyboardNav, type GridPosition } from '../../src/core/keyboard-nav.js';

describe('KeyboardNav', () => {
  const createNav = (rowCount = 100, colCount = 5) => {
    const events: { type: string; pos: GridPosition }[] = [];
    const nav = new KeyboardNav({
      rowCount,
      colCount,
      pageSize: 10,
      onNavigate: (pos) => events.push({ type: 'navigate', pos }),
      onActivate: (pos) => events.push({ type: 'activate', pos }),
      onSelect: (pos) => events.push({ type: 'select', pos }),
      onEscape: () => events.push({ type: 'escape', pos: { rowIndex: -1, colIndex: -1 } }),
    });
    return { nav, events };
  };

  const makeKeyEvent = (key: string, opts: Partial<KeyboardEvent> = {}): KeyboardEvent => {
    return {
      key,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      preventDefault: () => {},
      ...opts,
    } as unknown as KeyboardEvent;
  };

  it('starts at position 0,0', () => {
    const { nav } = createNav();
    expect(nav.position).toEqual({ rowIndex: 0, colIndex: 0 });
  });

  it('moves down with ArrowDown', () => {
    const { nav, events } = createNav();
    nav.handleKeyDown(makeKeyEvent('ArrowDown'));
    expect(events[0].pos).toEqual({ rowIndex: 1, colIndex: 0 });
  });

  it('moves up with ArrowUp', () => {
    const { nav, events } = createNav();
    nav.position = { rowIndex: 5, colIndex: 0 };
    nav.handleKeyDown(makeKeyEvent('ArrowUp'));
    expect(events[0].pos).toEqual({ rowIndex: 4, colIndex: 0 });
  });

  it('moves right with ArrowRight', () => {
    const { nav, events } = createNav();
    nav.handleKeyDown(makeKeyEvent('ArrowRight'));
    expect(events[0].pos).toEqual({ rowIndex: 0, colIndex: 1 });
  });

  it('moves left with ArrowLeft', () => {
    const { nav, events } = createNav();
    nav.position = { rowIndex: 0, colIndex: 3 };
    nav.handleKeyDown(makeKeyEvent('ArrowLeft'));
    expect(events[0].pos).toEqual({ rowIndex: 0, colIndex: 2 });
  });

  it('clamps at boundaries (top)', () => {
    const { nav, events } = createNav();
    nav.position = { rowIndex: 0, colIndex: 0 };
    nav.handleKeyDown(makeKeyEvent('ArrowUp'));
    expect(events[0].pos.rowIndex).toBe(0);
  });

  it('clamps at boundaries (right)', () => {
    const { nav, events } = createNav(100, 5);
    nav.position = { rowIndex: 0, colIndex: 4 };
    nav.handleKeyDown(makeKeyEvent('ArrowRight'));
    expect(events[0].pos.colIndex).toBe(4);
  });

  it('Home goes to first column', () => {
    const { nav, events } = createNav();
    nav.position = { rowIndex: 5, colIndex: 3 };
    nav.handleKeyDown(makeKeyEvent('Home'));
    expect(events[0].pos).toEqual({ rowIndex: 5, colIndex: 0 });
  });

  it('End goes to last column', () => {
    const { nav, events } = createNav(100, 5);
    nav.position = { rowIndex: 5, colIndex: 0 };
    nav.handleKeyDown(makeKeyEvent('End'));
    expect(events[0].pos).toEqual({ rowIndex: 5, colIndex: 4 });
  });

  it('Ctrl+Home goes to first cell', () => {
    const { nav, events } = createNav();
    nav.position = { rowIndex: 50, colIndex: 3 };
    nav.handleKeyDown(makeKeyEvent('Home', { ctrlKey: true }));
    expect(events[0].pos).toEqual({ rowIndex: 0, colIndex: 0 });
  });

  it('Ctrl+End goes to last cell', () => {
    const { nav, events } = createNav(100, 5);
    nav.position = { rowIndex: 0, colIndex: 0 };
    nav.handleKeyDown(makeKeyEvent('End', { ctrlKey: true }));
    expect(events[0].pos).toEqual({ rowIndex: 99, colIndex: 4 });
  });

  it('PageDown moves by pageSize', () => {
    const { nav, events } = createNav();
    nav.handleKeyDown(makeKeyEvent('PageDown'));
    expect(events[0].pos.rowIndex).toBe(10); // pageSize = 10
  });

  it('PageUp moves up by pageSize', () => {
    const { nav, events } = createNav();
    nav.position = { rowIndex: 50, colIndex: 0 };
    nav.handleKeyDown(makeKeyEvent('PageUp'));
    expect(events[0].pos.rowIndex).toBe(40);
  });

  it('Enter triggers activate', () => {
    const { nav, events } = createNav();
    nav.handleKeyDown(makeKeyEvent('Enter'));
    expect(events[0].type).toBe('activate');
  });

  it('F2 triggers activate', () => {
    const { nav, events } = createNav();
    nav.handleKeyDown(makeKeyEvent('F2'));
    expect(events[0].type).toBe('activate');
  });

  it('Space triggers select', () => {
    const { nav, events } = createNav();
    nav.handleKeyDown(makeKeyEvent(' '));
    expect(events[0].type).toBe('select');
  });

  it('Escape triggers escape', () => {
    const { nav, events } = createNav();
    nav.handleKeyDown(makeKeyEvent('Escape'));
    expect(events[0].type).toBe('escape');
  });

  it('Tab moves to next cell, wrapping rows', () => {
    const { nav, events } = createNav(100, 3);
    nav.position = { rowIndex: 0, colIndex: 2 };
    nav.handleKeyDown(makeKeyEvent('Tab'));
    expect(events[0].pos).toEqual({ rowIndex: 1, colIndex: 0 });
  });

  it('Shift+Tab moves to previous cell, wrapping rows', () => {
    const { nav, events } = createNav(100, 3);
    nav.position = { rowIndex: 1, colIndex: 0 };
    nav.handleKeyDown(makeKeyEvent('Tab', { shiftKey: true }));
    expect(events[0].pos).toEqual({ rowIndex: 0, colIndex: 2 });
  });

  it('updateBounds clamps position', () => {
    const { nav } = createNav(100, 5);
    nav.position = { rowIndex: 50, colIndex: 4 };
    nav.updateBounds(10, 3);
    expect(nav.position.rowIndex).toBe(9);
    expect(nav.position.colIndex).toBe(2);
  });

  it('returns false for unhandled keys', () => {
    const { nav } = createNav();
    const handled = nav.handleKeyDown(makeKeyEvent('a'));
    expect(handled).toBe(false);
  });
});
