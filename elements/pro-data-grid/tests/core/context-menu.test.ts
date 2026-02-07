import { describe, it, expect } from 'bun:test';
import { ContextMenu } from '../../src/core/context-menu.js';

describe('ContextMenu', () => {
  it('starts closed', () => {
    const menu = new ContextMenu();
    expect(menu.isOpen).toBe(false);
  });

  it('opens at position with default items', () => {
    const menu = new ContextMenu();
    menu.open(100, 200);

    expect(menu.isOpen).toBe(true);
    expect(menu.state.x).toBe(100);
    expect(menu.state.y).toBe(200);
    expect(menu.state.items.length).toBeGreaterThan(0);
  });

  it('closes the menu', () => {
    const menu = new ContextMenu();
    menu.open(50, 50);
    menu.close();

    expect(menu.isOpen).toBe(false);
    expect(menu.state.items.length).toBe(0);
  });

  it('getDefaultItems returns expected items', () => {
    const menu = new ContextMenu();
    const items = menu.getDefaultItems();

    const names = items.map((i) => i.name);
    expect(names).toContain('copy');
    expect(names).toContain('paste');
    expect(names).toContain('export');
  });

  it('default items include separators', () => {
    const menu = new ContextMenu();
    const items = menu.getDefaultItems();
    const separators = items.filter((i) => i.separator);
    expect(separators.length).toBeGreaterThan(0);
  });

  it('export item has sub-menu', () => {
    const menu = new ContextMenu();
    const items = menu.getDefaultItems();
    const exportItem = items.find((i) => i.name === 'export');
    expect(exportItem?.subMenu).toBeDefined();
    expect(exportItem!.subMenu!.length).toBe(3);
  });

  describe('custom items', () => {
    it('adds custom items after defaults', () => {
      const menu = new ContextMenu();
      menu.configure({
        items: [{ name: 'custom', label: 'Custom Action', action: () => {} }],
      });
      menu.open(0, 0);

      const names = menu.state.items.map((i) => i.name);
      expect(names).toContain('copy');
      expect(names).toContain('custom');
    });

    it('suppressDefaultItems shows only custom items', () => {
      const menu = new ContextMenu();
      menu.configure({
        suppressDefaultItems: true,
        items: [{ name: 'myAction', label: 'My Action', action: () => {} }],
      });
      menu.open(0, 0);

      expect(menu.state.items.length).toBe(1);
      expect(menu.state.items[0].name).toBe('myAction');
    });
  });

  describe('executeItem', () => {
    it('executes an item action and closes', () => {
      let called = false;
      const menu = new ContextMenu();
      menu.configure({
        items: [{ name: 'test', label: 'Test', action: () => { called = true; } }],
      });
      menu.open(0, 0);

      const result = menu.executeItem('test');
      expect(result).toBe(true);
      expect(called).toBe(true);
      expect(menu.isOpen).toBe(false);
    });

    it('returns false for items without action', () => {
      const menu = new ContextMenu();
      menu.open(0, 0);
      const result = menu.executeItem('copy'); // default copy has no action
      expect(result).toBe(false);
    });

    it('returns false for non-existent item', () => {
      const menu = new ContextMenu();
      menu.open(0, 0);
      expect(menu.executeItem('nonexistent')).toBe(false);
    });

    it('does not execute disabled items', () => {
      let called = false;
      const menu = new ContextMenu();
      menu.configure({
        items: [
          { name: 'disabled', label: 'Disabled', disabled: true, action: () => { called = true; } },
        ],
      });
      menu.open(0, 0);

      const result = menu.executeItem('disabled');
      expect(result).toBe(false);
      expect(called).toBe(false);
    });

    it('respects disabled function', () => {
      const menu = new ContextMenu();
      let isDisabled = true;
      menu.configure({
        items: [
          { name: 'dynamic', label: 'Dynamic', disabled: () => isDisabled, action: () => {} },
        ],
      });
      menu.open(0, 0);

      expect(menu.isItemDisabled('dynamic')).toBe(true);

      isDisabled = false;
      expect(menu.isItemDisabled('dynamic')).toBe(false);
    });

    it('finds items in sub-menus', () => {
      let called = false;
      const menu = new ContextMenu();
      menu.configure({
        suppressDefaultItems: true,
        items: [
          {
            name: 'parent',
            label: 'Parent',
            subMenu: [
              { name: 'child', label: 'Child', action: () => { called = true; } },
            ],
          },
        ],
      });
      menu.open(0, 0);

      const result = menu.executeItem('child');
      expect(result).toBe(true);
      expect(called).toBe(true);
    });
  });

  describe('render', () => {
    it('returns empty when closed', () => {
      const menu = new ContextMenu();
      expect(menu.render()).toBe('');
    });

    it('renders context menu HTML when open', () => {
      const menu = new ContextMenu();
      menu.open(100, 200);
      const html = menu.render();

      expect(html).toContain('grid-context-menu');
      expect(html).toContain('left:100px');
      expect(html).toContain('top:200px');
      expect(html).toContain('Copy');
    });

    it('renders separators', () => {
      const menu = new ContextMenu();
      menu.open(0, 0);
      const html = menu.render();
      expect(html).toContain('context-menu-separator');
    });

    it('renders keyboard shortcuts', () => {
      const menu = new ContextMenu();
      menu.open(0, 0);
      const html = menu.render();
      expect(html).toContain('Ctrl+C');
    });

    it('renders sub-menu arrow', () => {
      const menu = new ContextMenu();
      menu.open(0, 0);
      const html = menu.render();
      expect(html).toContain('context-menu-arrow');
      expect(html).toContain('context-menu-submenu');
    });
  });
});
