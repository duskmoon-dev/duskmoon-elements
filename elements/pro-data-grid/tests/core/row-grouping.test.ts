import { describe, it, expect } from 'bun:test';
import { RowGrouping } from '../../src/core/row-grouping.js';
import type { Row, ColumnDef } from '../../src/types.js';

describe('RowGrouping', () => {
  const rows: Row[] = [
    { name: 'Alice', dept: 'Engineering', role: 'Dev', salary: 100 },
    { name: 'Bob', dept: 'Engineering', role: 'QA', salary: 90 },
    { name: 'Charlie', dept: 'Sales', role: 'Rep', salary: 80 },
    { name: 'Diana', dept: 'Sales', role: 'Rep', salary: 85 },
    { name: 'Eve', dept: 'Engineering', role: 'Dev', salary: 110 },
  ];

  const columns: ColumnDef[] = [
    { field: 'name', header: 'Name', type: 'text' },
    { field: 'dept', header: 'Dept', type: 'text' },
    { field: 'role', header: 'Role', type: 'text' },
    { field: 'salary', header: 'Salary', type: 'number', aggFunc: 'sum' },
  ];

  it('returns flat nodes when no group columns set', () => {
    const rg = new RowGrouping();
    const result = rg.group(rows);
    expect(result.length).toBe(5);
    expect(result[0].group).toBe(false);
    expect(result[0].data).toBe(rows[0]);
  });

  it('groups by single column', () => {
    const rg = new RowGrouping();
    rg.groupColumns = ['dept'];
    const result = rg.group(rows);
    // 2 group rows (collapsed) = Engineering, Sales
    expect(result.length).toBe(2);
    expect(result[0].group).toBe(true);
    expect(result[0].key).toBe('Engineering');
    expect(result[0].allLeafChildren.length).toBe(3);
    expect(result[1].key).toBe('Sales');
    expect(result[1].allLeafChildren.length).toBe(2);
  });

  it('groups by multiple columns (nested)', () => {
    const rg = new RowGrouping();
    rg.groupColumns = ['dept', 'role'];
    rg.groupDefaultExpanded = -1; // expand all
    const result = rg.group(rows);

    // Engineering (group) -> Dev (group) -> 2 leaves, QA (group) -> 1 leaf
    // Sales (group) -> Rep (group) -> 2 leaves
    // Flat: Eng, Dev, Alice, Eve, QA, Bob, Sales, Rep, Charlie, Diana = 10
    expect(result.length).toBe(10);
    expect(result[0].group).toBe(true);
    expect(result[0].key).toBe('Engineering');
    expect(result[1].group).toBe(true);
    expect(result[1].key).toBe('Dev');
    expect(result[1].level).toBe(1);
  });

  it('respects groupDefaultExpanded=0 (all collapsed)', () => {
    const rg = new RowGrouping();
    rg.groupColumns = ['dept'];
    rg.groupDefaultExpanded = 0;
    const result = rg.group(rows);
    // Only top-level group rows visible (collapsed)
    expect(result.length).toBe(2);
    expect(result.every((n) => n.group)).toBe(true);
  });

  it('respects groupDefaultExpanded=1 (first level expanded)', () => {
    const rg = new RowGrouping();
    rg.groupColumns = ['dept', 'role'];
    rg.groupDefaultExpanded = 1;
    const result = rg.group(rows);
    // Top-level expanded, sub-groups collapsed
    // Engineering + Dev + QA + Sales + Rep = 5
    expect(result.length).toBe(5);
    expect(result[0].key).toBe('Engineering');
    expect(result[0].expanded).toBe(true);
    expect(result[1].key).toBe('Dev');
    expect(result[1].expanded).toBe(false);
  });

  it('respects groupDefaultExpanded=-1 (all expanded)', () => {
    const rg = new RowGrouping();
    rg.groupColumns = ['dept'];
    rg.groupDefaultExpanded = -1;
    const result = rg.group(rows);
    // 2 groups + 5 leaves = 7
    expect(result.length).toBe(7);
  });

  describe('expand/collapse', () => {
    it('expands a group', () => {
      const rg = new RowGrouping();
      rg.groupColumns = ['dept'];
      rg.group(rows);

      rg.expandGroup('dept=Engineering');
      const display = rg.getDisplayList();
      // Engineering (expanded) + 3 leaves + Sales (collapsed) = 5
      expect(display.length).toBe(5);
      expect(display[0].expanded).toBe(true);
    });

    it('collapses a group', () => {
      const rg = new RowGrouping();
      rg.groupColumns = ['dept'];
      rg.groupDefaultExpanded = -1;
      rg.group(rows);

      rg.collapseGroup('dept=Engineering');
      const display = rg.getDisplayList();
      // Engineering (collapsed) + Sales (expanded) + 2 leaves = 4
      expect(display.length).toBe(4);
    });

    it('toggleGroup returns new state', () => {
      const rg = new RowGrouping();
      rg.groupColumns = ['dept'];
      rg.group(rows);

      const expanded = rg.toggleGroup('dept=Sales');
      expect(expanded).toBe(true);
      expect(rg.isExpanded('dept=Sales')).toBe(true);

      const collapsed = rg.toggleGroup('dept=Sales');
      expect(collapsed).toBe(false);
      expect(rg.isExpanded('dept=Sales')).toBe(false);
    });

    it('collapseGroup also collapses child groups', () => {
      const rg = new RowGrouping();
      rg.groupColumns = ['dept', 'role'];
      rg.groupDefaultExpanded = -1;
      rg.group(rows);

      rg.collapseGroup('dept=Engineering');
      expect(rg.isExpanded('dept=Engineering')).toBe(false);
      expect(rg.isExpanded('dept=Engineering|role=Dev')).toBe(false);
    });
  });

  describe('expandAll / collapseAll', () => {
    it('expandAll(-1) expands everything', () => {
      const rg = new RowGrouping();
      rg.groupColumns = ['dept'];
      rg.group(rows);

      rg.expandAll(-1);
      const display = rg.getDisplayList();
      expect(display.length).toBe(7); // 2 groups + 5 leaves
    });

    it('collapseAll collapses everything', () => {
      const rg = new RowGrouping();
      rg.groupColumns = ['dept'];
      rg.groupDefaultExpanded = -1;
      rg.group(rows);

      rg.collapseAll();
      const display = rg.getDisplayList();
      expect(display.length).toBe(2); // just top-level groups
    });

    it('expandAll(depth) expands to specific depth', () => {
      const rg = new RowGrouping();
      rg.groupColumns = ['dept', 'role'];
      rg.group(rows);

      rg.expandAll(1); // expand only first level
      const display = rg.getDisplayList();
      // Top groups expanded, sub-groups collapsed
      // Engineering + Dev + QA + Sales + Rep = 5
      expect(display.length).toBe(5);
    });
  });

  describe('aggregation', () => {
    it('computes sum aggregation', () => {
      const rg = new RowGrouping();
      rg.groupColumns = ['dept'];
      rg.setAggColumns([{ field: 'salary', aggFunc: 'sum' }]);
      rg.group(rows);

      const nodes = rg.rootNodes;
      const eng = nodes.find((n) => n.key === 'Engineering')!;
      expect(eng.aggData.salary).toBe(300); // 100 + 90 + 110
      const sales = nodes.find((n) => n.key === 'Sales')!;
      expect(sales.aggData.salary).toBe(165); // 80 + 85
    });

    it('computes avg aggregation', () => {
      const rg = new RowGrouping();
      rg.groupColumns = ['dept'];
      rg.setAggColumns([{ field: 'salary', aggFunc: 'avg' }]);
      rg.group(rows);

      const eng = rg.rootNodes.find((n) => n.key === 'Engineering')!;
      expect(eng.aggData.salary).toBe(100); // (100+90+110)/3
    });

    it('computes min/max aggregation', () => {
      const rg = new RowGrouping();
      rg.groupColumns = ['dept'];
      rg.setAggColumns([
        { field: 'salary', aggFunc: 'min' },
      ]);
      rg.group(rows);

      const eng = rg.rootNodes.find((n) => n.key === 'Engineering')!;
      expect(eng.aggData.salary).toBe(90);
    });

    it('computes count aggregation', () => {
      const rg = new RowGrouping();
      rg.groupColumns = ['dept'];
      rg.setAggColumns([{ field: 'salary', aggFunc: 'count' }]);
      rg.group(rows);

      const eng = rg.rootNodes.find((n) => n.key === 'Engineering')!;
      expect(eng.aggData.salary).toBe(3);
    });

    it('computes first/last aggregation', () => {
      const rg = new RowGrouping();
      rg.groupColumns = ['dept'];
      rg.setAggColumns([{ field: 'name', aggFunc: 'first' }]);
      rg.group(rows);

      const eng = rg.rootNodes.find((n) => n.key === 'Engineering')!;
      expect(eng.aggData.name).toBe('Alice');
    });

    it('supports custom aggregation function', () => {
      const rg = new RowGrouping();
      rg.groupColumns = ['dept'];
      rg.setAggColumns([{
        field: 'salary',
        aggFunc: (values: unknown[]) => {
          const nums = values.map(Number).filter((n) => !Number.isNaN(n));
          return Math.max(...nums) - Math.min(...nums);
        },
      }]);
      rg.group(rows);

      const eng = rg.rootNodes.find((n) => n.key === 'Engineering')!;
      expect(eng.aggData.salary).toBe(20); // 110 - 90
    });

    it('supports named custom aggregation via setAggFuncs', () => {
      const rg = new RowGrouping();
      rg.groupColumns = ['dept'];
      rg.setAggFuncs({
        range: (values: unknown[]) => {
          const nums = values.map(Number).filter((n) => !Number.isNaN(n));
          return Math.max(...nums) - Math.min(...nums);
        },
      });
      rg.setAggColumns([{ field: 'salary', aggFunc: 'range' }]);
      rg.group(rows);

      const eng = rg.rootNodes.find((n) => n.key === 'Engineering')!;
      expect(eng.aggData.salary).toBe(20);
    });

    it('builds agg columns from column defs', () => {
      const rg = new RowGrouping();
      rg.groupColumns = ['dept'];
      rg.buildAggColumnsFromDefs(columns);
      rg.group(rows);

      const eng = rg.rootNodes.find((n) => n.key === 'Engineering')!;
      expect(eng.aggData.salary).toBe(300); // sum
    });

    it('computes nested group aggregation from leaves', () => {
      const rg = new RowGrouping();
      rg.groupColumns = ['dept', 'role'];
      rg.setAggColumns([{ field: 'salary', aggFunc: 'sum' }]);
      rg.groupDefaultExpanded = -1;
      rg.group(rows);

      const eng = rg.rootNodes.find((n) => n.key === 'Engineering')!;
      expect(eng.aggData.salary).toBe(300);

      const devGroup = eng.children.find((n) => n.key === 'Dev')!;
      expect(devGroup.aggData.salary).toBe(210); // 100 + 110
    });
  });

  it('handles null group values as (blank)', () => {
    const rg = new RowGrouping();
    rg.groupColumns = ['dept'];
    const rowsWithNull: Row[] = [
      ...rows,
      { name: 'Frank', dept: null, role: 'QA', salary: 70 },
    ];
    const result = rg.group(rowsWithNull);
    const blankGroup = result.find((n) => n.key === '(blank)');
    expect(blankGroup).toBeDefined();
    expect(blankGroup!.allLeafChildren.length).toBe(1);
  });

  it('isGrouped reflects group columns state', () => {
    const rg = new RowGrouping();
    expect(rg.isGrouped).toBe(false);
    rg.groupColumns = ['dept'];
    expect(rg.isGrouped).toBe(true);
  });

  it('clear resets all state', () => {
    const rg = new RowGrouping();
    rg.groupColumns = ['dept'];
    rg.group(rows);
    rg.expandGroup('dept=Sales');

    rg.clear();
    expect(rg.rootNodes.length).toBe(0);
    expect(rg.getDisplayList().length).toBe(0);
    expect(rg.expandedGroups.length).toBe(0);
  });

  it('expandedGroups returns current expanded paths', () => {
    const rg = new RowGrouping();
    rg.groupColumns = ['dept'];
    rg.group(rows);

    rg.expandGroup('dept=Engineering');
    rg.expandGroup('dept=Sales');
    const expanded = rg.expandedGroups;
    expect(expanded).toContain('dept=Engineering');
    expect(expanded).toContain('dept=Sales');
  });
});
