import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as filterGroupCSS } from '@duskmoon-dev/core/components/filter-group';

export type FilterGroupColor =
  'primary' | 'secondary' | 'tertiary' | 'info' | 'success' | 'warning' | 'error';
const COLORS = new Set(['primary', 'secondary', 'tertiary', 'info', 'success', 'warning', 'error']);
const coreStyles = filterGroupCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
const styles = css`
  :host {
    display: block;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreStyles}
  ::slotted(label) {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    border: 1px solid var(--color-outline);
    border-radius: var(--radius-full);
    cursor: pointer;
  }
  ::slotted(label:has(input:checked)) {
    color: var(--filter-content, var(--color-on-primary-container));
    background: var(--filter-background, var(--color-primary-container));
    border-color: var(--filter-color, var(--color-primary));
  }
  ::slotted(label:has(input:focus-visible)) {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
  ::slotted(label:has(input:disabled)) {
    cursor: not-allowed;
    opacity: 0.38;
  }
`;

export class ElDmFilterGroup extends BaseElement {
  static properties = { color: { type: String, reflect: true } };
  declare color: FilterGroupColor;
  constructor() {
    super();
    this.attachStyles(styles);
  }
  render(): string {
    const color = COLORS.has(this.color) ? ` filter-group-${this.color}` : '';
    return `<div class="filter-group${color}" part="group"><slot></slot></div>`;
  }
}
