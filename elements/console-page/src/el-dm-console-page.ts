/**
 * Responsive console shell. Sidebar state is owned by the application.
 *
 * @element el-dm-console-page
 * @attr {boolean} compact - Use the icon-rail sidebar width.
 * @attr {boolean} sidebar-hidden - Hide the persistent sidebar.
 * @slot appbar - Top application bar.
 * @slot menu-trigger - Compact-width navigation trigger.
 * @slot sidebar-toggle - Wide-screen sidebar state control.
 * @slot sidebar-header - Sidebar heading or brand.
 * @slot sidebar - Sidebar navigation body.
 * @slot sidebar-footer - Sidebar footer.
 * @slot main - Main application content.
 * @slot mobile-menu - Native popover menu used at compact widths.
 */
import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as appbarCSS } from '@duskmoon-dev/core/components/appbar';
import { css as consolePageCSS } from '@duskmoon-dev/core/components/console-page';

const appbarStyles = appbarCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
const coreStyles = consolePageCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
const styles = css`
  :host {
    display: block;
    width: 100%;
    min-width: 0;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${appbarStyles}
  ${coreStyles}
`;

export class ElDmConsolePage extends BaseElement {
  static properties = {
    compact: { type: Boolean, reflect: true },
    sidebarHidden: { type: Boolean, reflect: true, attribute: 'sidebar-hidden' },
  };
  declare compact: boolean;
  declare sidebarHidden: boolean;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    const states = [
      this.compact ? 'console-page-sidebar-compact' : '',
      this.sidebarHidden ? 'console-page-sidebar-hidden' : '',
    ]
      .filter(Boolean)
      .join(' ');
    return `
      <div class="console-page ${states}" part="page">
        <div class="console-page-frame" part="frame">
          <header class="console-page-appbar appbar" part="appbar">
            <slot name="appbar"></slot>
            <div class="console-page-menu-trigger" part="menu-trigger"><slot name="menu-trigger"></slot></div>
            <div class="console-page-sidebar-toggle" part="sidebar-toggle"><slot name="sidebar-toggle"></slot></div>
          </header>
          <aside class="console-page-sidebar" part="sidebar">
            <div class="console-page-sidebar-header" part="sidebar-header"><slot name="sidebar-header"></slot></div>
            <div class="console-page-sidebar-body" part="sidebar-body"><slot name="sidebar"></slot></div>
            <div class="console-page-sidebar-footer" part="sidebar-footer"><slot name="sidebar-footer"></slot></div>
          </aside>
          <main class="console-page-main" part="main"><slot name="main"></slot><slot></slot></main>
        </div>
        <div class="console-page-mobile-menu" part="mobile-menu"><slot name="mobile-menu"></slot></div>
      </div>
    `;
  }
}
export function register(): void {
  if (!customElements.get('el-dm-console-page'))
    customElements.define('el-dm-console-page', ElDmConsolePage);
}
