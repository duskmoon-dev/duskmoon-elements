/**
 * Tree data engine — flattens hierarchical data into a display list.
 *
 * Supports two input modes:
 * 1. getDataPath: flat data with path arrays (e.g., ['USA', 'CA', 'LA'])
 * 2. childField: nested records with children arrays
 *
 * Produces a flat display list with level/expanded/children metadata
 * suitable for virtual scrolling.
 */

import type { Row } from '../types.js';

// ─── Public Types ────────────────────────────

export interface TreeNode {
  data: Row;
  id: string;
  level: number;
  expanded: boolean;
  children: TreeNode[];
  parent: TreeNode | null;
  hasChildren: boolean;
  leafCount: number;
}

export interface TreeDataConfig {
  getDataPath?: (row: Row) => string[];
  childField?: string;
  rowKey?: string;
}

// ─── TreeData Class ──────────────────────────

export class TreeData {
  #getDataPath: ((row: Row) => string[]) | null = null;
  #childField = 'children';
  #rowKey = 'id';
  #rootNodes: TreeNode[] = [];
  #flatDisplayList: TreeNode[] = [];
  #expandedNodes = new Set<string>();
  #collapsedNodes = new Set<string>();
  #defaultExpanded = 0; // 0 = collapsed, -1 = all expanded, N = expand to depth N

  get rootNodes(): TreeNode[] {
    return this.#rootNodes;
  }

  get displayList(): TreeNode[] {
    return this.#flatDisplayList;
  }

  get defaultExpanded(): number {
    return this.#defaultExpanded;
  }

  set defaultExpanded(value: number) {
    this.#defaultExpanded = value;
  }

  set getDataPath(fn: ((row: Row) => string[]) | null) {
    this.#getDataPath = fn;
  }

  set childField(field: string) {
    this.#childField = field;
  }

  set rowKey(key: string) {
    this.#rowKey = key;
  }

  /**
   * Build tree from flat rows using getDataPath or childField.
   * Returns the flattened display list.
   */
  buildTree(rows: Row[]): TreeNode[] {
    if (this.#getDataPath) {
      this.#rootNodes = this.#buildFromPaths(rows);
    } else {
      this.#rootNodes = this.#buildFromChildren(rows, null, 0);
    }
    this.#flatDisplayList = [];
    this.#flattenTree(this.#rootNodes, this.#flatDisplayList);
    return this.#flatDisplayList;
  }

  /**
   * Expand a tree node.
   */
  expandNode(nodeId: string): void {
    this.#expandedNodes.add(nodeId);
    this.#collapsedNodes.delete(nodeId);
    this.#rebuildDisplayList();
  }

  /**
   * Collapse a tree node.
   */
  collapseNode(nodeId: string): void {
    this.#collapsedNodes.add(nodeId);
    this.#expandedNodes.delete(nodeId);
    this.#rebuildDisplayList();
  }

  /**
   * Toggle a node's expand/collapse state.
   */
  toggleNode(nodeId: string): boolean {
    if (this.isExpanded(nodeId)) {
      this.collapseNode(nodeId);
      return false;
    } else {
      this.expandNode(nodeId);
      return true;
    }
  }

  /**
   * Check if a node is currently expanded.
   */
  isExpanded(nodeId: string): boolean {
    if (this.#collapsedNodes.has(nodeId)) return false;
    if (this.#expandedNodes.has(nodeId)) return true;
    const node = this.#findNode(this.#rootNodes, nodeId);
    if (!node) return false;
    if (this.#defaultExpanded === -1) return true;
    return node.level < this.#defaultExpanded;
  }

  /**
   * Expand all nodes to a given depth (-1 = all).
   */
  expandAll(depth = -1): void {
    this.#collapsedNodes.clear();
    this.#expandAllInTree(this.#rootNodes, depth);
    this.#rebuildDisplayList();
  }

  /**
   * Collapse all nodes.
   */
  collapseAll(): void {
    this.#expandedNodes.clear();
    this.#collapseAllInTree(this.#rootNodes);
    this.#rebuildDisplayList();
  }

  /**
   * Filter tree keeping parents of matching nodes visible.
   */
  filterTree(predicate: (row: Row) => boolean): TreeNode[] {
    const filtered = this.#filterNodes(this.#rootNodes, predicate);
    this.#flatDisplayList = [];
    this.#flattenTree(filtered, this.#flatDisplayList);
    return this.#flatDisplayList;
  }

  /**
   * Sort children at each level.
   */
  sortTree(comparator: (a: Row, b: Row) => number): void {
    this.#sortNodes(this.#rootNodes, comparator);
    this.#rebuildDisplayList();
  }

  /**
   * Clear all state.
   */
  clear(): void {
    this.#rootNodes = [];
    this.#flatDisplayList = [];
    this.#expandedNodes.clear();
    this.#collapsedNodes.clear();
  }

  // ─── Private: Path-based tree building ──────

  #buildFromPaths(rows: Row[]): TreeNode[] {
    // Build a map of path → node for intermediate group nodes
    const nodeMap = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    for (const row of rows) {
      const path = this.#getDataPath!(row);
      let parent: TreeNode | null = null;

      for (let i = 0; i < path.length; i++) {
        const pathKey = path.slice(0, i + 1).join('/');
        let node = nodeMap.get(pathKey);

        if (!node) {
          const isLeaf = i === path.length - 1;
          node = {
            data: isLeaf ? row : ({ [this.#rowKey]: pathKey, _treeLabel: path[i] } as Row),
            id: pathKey,
            level: i,
            expanded: false,
            children: [],
            parent,
            hasChildren: false,
            leafCount: 0,
          };
          nodeMap.set(pathKey, node);

          if (parent) {
            parent.children.push(node);
            parent.hasChildren = true;
          } else {
            roots.push(node);
          }
        }

        parent = node;
      }
    }

    // Compute leaf counts and default expand state
    this.#computeLeafCounts(roots);
    this.#applyDefaultExpand(roots);

    return roots;
  }

  // ─── Private: Children-based tree building ──

  #buildFromChildren(rows: Row[], parent: TreeNode | null, level: number): TreeNode[] {
    const nodes: TreeNode[] = [];

    for (const row of rows) {
      const id = String(row[this.#rowKey] ?? `row-${level}-${nodes.length}`);
      const childRows = row[this.#childField] as Row[] | undefined;

      const node: TreeNode = {
        data: row,
        id,
        level,
        expanded: false,
        children: [],
        parent,
        hasChildren: Array.isArray(childRows) && childRows.length > 0,
        leafCount: 0,
      };

      if (node.hasChildren) {
        node.children = this.#buildFromChildren(childRows!, node, level + 1);
      }

      nodes.push(node);
    }

    this.#computeLeafCounts(nodes);
    this.#applyDefaultExpand(nodes);
    return nodes;
  }

  // ─── Private: Tree utilities ────────────────

  #computeLeafCounts(nodes: TreeNode[]): void {
    for (const node of nodes) {
      if (node.hasChildren) {
        this.#computeLeafCounts(node.children);
        node.leafCount = node.children.reduce(
          (sum, c) => sum + (c.hasChildren ? c.leafCount : 1),
          0,
        );
      } else {
        node.leafCount = 0;
      }
    }
  }

  #applyDefaultExpand(nodes: TreeNode[]): void {
    for (const node of nodes) {
      if (node.hasChildren) {
        node.expanded = this.#shouldExpand(node.id, node.level);
        this.#applyDefaultExpand(node.children);
      }
    }
  }

  #shouldExpand(nodeId: string, level: number): boolean {
    if (this.#collapsedNodes.has(nodeId)) return false;
    if (this.#expandedNodes.has(nodeId)) return true;
    if (this.#defaultExpanded === -1) return true;
    return level < this.#defaultExpanded;
  }

  #flattenTree(nodes: TreeNode[], out: TreeNode[]): void {
    for (const node of nodes) {
      out.push(node);
      if (node.hasChildren && node.expanded) {
        this.#flattenTree(node.children, out);
      }
    }
  }

  #rebuildDisplayList(): void {
    this.#updateExpandState(this.#rootNodes);
    this.#flatDisplayList = [];
    this.#flattenTree(this.#rootNodes, this.#flatDisplayList);
  }

  #updateExpandState(nodes: TreeNode[]): void {
    for (const node of nodes) {
      if (node.hasChildren) {
        node.expanded = this.#shouldExpand(node.id, node.level);
        this.#updateExpandState(node.children);
      }
    }
  }

  #findNode(nodes: TreeNode[], id: string): TreeNode | null {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children.length > 0) {
        const found = this.#findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  #expandAllInTree(nodes: TreeNode[], depth: number): void {
    for (const node of nodes) {
      if (node.hasChildren) {
        if (depth === -1 || node.level < depth) {
          this.#expandedNodes.add(node.id);
        }
        this.#expandAllInTree(node.children, depth);
      }
    }
  }

  #collapseAllInTree(nodes: TreeNode[]): void {
    for (const node of nodes) {
      if (node.hasChildren) {
        this.#collapsedNodes.add(node.id);
        this.#collapseAllInTree(node.children);
      }
    }
  }

  #filterNodes(nodes: TreeNode[], predicate: (row: Row) => boolean): TreeNode[] {
    const result: TreeNode[] = [];
    for (const node of nodes) {
      if (node.hasChildren) {
        const filteredChildren = this.#filterNodes(node.children, predicate);
        if (filteredChildren.length > 0) {
          // Parent matches because it has matching children — keep it expanded
          const clone: TreeNode = { ...node, children: filteredChildren, expanded: true };
          result.push(clone);
        } else if (predicate(node.data)) {
          result.push({ ...node, children: [], expanded: false });
        }
      } else if (predicate(node.data)) {
        result.push(node);
      }
    }
    return result;
  }

  #sortNodes(nodes: TreeNode[], comparator: (a: Row, b: Row) => number): void {
    nodes.sort((a, b) => comparator(a.data, b.data));
    for (const node of nodes) {
      if (node.hasChildren) {
        this.#sortNodes(node.children, comparator);
      }
    }
  }
}
