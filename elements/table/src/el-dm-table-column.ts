/**
 * DuskMoon Table Column Element
 *
 * Declarative column definition for el-dm-table.
 *
 * @element el-dm-table-column
 *
 * @attr {string} key - Column key for data mapping (required)
 * @attr {string} label - Column header label
 * @attr {boolean} sortable - Whether column is sortable
 * @attr {string} width - Column width (CSS value)
 * @attr {string} align - Text alignment: left, center, right
 * @attr {boolean} hidden - Whether column is hidden
 */

import { BaseElement } from '@duskmoon-dev/el-base';
import type { TableColumn } from './types.js';

export class ElDmTableColumn extends BaseElement {
  static properties = {
    key: { type: String, reflect: true },
    label: { type: String, reflect: true },
    sortable: { type: Boolean, reflect: true },
    width: { type: String, reflect: true },
    align: { type: String, reflect: true, default: 'left' },
    hidden: { type: Boolean, reflect: true },
  };

  declare key: string;
  declare label: string;
  declare sortable: boolean;
  declare width: string;
  declare align: 'left' | 'center' | 'right';
  declare hidden: boolean;

  connectedCallback(): void {
    super.connectedCallback();
    // Notify parent table that columns changed
    this._notifyParent();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    // Notify parent table that columns changed
    this._notifyParent();
  }

  private _notifyParent(): void {
    this.dispatchEvent(
      new CustomEvent('table-column-change', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Convert to TableColumn interface */
  toColumnDef(): TableColumn {
    return {
      key: this.key,
      label: this.label || this.key || '',
      sortable: this.sortable || false,
      width: this.width,
      align: this.align || 'left',
      hidden: this.hidden || false,
    };
  }

  protected render(): string {
    // Hidden element - no visual output, just holds data
    return `<slot></slot>`;
  }
}

export function registerTableColumn(): void {
  if (!customElements.get('el-dm-table-column')) {
    customElements.define('el-dm-table-column', ElDmTableColumn);
  }
}
