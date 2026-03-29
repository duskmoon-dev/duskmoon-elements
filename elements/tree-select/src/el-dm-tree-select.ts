/**
 * @duskmoon-dev/el-tree-select
 *
 * A hierarchical dropdown selection component.
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as treeSelectCSS } from '@duskmoon-dev/core/components/tree-select';

const coreStyles = treeSelectCSS
  .replace(/@layer\s+components\s*\{/, '')
  .replace(/\}\s*$/, '');

export type TreeSelectColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'error';

const styles = css`
  :host {
    display: block;
    width: 100%;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreStyles}
`;

export class ElDmTreeSelect extends BaseElement {
  static properties = {
    placeholder: { type: String, reflect: true, default: 'Select...' },
    disabled: { type: Boolean, reflect: true },
    color: { type: String, reflect: true, default: 'primary' },
  };

  declare placeholder: string;
  declare disabled: boolean;
  declare color: TreeSelectColor;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    const colorClass = `tree-select-${this.color || 'primary'}`;
    return `
      <div class="tree-select ${colorClass}">
        <button class="tree-select-trigger" ${this.disabled ? 'disabled' : ''}>
          <span class="tree-select-placeholder">${this.placeholder || 'Select...'}</span>
        </button>
        <slot></slot>
      </div>
    `;
  }
}

export function register(): void {
  if (!customElements.get('el-dm-tree-select')) {
    customElements.define('el-dm-tree-select', ElDmTreeSelect);
  }
}
