import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { FocusManager } from '../../src/core/focus-manager.js';

describe('FocusManager', () => {
  let container: HTMLElement;
  let fm: FocusManager;

  beforeEach(() => {
    container = document.createElement('div');
    // Create a 3x3 grid of cells
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const cell = document.createElement('div');
        cell.setAttribute('data-grid-cell', '');
        cell.setAttribute('data-row-index', String(row));
        cell.setAttribute('data-col-index', String(col));
        cell.setAttribute('tabindex', '-1');
        container.appendChild(cell);
      }
    }
    document.body.appendChild(container);

    fm = new FocusManager();
    fm.attach(container);
  });

  afterEach(() => {
    fm.detach();
    container.remove();
  });

  it('focusCell sets tabindex="0" on the target cell', () => {
    fm.focusCell(1, 2);

    const target = container.querySelector('[data-row-index="1"][data-col-index="2"]')!;
    expect(target.getAttribute('tabindex')).toBe('0');
  });

  it('focusCell sets tabindex="-1" on all other cells', () => {
    fm.focusCell(0, 0);

    const others = container.querySelectorAll('[data-grid-cell]:not([data-row-index="0"][data-col-index="0"])');
    for (const cell of others) {
      expect(cell.getAttribute('tabindex')).toBe('-1');
    }
  });

  it('focusCell updates when called multiple times', () => {
    fm.focusCell(0, 0);
    fm.focusCell(2, 1);

    const first = container.querySelector('[data-row-index="0"][data-col-index="0"]')!;
    const second = container.querySelector('[data-row-index="2"][data-col-index="1"]')!;

    expect(first.getAttribute('tabindex')).toBe('-1');
    expect(second.getAttribute('tabindex')).toBe('0');
  });

  it('focusCell does nothing when container is detached', () => {
    fm.detach();
    fm.focusCell(0, 0);

    // No errors thrown, no tabindex changes
    const cell = container.querySelector('[data-row-index="0"][data-col-index="0"]')!;
    expect(cell.getAttribute('tabindex')).toBe('-1');
  });

  it('focusCell does nothing for non-existent cell indices', () => {
    fm.focusCell(99, 99);

    // All cells should still have tabindex="-1" (cleared by focusCell)
    const cells = container.querySelectorAll('[data-grid-cell]');
    for (const cell of cells) {
      expect(cell.getAttribute('tabindex')).toBe('-1');
    }
  });

  it('ensureGridFocusable adds tabindex="0" to container', () => {
    fm.ensureGridFocusable();
    expect(container.getAttribute('tabindex')).toBe('0');
  });

  it('ensureGridFocusable does not override existing tabindex', () => {
    container.setAttribute('tabindex', '5');
    fm.ensureGridFocusable();
    expect(container.getAttribute('tabindex')).toBe('5');
  });

  it('ensureGridFocusable does nothing when detached', () => {
    fm.detach();
    fm.ensureGridFocusable();
    // Container should not have tabindex added
    expect(container.hasAttribute('tabindex')).toBe(false);
  });

  it('attach/detach cycle works correctly', () => {
    fm.detach();
    fm.attach(container);
    fm.focusCell(1, 1);

    const target = container.querySelector('[data-row-index="1"][data-col-index="1"]')!;
    expect(target.getAttribute('tabindex')).toBe('0');
  });
});
