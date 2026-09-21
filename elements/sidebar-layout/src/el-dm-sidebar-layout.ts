/**
 * Persistent responsive sidebar grid. Application code owns compact/hidden state.
 *
 * @element el-dm-sidebar-layout
 * @attr {'start'|'end'} position - Logical sidebar placement.
 * @attr {boolean} compact - Use the compact sidebar width.
 * @attr {boolean} sidebar-hidden - Hide the sidebar.
 * @slot sidebar - Sidebar content.
 * @slot - Main content.
 */
import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as sidebarLayoutCSS } from '@duskmoon-dev/core/components/sidebar-layout';

const coreStyles = sidebarLayoutCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
const styles = css`
  :host {
    display: block;
    width: 100%;
    min-width: 0;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreStyles}
`;
export type SidebarLayoutPosition = 'start' | 'end';

export class ElDmSidebarLayout extends BaseElement {
  static properties = {
    position: { type: String, reflect: true, default: 'start' },
    compact: { type: Boolean, reflect: true },
    sidebarHidden: { type: Boolean, reflect: true, attribute: 'sidebar-hidden' },
  };
  declare position: SidebarLayoutPosition;
  declare compact: boolean;
  declare sidebarHidden: boolean;

  constructor() {
    super();
    this.attachStyles(styles);
  }
  render(): string {
    const classes = [
      'sidebar-layout',
      this.position === 'end' ? 'sidebar-layout-end' : 'sidebar-layout-start',
      this.compact ? 'sidebar-layout-compact' : '',
      this.sidebarHidden ? 'sidebar-layout-hidden' : '',
    ]
      .filter(Boolean)
      .join(' ');
    return `
      <div class="${classes}" part="layout">
        <aside class="sidebar-layout-sidebar" part="sidebar"><slot name="sidebar"></slot></aside>
        <main class="sidebar-layout-content" part="content"><slot></slot></main>
      </div>
    `;
  }
}
export function register(): void {
  if (!customElements.get('el-dm-sidebar-layout'))
    customElements.define('el-dm-sidebar-layout', ElDmSidebarLayout);
}
