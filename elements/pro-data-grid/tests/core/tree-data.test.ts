import { describe, it, expect } from 'bun:test';
import { TreeData } from '../../src/core/tree-data.js';
import type { Row } from '../../src/types.js';

describe('TreeData', () => {
  // ─── Children-based tree data ──────────────

  const nestedRows: Row[] = [
    {
      id: '1',
      name: 'USA',
      children: [
        {
          id: '1-1',
          name: 'California',
          children: [
            { id: '1-1-1', name: 'Los Angeles' },
            { id: '1-1-2', name: 'San Francisco' },
          ],
        },
        {
          id: '1-2',
          name: 'Texas',
          children: [{ id: '1-2-1', name: 'Houston' }],
        },
      ],
    },
    {
      id: '2',
      name: 'UK',
      children: [{ id: '2-1', name: 'London' }],
    },
  ];

  describe('children-based tree', () => {
    it('builds tree from nested children', () => {
      const tree = new TreeData();
      const display = tree.buildTree(nestedRows);
      // All collapsed by default (depth=0): USA, UK
      expect(display.length).toBe(2);
      expect(display[0].data.name).toBe('USA');
      expect(display[0].hasChildren).toBe(true);
      expect(display[0].level).toBe(0);
    });

    it('expands with defaultExpanded=-1', () => {
      const tree = new TreeData();
      tree.defaultExpanded = -1;
      const display = tree.buildTree(nestedRows);
      // USA, California, LA, SF, Texas, Houston, UK, London = 8
      expect(display.length).toBe(8);
    });

    it('expands with defaultExpanded=1', () => {
      const tree = new TreeData();
      tree.defaultExpanded = 1;
      const display = tree.buildTree(nestedRows);
      // USA (expanded), California, Texas, UK (expanded), London = 5
      expect(display.length).toBe(5);
    });

    it('tracks leaf counts', () => {
      const tree = new TreeData();
      tree.defaultExpanded = -1;
      tree.buildTree(nestedRows);
      const usa = tree.rootNodes[0];
      expect(usa.leafCount).toBe(3); // LA, SF, Houston
      const ca = usa.children[0];
      expect(ca.leafCount).toBe(2); // LA, SF
    });

    it('expand/collapse node', () => {
      const tree = new TreeData();
      tree.buildTree(nestedRows);

      tree.expandNode('1'); // USA
      expect(tree.displayList.length).toBe(4); // USA, CA, TX, UK

      tree.collapseNode('1');
      expect(tree.displayList.length).toBe(2); // USA, UK
    });

    it('toggleNode returns new state', () => {
      const tree = new TreeData();
      tree.buildTree(nestedRows);

      const expanded = tree.toggleNode('1');
      expect(expanded).toBe(true);
      expect(tree.isExpanded('1')).toBe(true);

      const collapsed = tree.toggleNode('1');
      expect(collapsed).toBe(false);
      expect(tree.isExpanded('1')).toBe(false);
    });
  });

  // ─── Path-based tree data ──────────────────

  describe('path-based tree', () => {
    const flatRows: Row[] = [
      { id: 'la', name: 'Los Angeles', country: 'USA', state: 'CA' },
      { id: 'sf', name: 'San Francisco', country: 'USA', state: 'CA' },
      { id: 'hou', name: 'Houston', country: 'USA', state: 'TX' },
      { id: 'lon', name: 'London', country: 'UK', state: 'England' },
    ];

    it('builds tree from data paths', () => {
      const tree = new TreeData();
      tree.getDataPath = (row: Row) => [
        row.country as string,
        row.state as string,
        row.name as string,
      ];
      const display = tree.buildTree(flatRows);
      // Collapsed: USA, UK = 2 root nodes
      expect(display.length).toBe(2);
      expect(display[0].id).toBe('USA');
    });

    it('expands path-based tree', () => {
      const tree = new TreeData();
      tree.getDataPath = (row: Row) => [
        row.country as string,
        row.state as string,
        row.name as string,
      ];
      tree.defaultExpanded = -1;
      const display = tree.buildTree(flatRows);
      // USA, CA, LA, SF, TX, Houston, UK, England, London = 9
      expect(display.length).toBe(9);
    });

    it('intermediate nodes have hasChildren=true', () => {
      const tree = new TreeData();
      tree.getDataPath = (row: Row) => [row.country as string, row.name as string];
      tree.defaultExpanded = -1;
      tree.buildTree(flatRows);

      const usa = tree.rootNodes[0];
      expect(usa.hasChildren).toBe(true);
      expect(usa.children.length).toBe(3); // LA, SF, Houston
    });
  });

  // ─── expandAll / collapseAll ───────────────

  describe('expandAll / collapseAll', () => {
    it('expandAll(-1) expands everything', () => {
      const tree = new TreeData();
      tree.buildTree(nestedRows);
      tree.expandAll(-1);
      expect(tree.displayList.length).toBe(8);
    });

    it('collapseAll collapses everything', () => {
      const tree = new TreeData();
      tree.defaultExpanded = -1;
      tree.buildTree(nestedRows);
      tree.collapseAll();
      expect(tree.displayList.length).toBe(2);
    });

    it('expandAll(1) expands to depth 1', () => {
      const tree = new TreeData();
      tree.buildTree(nestedRows);
      tree.expandAll(1);
      expect(tree.displayList.length).toBe(5); // USA, CA, TX, UK, London
    });
  });

  // ─── Filtering ─────────────────────────────

  describe('filterTree', () => {
    it('keeps parents of matching children', () => {
      const tree = new TreeData();
      tree.defaultExpanded = -1;
      tree.buildTree(nestedRows);

      const filtered = tree.filterTree((row) => row.name === 'Los Angeles');
      // USA > California > Los Angeles = 3
      expect(filtered.length).toBe(3);
      expect(filtered[0].data.name).toBe('USA');
      expect(filtered[1].data.name).toBe('California');
      expect(filtered[2].data.name).toBe('Los Angeles');
    });

    it('returns empty when no match', () => {
      const tree = new TreeData();
      tree.defaultExpanded = -1;
      tree.buildTree(nestedRows);

      const filtered = tree.filterTree(() => false);
      expect(filtered.length).toBe(0);
    });
  });

  // ─── Sorting ───────────────────────────────

  describe('sortTree', () => {
    it('sorts children at each level', () => {
      const tree = new TreeData();
      tree.defaultExpanded = -1;
      tree.buildTree(nestedRows);

      tree.sortTree((a, b) => {
        const nameA = String(a.name ?? '');
        const nameB = String(b.name ?? '');
        return nameA.localeCompare(nameB);
      });

      const display = tree.displayList;
      // UK before USA at root level (alphabetical)
      expect(display[0].data.name).toBe('UK');
    });
  });

  // ─── Clear ─────────────────────────────────

  it('clear resets all state', () => {
    const tree = new TreeData();
    tree.buildTree(nestedRows);
    tree.expandNode('1');

    tree.clear();
    expect(tree.rootNodes.length).toBe(0);
    expect(tree.displayList.length).toBe(0);
  });

  // ─── Custom child field ────────────────────

  it('supports custom child field name', () => {
    const customRows: Row[] = [
      {
        id: '1',
        name: 'Root',
        items: [
          { id: '1-1', name: 'Child1', items: [] },
          { id: '1-2', name: 'Child2', items: [] },
        ],
      },
    ];
    const tree = new TreeData();
    tree.childField = 'items';
    tree.defaultExpanded = -1;
    const display = tree.buildTree(customRows);
    expect(display.length).toBe(3);
  });
});
