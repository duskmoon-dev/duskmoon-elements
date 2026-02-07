/**
 * Row expander — manages expandable detail panels below rows.
 *
 * Supports:
 * - Single and multiple expansion (accordion mode)
 * - Lazy content creation and destroy-on-collapse
 * - Custom content renderer via callback
 * - Expand/collapse state tracking
 * - Integration with virtual scrolling
 */

import type { Row } from '../types.js';

// ─── Public Types ────────────────────────────

export interface RowExpanderConfig {
  rowKey?: string;
  multiple?: boolean;
  expandHeight?: number | 'auto';
  isExpandable?: (row: Row) => boolean;
  getContent?: (row: Row, container: HTMLElement) => void | HTMLElement;
  lazyContent?: boolean;
  destroyOnCollapse?: boolean;
  expandOnRowClick?: boolean;
}

// ─── RowExpander Class ───────────────────────

export class RowExpander {
  #expandedIds = new Set<string>();
  #rowKey = 'id';
  #multiple = true;
  #expandHeight: number | 'auto' = 'auto';
  #isExpandable: ((row: Row) => boolean) | null = null;
  #getContent: ((row: Row, container: HTMLElement) => void | HTMLElement) | null = null;
  #lazyContent = true;
  #destroyOnCollapse = false;
  #expandOnRowClick = false;
  #contentCache = new Map<string, HTMLElement>();

  constructor(config: RowExpanderConfig = {}) {
    this.configure(config);
  }

  configure(config: RowExpanderConfig): void {
    if (config.rowKey !== undefined) this.#rowKey = config.rowKey;
    if (config.multiple !== undefined) this.#multiple = config.multiple;
    if (config.expandHeight !== undefined) this.#expandHeight = config.expandHeight;
    if (config.isExpandable !== undefined) this.#isExpandable = config.isExpandable;
    if (config.getContent !== undefined) this.#getContent = config.getContent;
    if (config.lazyContent !== undefined) this.#lazyContent = config.lazyContent;
    if (config.destroyOnCollapse !== undefined) this.#destroyOnCollapse = config.destroyOnCollapse;
    if (config.expandOnRowClick !== undefined) this.#expandOnRowClick = config.expandOnRowClick;
  }

  get expandedIds(): string[] {
    return [...this.#expandedIds];
  }

  get expandOnRowClick(): boolean {
    return this.#expandOnRowClick;
  }

  get expandHeight(): number | 'auto' {
    return this.#expandHeight;
  }

  /**
   * Check if a row can be expanded.
   */
  canExpand(row: Row): boolean {
    if (this.#isExpandable) {
      return this.#isExpandable(row);
    }
    return true;
  }

  /**
   * Check if a row is currently expanded.
   */
  isExpanded(row: Row): boolean {
    const id = this.#getRowId(row);
    return this.#expandedIds.has(id);
  }

  /**
   * Expand a row. Returns true if state changed.
   */
  expandRow(row: Row): boolean {
    if (!this.canExpand(row)) return false;
    const id = this.#getRowId(row);
    if (this.#expandedIds.has(id)) return false;

    // Accordion mode: collapse others first
    if (!this.#multiple) {
      this.#expandedIds.clear();
      if (this.#destroyOnCollapse) this.#contentCache.clear();
    }

    this.#expandedIds.add(id);
    return true;
  }

  /**
   * Collapse a row. Returns true if state changed.
   */
  collapseRow(row: Row): boolean {
    const id = this.#getRowId(row);
    if (!this.#expandedIds.has(id)) return false;

    this.#expandedIds.delete(id);

    if (this.#destroyOnCollapse) {
      this.#contentCache.delete(id);
    }

    return true;
  }

  /**
   * Toggle a row's expand state.
   */
  toggleRow(row: Row): boolean {
    if (this.isExpanded(row)) {
      this.collapseRow(row);
      return false;
    } else {
      this.expandRow(row);
      return true;
    }
  }

  /**
   * Expand all expandable rows.
   */
  expandAllRows(rows: Row[]): void {
    for (const row of rows) {
      if (this.canExpand(row)) {
        this.#expandedIds.add(this.#getRowId(row));
      }
    }
  }

  /**
   * Collapse all rows.
   */
  collapseAllRows(): void {
    this.#expandedIds.clear();
    if (this.#destroyOnCollapse) this.#contentCache.clear();
  }

  /**
   * Get the content element for an expanded row.
   * Supports lazy creation and caching.
   */
  getContentElement(row: Row): HTMLElement | null {
    const id = this.#getRowId(row);
    if (!this.#expandedIds.has(id)) return null;
    if (!this.#getContent) return null;

    // Check cache first
    if (this.#contentCache.has(id)) {
      return this.#contentCache.get(id)!;
    }

    // Lazy creation
    if (!this.#lazyContent && !this.#expandedIds.has(id)) {
      return null;
    }

    const container = document.createElement('div');
    container.className = 'grid-row-detail';
    container.setAttribute('role', 'region');

    const result = this.#getContent(row, container);
    if (result instanceof HTMLElement) {
      container.appendChild(result);
    }

    this.#contentCache.set(id, container);
    return container;
  }

  /**
   * Get total expanded row count for height calculation.
   */
  getExpandedCount(): number {
    return this.#expandedIds.size;
  }

  /**
   * Clear all state and cache.
   */
  clear(): void {
    this.#expandedIds.clear();
    this.#contentCache.clear();
  }

  #getRowId(row: Row): string {
    return String(row[this.#rowKey] ?? '');
  }
}
