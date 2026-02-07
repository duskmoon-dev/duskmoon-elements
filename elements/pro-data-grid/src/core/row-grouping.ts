/**
 * Row grouping engine — groups flat rows into a hierarchical tree
 * with expand/collapse, aggregation, and flat display list generation.
 *
 * Supports single and multi-column grouping with nested groups.
 * Aggregation functions compute rollup values for group rows.
 */

import type { Row, ColumnDef } from '../types.js';

// ─── Public Types ────────────────────────────

export interface RowNode {
  data: Row;
  id: string;
  rowIndex: number;
  level: number;
  group: boolean;
  expanded: boolean;
  children: RowNode[];
  allLeafChildren: RowNode[];
  parent: RowNode | null;
  key: string;
  field: string;
  aggData: Record<string, unknown>;
}

export type AggFunc =
  | 'sum'
  | 'avg'
  | 'min'
  | 'max'
  | 'count'
  | 'first'
  | 'last'
  | ((values: unknown[], rows: Row[]) => unknown);

export interface GroupingConfig {
  groupColumns: string[];
  groupDefaultExpanded: number; // -1 = all expanded
  aggFuncs?: Record<string, AggFunc>;
  aggColumns?: { field: string; aggFunc: AggFunc }[];
}

// ─── Built-in Aggregation Functions ──────────

const BUILT_IN_AGG: Record<string, (values: unknown[]) => unknown> = {
  sum: (values) => {
    let total = 0;
    for (const v of values) {
      const n = Number(v);
      if (!Number.isNaN(n)) total += n;
    }
    return total;
  },
  avg: (values) => {
    let total = 0;
    let count = 0;
    for (const v of values) {
      const n = Number(v);
      if (!Number.isNaN(n)) {
        total += n;
        count++;
      }
    }
    return count > 0 ? total / count : 0;
  },
  min: (values) => {
    let min = Infinity;
    for (const v of values) {
      const n = Number(v);
      if (!Number.isNaN(n) && n < min) min = n;
    }
    return min === Infinity ? null : min;
  },
  max: (values) => {
    let max = -Infinity;
    for (const v of values) {
      const n = Number(v);
      if (!Number.isNaN(n) && n > max) max = n;
    }
    return max === -Infinity ? null : max;
  },
  count: (values) => values.length,
  first: (values) => (values.length > 0 ? values[0] : null),
  last: (values) => (values.length > 0 ? values[values.length - 1] : null),
};

// ─── RowGrouping Class ──────────────────────

export class RowGrouping {
  #groupColumns: string[] = [];
  #groupDefaultExpanded = 0;
  #expandedGroups = new Set<string>();
  #collapsedGroups = new Set<string>();
  #customAggFuncs: Record<string, AggFunc> = {};
  #aggColumns: { field: string; aggFunc: AggFunc }[] = [];
  #rootNodes: RowNode[] = [];
  #flatDisplayList: RowNode[] = [];

  get groupColumns(): string[] {
    return [...this.#groupColumns];
  }

  set groupColumns(value: string[]) {
    this.#groupColumns = value;
  }

  get groupDefaultExpanded(): number {
    return this.#groupDefaultExpanded;
  }

  set groupDefaultExpanded(value: number) {
    this.#groupDefaultExpanded = value;
  }

  get expandedGroups(): string[] {
    return [...this.#expandedGroups];
  }

  get rootNodes(): RowNode[] {
    return this.#rootNodes;
  }

  get isGrouped(): boolean {
    return this.#groupColumns.length > 0;
  }

  /**
   * Configure aggregation functions.
   */
  setAggFuncs(funcs: Record<string, AggFunc>): void {
    this.#customAggFuncs = { ...funcs };
  }

  /**
   * Configure which columns should be aggregated and with what function.
   */
  setAggColumns(cols: { field: string; aggFunc: AggFunc }[]): void {
    this.#aggColumns = cols;
  }

  /**
   * Build aggregation column list from column definitions.
   */
  buildAggColumnsFromDefs(columns: ColumnDef[]): void {
    this.#aggColumns = columns
      .filter((col) => col.aggFunc)
      .map((col) => ({ field: col.field, aggFunc: col.aggFunc as AggFunc }));
  }

  /**
   * Group rows and produce a flat display list.
   * Returns the display list (mix of group rows and leaf rows).
   */
  group(rows: Row[]): RowNode[] {
    if (this.#groupColumns.length === 0) {
      // No grouping — wrap each row as a leaf node
      this.#rootNodes = rows.map((row, i) => this.#createLeafNode(row, i, null));
      this.#flatDisplayList = this.#rootNodes;
      return this.#flatDisplayList;
    }

    // Build tree
    this.#rootNodes = this.#buildGroupTree(rows, this.#groupColumns, 0, null, []);

    // Compute aggregation
    this.#computeAggregation(this.#rootNodes);

    // Flatten for display
    this.#flatDisplayList = [];
    this.#flattenTree(this.#rootNodes, this.#flatDisplayList);

    return this.#flatDisplayList;
  }

  /**
   * Get the flat display list (call after group()).
   */
  getDisplayList(): RowNode[] {
    return this.#flatDisplayList;
  }

  /**
   * Expand a group by its key path (e.g. "status=active" or "status=active|dept=eng").
   */
  expandGroup(keyPath: string): void {
    this.#expandedGroups.add(keyPath);
    this.#collapsedGroups.delete(keyPath);
    this.#rebuildDisplayList();
  }

  /**
   * Collapse a group by its key path.
   */
  collapseGroup(keyPath: string): void {
    this.#collapsedGroups.add(keyPath);
    this.#expandedGroups.delete(keyPath);
    // Also collapse any child groups — both explicit and default-expanded
    const node = this.#findNode(this.#rootNodes, keyPath);
    if (node) {
      this.#collapseAllNodes(node.children);
    }
    for (const key of this.#expandedGroups) {
      if (key.startsWith(keyPath + '|')) {
        this.#expandedGroups.delete(key);
      }
    }
    this.#rebuildDisplayList();
  }

  /**
   * Toggle group expand/collapse.
   */
  toggleGroup(keyPath: string): boolean {
    // Check actual expanded state, not just explicit set membership
    if (this.isExpanded(keyPath)) {
      this.collapseGroup(keyPath);
      return false;
    } else {
      this.expandGroup(keyPath);
      return true;
    }
  }

  /**
   * Expand all groups to a given depth (-1 = all).
   */
  expandAll(depth = -1): void {
    this.#collapsedGroups.clear();
    this.#expandAllNodes(this.#rootNodes, depth);
    this.#rebuildDisplayList();
  }

  /**
   * Collapse all groups.
   */
  collapseAll(): void {
    this.#expandedGroups.clear();
    // Mark all group nodes as explicitly collapsed
    this.#collapseAllNodes(this.#rootNodes);
    this.#rebuildDisplayList();
  }

  /**
   * Check if a group key path is expanded.
   * Considers explicit expand/collapse state and default expansion depth.
   */
  isExpanded(keyPath: string): boolean {
    // Explicit collapsed takes highest priority
    if (this.#collapsedGroups.has(keyPath)) return false;
    // Explicit expanded
    if (this.#expandedGroups.has(keyPath)) return true;
    // Fall back to default depth — need the node's level
    // Search for the node to get its level
    const node = this.#findNode(this.#rootNodes, keyPath);
    if (!node) return false;
    if (this.#groupDefaultExpanded === -1) return true;
    return node.level < this.#groupDefaultExpanded;
  }

  /**
   * Clear all state.
   */
  clear(): void {
    this.#rootNodes = [];
    this.#flatDisplayList = [];
    this.#expandedGroups.clear();
    this.#collapsedGroups.clear();
  }

  // ─── Private: Tree Building ─────────────────

  #buildGroupTree(
    rows: Row[],
    groupFields: string[],
    level: number,
    parent: RowNode | null,
    pathParts: string[],
  ): RowNode[] {
    const field = groupFields[level];
    const groups = new Map<string, Row[]>();

    // Bucket rows by the current group field value
    for (const row of rows) {
      const val = row[field];
      const key = val == null ? '(blank)' : String(val);
      let bucket = groups.get(key);
      if (!bucket) {
        bucket = [];
        groups.set(key, bucket);
      }
      bucket.push(row);
    }

    const nodes: RowNode[] = [];
    let rowIndex = 0;

    for (const [key, bucketRows] of groups) {
      const keyPath = [...pathParts, `${field}=${key}`].join('|');

      const groupNode: RowNode = {
        data: {} as Row,
        id: keyPath,
        rowIndex: rowIndex++,
        level,
        group: true,
        expanded: this.#shouldExpand(keyPath, level),
        children: [],
        allLeafChildren: [],
        parent,
        key,
        field,
        aggData: {},
      };

      if (level + 1 < groupFields.length) {
        // Recurse for sub-groups
        groupNode.children = this.#buildGroupTree(bucketRows, groupFields, level + 1, groupNode, [
          ...pathParts,
          `${field}=${key}`,
        ]);
        // Collect all leaf children from sub-groups
        for (const child of groupNode.children) {
          if (child.group) {
            groupNode.allLeafChildren.push(...child.allLeafChildren);
          } else {
            groupNode.allLeafChildren.push(child);
          }
        }
      } else {
        // Leaf level — create leaf nodes
        groupNode.children = bucketRows.map((row, i) => this.#createLeafNode(row, i, groupNode));
        groupNode.allLeafChildren = groupNode.children;
      }

      nodes.push(groupNode);
    }

    return nodes;
  }

  #createLeafNode(row: Row, index: number, parent: RowNode | null): RowNode {
    return {
      data: row,
      id: `leaf-${index}`,
      rowIndex: index,
      level: parent ? parent.level + 1 : 0,
      group: false,
      expanded: false,
      children: [],
      allLeafChildren: [],
      parent,
      key: '',
      field: '',
      aggData: {},
    };
  }

  #shouldExpand(keyPath: string, level: number): boolean {
    // Explicit collapsed takes highest priority
    if (this.#collapsedGroups.has(keyPath)) return false;

    // Explicit expand state
    if (this.#expandedGroups.has(keyPath)) return true;

    // Default expanded depth
    if (this.#groupDefaultExpanded === -1) return true;
    if (level < this.#groupDefaultExpanded) return true;

    return false;
  }

  #findNode(nodes: RowNode[], keyPath: string): RowNode | null {
    for (const node of nodes) {
      if (node.id === keyPath) return node;
      if (node.group && node.children.length > 0) {
        const found = this.#findNode(node.children, keyPath);
        if (found) return found;
      }
    }
    return null;
  }

  #collapseAllNodes(nodes: RowNode[]): void {
    for (const node of nodes) {
      if (node.group) {
        this.#collapsedGroups.add(node.id);
        this.#collapseAllNodes(node.children);
      }
    }
  }

  // ─── Private: Aggregation ───────────────────

  #computeAggregation(nodes: RowNode[]): void {
    if (this.#aggColumns.length === 0) return;

    for (const node of nodes) {
      if (!node.group) continue;

      // Recurse first so child aggregation is ready
      if (node.children.some((c) => c.group)) {
        this.#computeAggregation(node.children);
      }

      const leafRows = node.allLeafChildren.map((n) => n.data);

      for (const aggCol of this.#aggColumns) {
        const values = leafRows.map((row) => row[aggCol.field]);
        node.aggData[aggCol.field] = this.#applyAgg(aggCol.aggFunc, values, leafRows);
      }
    }
  }

  #applyAgg(aggFunc: AggFunc, values: unknown[], rows: Row[]): unknown {
    if (typeof aggFunc === 'function') {
      return aggFunc(values, rows);
    }
    // Check custom first, then built-in
    const customFn = this.#customAggFuncs[aggFunc];
    if (typeof customFn === 'function') {
      return customFn(values, rows);
    }
    const builtIn = BUILT_IN_AGG[aggFunc];
    if (builtIn) {
      return builtIn(values);
    }
    return null;
  }

  // ─── Private: Flattening ────────────────────

  #flattenTree(nodes: RowNode[], out: RowNode[]): void {
    for (const node of nodes) {
      out.push(node);
      if (node.group && node.expanded && node.children.length > 0) {
        this.#flattenTree(node.children, out);
      }
    }
  }

  #rebuildDisplayList(): void {
    // Update expanded state on existing nodes
    this.#updateExpandState(this.#rootNodes);
    this.#flatDisplayList = [];
    this.#flattenTree(this.#rootNodes, this.#flatDisplayList);
  }

  #updateExpandState(nodes: RowNode[]): void {
    for (const node of nodes) {
      if (node.group) {
        node.expanded = this.#shouldExpand(node.id, node.level);
        this.#updateExpandState(node.children);
      }
    }
  }

  #expandAllNodes(nodes: RowNode[], depth: number): void {
    for (const node of nodes) {
      if (node.group) {
        if (depth === -1 || node.level < depth) {
          this.#expandedGroups.add(node.id);
        }
        this.#expandAllNodes(node.children, depth);
      }
    }
  }
}
