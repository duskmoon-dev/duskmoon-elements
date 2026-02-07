import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmTableColumn, registerTableColumn } from './el-dm-table-column';

registerTableColumn();

describe('ElDmTableColumn', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined as custom element', () => {
    expect(customElements.get('el-dm-table-column')).toBe(ElDmTableColumn);
  });

  test('creates shadow root', () => {
    const el = document.createElement('el-dm-table-column') as ElDmTableColumn;
    container.appendChild(el);
    expect(el.shadowRoot).toBeDefined();
  });

  test('renders a slot', () => {
    const el = document.createElement('el-dm-table-column') as ElDmTableColumn;
    container.appendChild(el);
    const slot = el.shadowRoot?.querySelector('slot');
    expect(slot).toBeDefined();
  });

  test('reflects key attribute', () => {
    const el = document.createElement('el-dm-table-column') as ElDmTableColumn;
    el.key = 'name';
    container.appendChild(el);
    expect(el.getAttribute('key')).toBe('name');
  });

  test('reflects label attribute', () => {
    const el = document.createElement('el-dm-table-column') as ElDmTableColumn;
    el.label = 'Full Name';
    container.appendChild(el);
    expect(el.getAttribute('label')).toBe('Full Name');
  });

  test('reflects sortable attribute', () => {
    const el = document.createElement('el-dm-table-column') as ElDmTableColumn;
    el.sortable = true;
    container.appendChild(el);
    expect(el.hasAttribute('sortable')).toBe(true);
  });

  test('reflects width attribute', () => {
    const el = document.createElement('el-dm-table-column') as ElDmTableColumn;
    el.width = '200px';
    container.appendChild(el);
    expect(el.getAttribute('width')).toBe('200px');
  });

  test('reflects align attribute with default left', () => {
    const el = document.createElement('el-dm-table-column') as ElDmTableColumn;
    container.appendChild(el);
    expect(el.align).toBe('left');
  });

  test('reflects hidden attribute', () => {
    const el = document.createElement('el-dm-table-column') as ElDmTableColumn;
    el.hidden = true;
    container.appendChild(el);
    expect(el.hasAttribute('hidden')).toBe(true);
  });

  test('toColumnDef returns correct structure', () => {
    const el = document.createElement('el-dm-table-column') as ElDmTableColumn;
    el.key = 'age';
    el.label = 'Age';
    el.sortable = true;
    el.width = '100px';
    el.align = 'right';
    container.appendChild(el);

    const def = el.toColumnDef();
    expect(def.key).toBe('age');
    expect(def.label).toBe('Age');
    expect(def.sortable).toBe(true);
    expect(def.width).toBe('100px');
    expect(def.align).toBe('right');
    expect(def.hidden).toBe(false);
  });

  test('toColumnDef falls back to key for label', () => {
    const el = document.createElement('el-dm-table-column') as ElDmTableColumn;
    el.key = 'username';
    container.appendChild(el);

    const def = el.toColumnDef();
    expect(def.label).toBe('username');
  });

  test('toColumnDef returns empty string label when no key or label', () => {
    const el = document.createElement('el-dm-table-column') as ElDmTableColumn;
    container.appendChild(el);

    const def = el.toColumnDef();
    expect(def.label).toBe('');
  });

  test('dispatches table-column-change on connect', () => {
    const el = document.createElement('el-dm-table-column') as ElDmTableColumn;
    let eventFired = false;

    container.addEventListener('table-column-change', () => {
      eventFired = true;
    });

    container.appendChild(el);
    expect(eventFired).toBe(true);
  });

  test('dispatches table-column-change on disconnect', () => {
    const el = document.createElement('el-dm-table-column') as ElDmTableColumn;
    container.appendChild(el);

    let eventFired = false;
    // Listen on the element itself since disconnectedCallback fires
    // after the element is removed from the tree
    el.addEventListener('table-column-change', () => {
      eventFired = true;
    });

    el.remove();
    expect(eventFired).toBe(true);
  });

  test('registerTableColumn is idempotent', () => {
    registerTableColumn();
    registerTableColumn();
    expect(customElements.get('el-dm-table-column')).toBe(ElDmTableColumn);
  });
});
