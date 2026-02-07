/**
 * Declarative column definition element.
 *
 * Lightweight HTMLElement (no Shadow DOM) that reads attributes
 * and exposes a `columnDef` property matching the ColumnDef interface.
 * Parent <el-dm-pro-data-grid> reads these on connect/mutate.
 */

import type { ColumnDef } from './types.js';

export class ElDmGridColumn extends HTMLElement {
  static get observedAttributes(): string[] {
    return [
      'field',
      'header',
      'width',
      'min-width',
      'max-width',
      'flex',
      'sortable',
      'filterable',
      'editable',
      'hidden',
      'pinned',
      'type',
      'align',
      'header-align',
      'filter-type',
      'resizable',
      'row-group',
      'pivot',
      'agg-func',
      'enable-value',
      'enable-row-group',
      'enable-pivot',
      'css-class',
      'floating-filter',
    ];
  }

  get columnDef(): ColumnDef {
    return {
      field: this.getAttribute('field') ?? '',
      header: this.getAttribute('header') ?? this.getAttribute('field') ?? '',
      width: this.#numAttr('width'),
      minWidth: this.#numAttr('min-width'),
      maxWidth: this.#numAttr('max-width'),
      flex: this.#numAttr('flex'),
      sortable: this.hasAttribute('sortable'),
      filterable: this.hasAttribute('filterable'),
      editable: this.hasAttribute('editable'),
      hidden: this.hasAttribute('hidden'),
      resizable: this.hasAttribute('resizable') || !this.hasAttribute('no-resize'),
      pinned: (this.getAttribute('pinned') as 'left' | 'right') || false,
      type: (this.getAttribute('type') as ColumnDef['type']) || 'text',
      align: (this.getAttribute('align') as ColumnDef['align']) || undefined,
      headerAlign: (this.getAttribute('header-align') as ColumnDef['headerAlign']) || undefined,
      filterType: (this.getAttribute('filter-type') as ColumnDef['filterType']) || undefined,
      rowGroup: this.hasAttribute('row-group'),
      pivot: this.hasAttribute('pivot'),
      aggFunc: (this.getAttribute('agg-func') as ColumnDef['aggFunc']) || undefined,
      enableValue: this.hasAttribute('enable-value'),
      enableRowGroup: this.hasAttribute('enable-row-group'),
      enablePivot: this.hasAttribute('enable-pivot'),
      cssClass: this.getAttribute('css-class') || undefined,
      floatingFilter: this.hasAttribute('floating-filter'),
    };
  }

  attributeChangedCallback(): void {
    // Notify parent grid that column definition changed
    this.dispatchEvent(new CustomEvent('column-def-change', { bubbles: true, composed: true }));
  }

  #numAttr(name: string): number | undefined {
    const val = this.getAttribute(name);
    if (val === null) return undefined;
    const num = Number(val);
    return Number.isNaN(num) ? undefined : num;
  }
}

export function registerGridColumn(): void {
  if (!customElements.get('el-dm-grid-column')) {
    customElements.define('el-dm-grid-column', ElDmGridColumn);
  }
}
