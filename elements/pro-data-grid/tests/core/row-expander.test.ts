import { describe, it, expect } from 'bun:test';
import { RowExpander } from '../../src/core/row-expander.js';
import type { Row } from '../../src/types.js';

describe('RowExpander', () => {
  const rows: Row[] = [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
    { id: '3', name: 'Charlie' },
  ];

  it('starts with no expanded rows', () => {
    const exp = new RowExpander();
    expect(exp.expandedIds.length).toBe(0);
    expect(exp.getExpandedCount()).toBe(0);
  });

  it('expands a row', () => {
    const exp = new RowExpander();
    const changed = exp.expandRow(rows[0]);
    expect(changed).toBe(true);
    expect(exp.isExpanded(rows[0])).toBe(true);
    expect(exp.expandedIds).toEqual(['1']);
  });

  it('does not expand already expanded row', () => {
    const exp = new RowExpander();
    exp.expandRow(rows[0]);
    const changed = exp.expandRow(rows[0]);
    expect(changed).toBe(false);
  });

  it('collapses a row', () => {
    const exp = new RowExpander();
    exp.expandRow(rows[0]);
    const changed = exp.collapseRow(rows[0]);
    expect(changed).toBe(true);
    expect(exp.isExpanded(rows[0])).toBe(false);
  });

  it('does not collapse already collapsed row', () => {
    const exp = new RowExpander();
    const changed = exp.collapseRow(rows[0]);
    expect(changed).toBe(false);
  });

  it('toggleRow works', () => {
    const exp = new RowExpander();
    const expanded = exp.toggleRow(rows[0]);
    expect(expanded).toBe(true);
    expect(exp.isExpanded(rows[0])).toBe(true);

    const collapsed = exp.toggleRow(rows[0]);
    expect(collapsed).toBe(false);
    expect(exp.isExpanded(rows[0])).toBe(false);
  });

  describe('multiple mode', () => {
    it('allows multiple expanded rows', () => {
      const exp = new RowExpander({ multiple: true });
      exp.expandRow(rows[0]);
      exp.expandRow(rows[1]);
      expect(exp.getExpandedCount()).toBe(2);
    });
  });

  describe('accordion mode', () => {
    it('collapses others when expanding new row', () => {
      const exp = new RowExpander({ multiple: false });
      exp.expandRow(rows[0]);
      exp.expandRow(rows[1]);
      expect(exp.getExpandedCount()).toBe(1);
      expect(exp.isExpanded(rows[0])).toBe(false);
      expect(exp.isExpanded(rows[1])).toBe(true);
    });
  });

  describe('isExpandable predicate', () => {
    it('respects isExpandable', () => {
      const exp = new RowExpander({
        isExpandable: (row) => row.name !== 'Bob',
      });
      expect(exp.canExpand(rows[0])).toBe(true);
      expect(exp.canExpand(rows[1])).toBe(false);

      const changed = exp.expandRow(rows[1]);
      expect(changed).toBe(false);
    });

    it('defaults to all expandable', () => {
      const exp = new RowExpander();
      expect(exp.canExpand(rows[0])).toBe(true);
      expect(exp.canExpand(rows[1])).toBe(true);
    });
  });

  describe('expandAll / collapseAll', () => {
    it('expandAllRows expands all expandable rows', () => {
      const exp = new RowExpander();
      exp.expandAllRows(rows);
      expect(exp.getExpandedCount()).toBe(3);
    });

    it('expandAllRows respects isExpandable', () => {
      const exp = new RowExpander({
        isExpandable: (row) => row.name !== 'Charlie',
      });
      exp.expandAllRows(rows);
      expect(exp.getExpandedCount()).toBe(2);
    });

    it('collapseAllRows clears all', () => {
      const exp = new RowExpander();
      exp.expandAllRows(rows);
      exp.collapseAllRows();
      expect(exp.getExpandedCount()).toBe(0);
    });
  });

  describe('getContentElement', () => {
    it('returns null when no getContent callback', () => {
      const exp = new RowExpander();
      exp.expandRow(rows[0]);
      expect(exp.getContentElement(rows[0])).toBeNull();
    });

    it('returns null when row not expanded', () => {
      const exp = new RowExpander({
        getContent: (_row, container) => {
          container.textContent = 'Detail';
        },
      });
      expect(exp.getContentElement(rows[0])).toBeNull();
    });

    it('creates content via callback (imperative)', () => {
      const exp = new RowExpander({
        getContent: (row, container) => {
          container.textContent = `Detail for ${row.name}`;
        },
      });
      exp.expandRow(rows[0]);
      const el = exp.getContentElement(rows[0]);
      expect(el).not.toBeNull();
      expect(el!.textContent).toBe('Detail for Alice');
      expect(el!.className).toBe('grid-row-detail');
    });

    it('creates content via callback (return element)', () => {
      const exp = new RowExpander({
        getContent: (row) => {
          const span = document.createElement('span');
          span.textContent = String(row.name);
          return span;
        },
      });
      exp.expandRow(rows[0]);
      const el = exp.getContentElement(rows[0]);
      expect(el!.querySelector('span')!.textContent).toBe('Alice');
    });

    it('caches content', () => {
      const exp = new RowExpander({
        getContent: (_row, container) => {
          container.textContent = 'cached';
        },
      });
      exp.expandRow(rows[0]);
      const el1 = exp.getContentElement(rows[0]);
      const el2 = exp.getContentElement(rows[0]);
      expect(el1).toBe(el2); // same instance
    });
  });

  describe('destroyOnCollapse', () => {
    it('clears cache on collapse when destroyOnCollapse=true', () => {
      const exp = new RowExpander({
        destroyOnCollapse: true,
        getContent: (_row, container) => {
          container.textContent = 'content';
        },
      });
      exp.expandRow(rows[0]);
      const el1 = exp.getContentElement(rows[0]);

      exp.collapseRow(rows[0]);
      exp.expandRow(rows[0]);
      const el2 = exp.getContentElement(rows[0]);

      expect(el1).not.toBe(el2); // new instance
    });
  });

  describe('configuration', () => {
    it('configure updates settings', () => {
      const exp = new RowExpander();
      exp.configure({ multiple: false, expandHeight: 200 });
      expect(exp.expandHeight).toBe(200);

      // Test accordion after reconfigure
      exp.expandRow(rows[0]);
      exp.expandRow(rows[1]);
      expect(exp.getExpandedCount()).toBe(1);
    });

    it('expandOnRowClick defaults to false', () => {
      const exp = new RowExpander();
      expect(exp.expandOnRowClick).toBe(false);
    });

    it('custom rowKey', () => {
      const customRows: Row[] = [
        { uuid: 'a', name: 'X' },
        { uuid: 'b', name: 'Y' },
      ];
      const exp = new RowExpander({ rowKey: 'uuid' });
      exp.expandRow(customRows[0]);
      expect(exp.expandedIds).toEqual(['a']);
    });
  });

  it('clear resets everything', () => {
    const exp = new RowExpander({
      getContent: (_row, container) => {
        container.textContent = 'x';
      },
    });
    exp.expandRow(rows[0]);
    exp.getContentElement(rows[0]);

    exp.clear();
    expect(exp.getExpandedCount()).toBe(0);
    expect(exp.expandedIds.length).toBe(0);
  });
});
