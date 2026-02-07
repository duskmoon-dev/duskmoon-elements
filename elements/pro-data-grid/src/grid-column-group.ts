/**
 * Declarative column group element for multi-level headers.
 *
 * Contains <el-dm-grid-column> children. Provides grouping metadata
 * for the grid to render multi-level header rows.
 */

import type { ColumnDef } from './types.js';
import type { ElDmGridColumn } from './grid-column.js';

export class ElDmGridColumnGroup extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['header', 'group-id', 'open-by-default', 'marry-children'];
  }

  get header(): string {
    return this.getAttribute('header') ?? '';
  }

  get groupId(): string {
    return this.getAttribute('group-id') ?? '';
  }

  get openByDefault(): boolean {
    return this.hasAttribute('open-by-default');
  }

  get marryChildren(): boolean {
    return this.hasAttribute('marry-children');
  }

  /**
   * Get column definitions from child <el-dm-grid-column> elements.
   */
  get columnDefs(): ColumnDef[] {
    const children = Array.from(this.children) as ElDmGridColumn[];
    return children.filter((el) => el.tagName === 'EL-DM-GRID-COLUMN').map((el) => el.columnDef);
  }

  attributeChangedCallback(): void {
    this.dispatchEvent(new CustomEvent('column-def-change', { bubbles: true, composed: true }));
  }
}

export function registerGridColumnGroup(): void {
  if (!customElements.get('el-dm-grid-column-group')) {
    customElements.define('el-dm-grid-column-group', ElDmGridColumnGroup);
  }
}
