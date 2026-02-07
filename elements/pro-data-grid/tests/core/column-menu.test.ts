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

  it('dispatches sort-asc action on click', () => {
    const menu = new ColumnMenu();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const actions: ColumnMenuAction[] = [];

    const config = {
      field: 'name',
      column: { field: 'name', header: 'Name', type: 'text' } as ColumnDef,
      anchorRect: { x: 0, y: 0, width: 150, height: 48, top: 0, right: 150, bottom: 48, left: 0 } as DOMRect,
      allColumns: [],
    };

    menu.open(shadowRoot, config, (a) => actions.push(a), () => {});

    const sortAsc = shadowRoot.querySelector('[data-action="sort-asc"]') as HTMLElement;
    sortAsc.click();

    expect(actions.length).toBe(1);
    expect(actions[0].type).toBe('sort-asc');
    expect(actions[0].field).toBe('name');
    expect(menu.isOpen).toBe(false);
  });

  it('dispatches sort-desc action on click', () => {
    const menu = new ColumnMenu();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const actions: ColumnMenuAction[] = [];

    const config = {
      field: 'age',
      column: { field: 'age', header: 'Age', type: 'number' } as ColumnDef,
      anchorRect: { x: 0, y: 0, width: 150, height: 48, top: 0, right: 150, bottom: 48, left: 0 } as DOMRect,
      allColumns: [],
    };

    menu.open(shadowRoot, config, (a) => actions.push(a), () => {});

    const sortDesc = shadowRoot.querySelector('[data-action="sort-desc"]') as HTMLElement;
    sortDesc.click();

    expect(actions[0].type).toBe('sort-desc');
    expect(actions[0].field).toBe('age');
  });

  it('dispatches clear-sort action on click', () => {
    const menu = new ColumnMenu();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const actions: ColumnMenuAction[] = [];

    const config = {
      field: 'name',
      column: { field: 'name', header: 'Name', type: 'text' } as ColumnDef,
      anchorRect: { x: 0, y: 0, width: 150, height: 48, top: 0, right: 150, bottom: 48, left: 0 } as DOMRect,
      allColumns: [],
    };

    menu.open(shadowRoot, config, (a) => actions.push(a), () => {});

    const clearSort = shadowRoot.querySelector('[data-action="clear-sort"]') as HTMLElement;
    clearSort.click();

    expect(actions[0].type).toBe('clear-sort');
  });

  it('dispatches hide-column action on click', () => {
    const menu = new ColumnMenu();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const actions: ColumnMenuAction[] = [];

    const config = {
      field: 'name',
      column: { field: 'name', header: 'Name', type: 'text' } as ColumnDef,
      anchorRect: { x: 0, y: 0, width: 150, height: 48, top: 0, right: 150, bottom: 48, left: 0 } as DOMRect,
      allColumns: [],
    };

    menu.open(shadowRoot, config, (a) => actions.push(a), () => {});

    const hideBtn = shadowRoot.querySelector('[data-action="hide-column"]') as HTMLElement;
    hideBtn.click();

    expect(actions[0].type).toBe('hide-column');
  });

  it('dispatches auto-size action on click', () => {
    const menu = new ColumnMenu();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const actions: ColumnMenuAction[] = [];

    const config = {
      field: 'name',
      column: { field: 'name', header: 'Name', type: 'text' } as ColumnDef,
      anchorRect: { x: 0, y: 0, width: 150, height: 48, top: 0, right: 150, bottom: 48, left: 0 } as DOMRect,
      allColumns: [],
    };

    menu.open(shadowRoot, config, (a) => actions.push(a), () => {});

    const autoSize = shadowRoot.querySelector('[data-action="auto-size"]') as HTMLElement;
    autoSize.click();

    expect(actions[0].type).toBe('auto-size');
  });

  it('dispatches pin-left action on click', () => {
    const menu = new ColumnMenu();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const actions: ColumnMenuAction[] = [];

    const config = {
      field: 'name',
      column: { field: 'name', header: 'Name', type: 'text' } as ColumnDef,
      anchorRect: { x: 0, y: 0, width: 150, height: 48, top: 0, right: 150, bottom: 48, left: 0 } as DOMRect,
      allColumns: [],
    };

    menu.open(shadowRoot, config, (a) => actions.push(a), () => {});

    const pinLeft = shadowRoot.querySelector('[data-action="pin-left"]') as HTMLElement;
    pinLeft.click();

    expect(actions[0].type).toBe('pin-left');
  });

  it('dispatches pin-right action on click', () => {
    const menu = new ColumnMenu();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const actions: ColumnMenuAction[] = [];

    const config = {
      field: 'name',
      column: { field: 'name', header: 'Name', type: 'text' } as ColumnDef,
      anchorRect: { x: 0, y: 0, width: 150, height: 48, top: 0, right: 150, bottom: 48, left: 0 } as DOMRect,
      allColumns: [],
    };

    menu.open(shadowRoot, config, (a) => actions.push(a), () => {});

    const pinRight = shadowRoot.querySelector('[data-action="pin-right"]') as HTMLElement;
    pinRight.click();

    expect(actions[0].type).toBe('pin-right');
  });

  it('dispatches unpin action on click', () => {
    const menu = new ColumnMenu();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const actions: ColumnMenuAction[] = [];

    const config = {
      field: 'name',
      column: { field: 'name', header: 'Name', type: 'text' } as ColumnDef,
      anchorRect: { x: 0, y: 0, width: 150, height: 48, top: 0, right: 150, bottom: 48, left: 0 } as DOMRect,
      allColumns: [],
    };

    menu.open(shadowRoot, config, (a) => actions.push(a), () => {});

    const unpin = shadowRoot.querySelector('[data-action="unpin"]') as HTMLElement;
    unpin.click();

    expect(actions[0].type).toBe('unpin');
  });

  it('dispatches apply-filter with value from input', () => {
    const menu = new ColumnMenu();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const actions: ColumnMenuAction[] = [];

    const config = {
      field: 'name',
      column: { field: 'name', header: 'Name', type: 'text' } as ColumnDef,
      anchorRect: { x: 0, y: 0, width: 150, height: 48, top: 0, right: 150, bottom: 48, left: 0 } as DOMRect,
      allColumns: [],
    };

    menu.open(shadowRoot, config, (a) => actions.push(a), () => {});

    const filterInput = shadowRoot.querySelector('.grid-column-menu-filter-input') as HTMLInputElement;
    filterInput.value = 'Alice';

    const applyBtn = shadowRoot.querySelector('[data-action="apply-filter"]') as HTMLElement;
    applyBtn.click();

    expect(actions.length).toBe(1);
    expect(actions[0].type).toBe('apply-filter');
    expect(actions[0].filterModel).toEqual({
      type: 'text',
      operator: 'contains',
      value: 'Alice',
    });
  });

  it('does not dispatch apply-filter with empty input', () => {
    const menu = new ColumnMenu();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const actions: ColumnMenuAction[] = [];

    const config = {
      field: 'name',
      column: { field: 'name', header: 'Name', type: 'text' } as ColumnDef,
      anchorRect: { x: 0, y: 0, width: 150, height: 48, top: 0, right: 150, bottom: 48, left: 0 } as DOMRect,
      allColumns: [],
    };

    menu.open(shadowRoot, config, (a) => actions.push(a), () => {});

    const applyBtn = shadowRoot.querySelector('[data-action="apply-filter"]') as HTMLElement;
    applyBtn.click();

    expect(actions.length).toBe(0);
  });

  it('dispatches clear-filter action on click', () => {
    const menu = new ColumnMenu();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const actions: ColumnMenuAction[] = [];

    const config = {
      field: 'name',
      column: { field: 'name', header: 'Name', type: 'text' } as ColumnDef,
      anchorRect: { x: 0, y: 0, width: 150, height: 48, top: 0, right: 150, bottom: 48, left: 0 } as DOMRect,
      allColumns: [],
    };

    menu.open(shadowRoot, config, (a) => actions.push(a), () => {});

    const clearFilter = shadowRoot.querySelector('[data-action="clear-filter"]') as HTMLElement;
    clearFilter.click();

    expect(actions[0].type).toBe('clear-filter');
  });

  it('dispatches toggle-column via checkbox change', () => {
    const menu = new ColumnMenu();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const actions: ColumnMenuAction[] = [];

    const allColumns: ColumnDef[] = [
      { field: 'name', header: 'Name', type: 'text' },
      { field: 'age', header: 'Age', type: 'number' },
    ];

    const config = {
      field: 'name',
      column: allColumns[0],
      anchorRect: { x: 0, y: 0, width: 150, height: 48, top: 0, right: 150, bottom: 48, left: 0 } as DOMRect,
      allColumns,
    };

    menu.open(shadowRoot, config, (a) => actions.push(a), () => {});

    const ageCheckbox = shadowRoot.querySelector('[data-target-field="age"]') as HTMLInputElement;
    ageCheckbox.checked = false;
    ageCheckbox.dispatchEvent(new Event('change', { bubbles: true }));

    expect(actions.length).toBe(1);
    expect(actions[0].type).toBe('toggle-column');
    expect(actions[0].targetField).toBe('age');
    expect(actions[0].visible).toBe(false);

    menu.close();
  });

  it('calls onClose callback when closing', () => {
    const menu = new ColumnMenu();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });
    let closeCalled = false;

    const config = {
      field: 'name',
      column: { field: 'name', header: 'Name', type: 'text' } as ColumnDef,
      anchorRect: { x: 0, y: 0, width: 150, height: 48, top: 0, right: 150, bottom: 48, left: 0 } as DOMRect,
      allColumns: [],
    };

    menu.open(shadowRoot, config, () => {}, () => { closeCalled = true; });
    menu.close();

    expect(closeCalled).toBe(true);
  });

  it('positions menu at anchor bottom-left', () => {
    const menu = new ColumnMenu();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });

    const config = {
      field: 'name',
      column: { field: 'name', header: 'Name', type: 'text' } as ColumnDef,
      anchorRect: { x: 10, y: 20, width: 150, height: 48, top: 20, right: 160, bottom: 68, left: 10 } as DOMRect,
      allColumns: [],
    };

    menu.open(shadowRoot, config, () => {}, () => {});

    const menuEl = shadowRoot.querySelector('.grid-column-menu') as HTMLElement;
    expect(menuEl.style.top).toBe('68px');
    expect(menuEl.style.left).toBe('10px');

    menu.close();
  });

  it('escapes HTML in column headers', () => {
    const menu = new ColumnMenu();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });

    const allColumns: ColumnDef[] = [
      { field: 'xss', header: '<script>alert(1)</script>', type: 'text' },
    ];

    const config = {
      field: 'xss',
      column: allColumns[0],
      anchorRect: { x: 0, y: 0, width: 150, height: 48, top: 0, right: 150, bottom: 48, left: 0 } as DOMRect,
      allColumns,
    };

    menu.open(shadowRoot, config, () => {}, () => {});

    // Column labels in the toggle section are escaped via #escapeHtml
    const columnItem = shadowRoot.querySelector('.grid-column-menu-column-item');
    expect(columnItem?.innerHTML).toContain('&lt;script&gt;');
    expect(columnItem?.innerHTML).toContain('&lt;/script&gt;');

    menu.close();
  });

  it('does not render sort items when sortable=false', () => {
    const menu = new ColumnMenu();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });

    const config = {
      field: 'name',
      column: { field: 'name', header: 'Name', type: 'text', sortable: false } as ColumnDef,
      anchorRect: { x: 0, y: 0, width: 150, height: 48, top: 0, right: 150, bottom: 48, left: 0 } as DOMRect,
      allColumns: [],
    };

    menu.open(shadowRoot, config, () => {}, () => {});

    expect(shadowRoot.querySelector('[data-action="sort-asc"]')).toBeNull();
    expect(shadowRoot.querySelector('[data-action="sort-desc"]')).toBeNull();
    expect(shadowRoot.querySelector('[data-action="clear-sort"]')).toBeNull();

    menu.close();
  });

  it('disables checkbox for lockVisible columns', () => {
    const menu = new ColumnMenu();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });

    const allColumns: ColumnDef[] = [
      { field: 'id', header: 'ID', type: 'text', lockVisible: true },
      { field: 'name', header: 'Name', type: 'text' },
    ];

    const config = {
      field: 'id',
      column: allColumns[0],
      anchorRect: { x: 0, y: 0, width: 150, height: 48, top: 0, right: 150, bottom: 48, left: 0 } as DOMRect,
      allColumns,
    };

    menu.open(shadowRoot, config, () => {}, () => {});

    const idCheckbox = shadowRoot.querySelector('[data-target-field="id"]') as HTMLInputElement;
    expect(idCheckbox.disabled).toBe(true);

    const nameCheckbox = shadowRoot.querySelector('[data-target-field="name"]') as HTMLInputElement;
    expect(nameCheckbox.disabled).toBe(false);

    menu.close();
  });

  it('close is safe to call when not open', () => {
    const menu = new ColumnMenu();
    menu.close();
    expect(menu.isOpen).toBe(false);
  });

  it('has role=menu and aria-label', () => {
    const menu = new ColumnMenu();
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });

    const config = {
      field: 'name',
      column: { field: 'name', header: 'Name', type: 'text' } as ColumnDef,
      anchorRect: { x: 0, y: 0, width: 150, height: 48, top: 0, right: 150, bottom: 48, left: 0 } as DOMRect,
      allColumns: [],
    };

    menu.open(shadowRoot, config, () => {}, () => {});

    const menuEl = shadowRoot.querySelector('.grid-column-menu')!;
    expect(menuEl.getAttribute('role')).toBe('menu');
    expect(menuEl.getAttribute('aria-label')).toBe('Column menu: Name');

    menu.close();
  });
});
