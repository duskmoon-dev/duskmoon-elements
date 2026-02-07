import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { ColumnMenu, type ColumnMenuAction } from '../../src/core/column-menu.js';
import type { ColumnDef } from '../../src/types.js';

describe('ColumnMenu', () => {
  it('starts closed', () => {
    const menu = new ColumnMenu();
    expect(menu.isOpen).toBe(false);
  });

  it('reports open after open()', () => {
    const menu = new ColumnMenu();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });

    const config = {
      field: 'name',
      column: { field: 'name', header: 'Name', type: 'text' } as ColumnDef,
      anchorRect: {
        x: 0,
        y: 48,
        width: 150,
        height: 48,
        top: 48,
        right: 150,
        bottom: 96,
        left: 0,
      } as DOMRect,
      allColumns: [
        { field: 'name', header: 'Name', type: 'text' } as ColumnDef,
        { field: 'age', header: 'Age', type: 'number' } as ColumnDef,
      ],
    };

    menu.open(
      shadowRoot,
      config,
      () => {},
      () => {},
    );
    expect(menu.isOpen).toBe(true);

    menu.close();
    expect(menu.isOpen).toBe(false);
  });

  it('renders menu items into shadow root', () => {
    const menu = new ColumnMenu();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });

    const config = {
      field: 'name',
      column: { field: 'name', header: 'Name', type: 'text', sortable: true } as ColumnDef,
      anchorRect: {
        x: 0,
        y: 48,
        width: 150,
        height: 48,
        top: 48,
        right: 150,
        bottom: 96,
        left: 0,
      } as DOMRect,
      allColumns: [{ field: 'name', header: 'Name', type: 'text' } as ColumnDef],
    };

    menu.open(
      shadowRoot,
      config,
      () => {},
      () => {},
    );

    const menuEl = shadowRoot.querySelector('.grid-column-menu');
    expect(menuEl).not.toBeNull();

    // Should contain sort items
    const sortAsc = menuEl!.querySelector('[data-action="sort-asc"]');
    expect(sortAsc).not.toBeNull();

    const sortDesc = menuEl!.querySelector('[data-action="sort-desc"]');
    expect(sortDesc).not.toBeNull();

    menu.close();
  });

  it('renders filter input for filterable columns', () => {
    const menu = new ColumnMenu();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });

    const config = {
      field: 'name',
      column: { field: 'name', header: 'Name', type: 'text' } as ColumnDef,
      anchorRect: {
        x: 0,
        y: 48,
        width: 150,
        height: 48,
        top: 48,
        right: 150,
        bottom: 96,
        left: 0,
      } as DOMRect,
      allColumns: [],
    };

    menu.open(
      shadowRoot,
      config,
      () => {},
      () => {},
    );

    const filterInput = shadowRoot.querySelector('.grid-column-menu-filter-input');
    expect(filterInput).not.toBeNull();

    menu.close();
  });

  it('does not render filter for filterable=false columns', () => {
    const menu = new ColumnMenu();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });

    const config = {
      field: 'name',
      column: { field: 'name', header: 'Name', type: 'text', filterable: false } as ColumnDef,
      anchorRect: {
        x: 0,
        y: 48,
        width: 150,
        height: 48,
        top: 48,
        right: 150,
        bottom: 96,
        left: 0,
      } as DOMRect,
      allColumns: [],
    };

    menu.open(
      shadowRoot,
      config,
      () => {},
      () => {},
    );

    const filterInput = shadowRoot.querySelector('.grid-column-menu-filter-input');
    expect(filterInput).toBeNull();

    menu.close();
  });

  it('does not render hide for lockVisible columns', () => {
    const menu = new ColumnMenu();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });

    const config = {
      field: 'name',
      column: { field: 'name', header: 'Name', type: 'text', lockVisible: true } as ColumnDef,
      anchorRect: {
        x: 0,
        y: 48,
        width: 150,
        height: 48,
        top: 48,
        right: 150,
        bottom: 96,
        left: 0,
      } as DOMRect,
      allColumns: [],
    };

    menu.open(
      shadowRoot,
      config,
      () => {},
      () => {},
    );

    const hideBtn = shadowRoot.querySelector('[data-action="hide-column"]');
    expect(hideBtn).toBeNull();

    menu.close();
  });

  it('renders column checkboxes for all columns', () => {
    const menu = new ColumnMenu();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });

    const allColumns: ColumnDef[] = [
      { field: 'name', header: 'Name', type: 'text' },
      { field: 'age', header: 'Age', type: 'number' },
      { field: 'email', header: 'Email', type: 'text', hidden: true },
    ];

    const config = {
      field: 'name',
      column: allColumns[0],
      anchorRect: {
        x: 0,
        y: 48,
        width: 150,
        height: 48,
        top: 48,
        right: 150,
        bottom: 96,
        left: 0,
      } as DOMRect,
      allColumns,
    };

    menu.open(
      shadowRoot,
      config,
      () => {},
      () => {},
    );

    const checkboxes = shadowRoot.querySelectorAll('[data-action="toggle-column"]');
    expect(checkboxes.length).toBe(3);

    // Email should be unchecked (hidden)
    const emailCheckbox = shadowRoot.querySelector(
      '[data-target-field="email"]',
    ) as HTMLInputElement;
    expect(emailCheckbox?.checked).toBe(false);

    // Name should be checked
    const nameCheckbox = shadowRoot.querySelector('[data-target-field="name"]') as HTMLInputElement;
    expect(nameCheckbox?.checked).toBe(true);

    menu.close();
  });

  it('close removes menu from DOM', () => {
    const menu = new ColumnMenu();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });

    const config = {
      field: 'name',
      column: { field: 'name', header: 'Name', type: 'text' } as ColumnDef,
      anchorRect: {
        x: 0,
        y: 48,
        width: 150,
        height: 48,
        top: 48,
        right: 150,
        bottom: 96,
        left: 0,
      } as DOMRect,
      allColumns: [],
    };

    menu.open(
      shadowRoot,
      config,
      () => {},
      () => {},
    );
    expect(shadowRoot.querySelector('.grid-column-menu')).not.toBeNull();

    menu.close();
    expect(shadowRoot.querySelector('.grid-column-menu')).toBeNull();
  });

  it('opening a new menu closes the previous one', () => {
    const menu = new ColumnMenu();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });

    const config1 = {
      field: 'name',
      column: { field: 'name', header: 'Name', type: 'text' } as ColumnDef,
      anchorRect: {
        x: 0,
        y: 48,
        width: 150,
        height: 48,
        top: 48,
        right: 150,
        bottom: 96,
        left: 0,
      } as DOMRect,
      allColumns: [],
    };

    const config2 = {
      field: 'age',
      column: { field: 'age', header: 'Age', type: 'number' } as ColumnDef,
      anchorRect: {
        x: 150,
        y: 48,
        width: 150,
        height: 48,
        top: 48,
        right: 300,
        bottom: 96,
        left: 150,
      } as DOMRect,
      allColumns: [],
    };

    menu.open(
      shadowRoot,
      config1,
      () => {},
      () => {},
    );
    menu.open(
      shadowRoot,
      config2,
      () => {},
      () => {},
    );

    // Only one menu should exist
    const menus = shadowRoot.querySelectorAll('.grid-column-menu');
    expect(menus.length).toBe(1);

    menu.close();
  });
});
