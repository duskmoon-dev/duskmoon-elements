/**
 * App-bar-led public page shell driven by its containing width.
 *
 * @element el-dm-home-page
 * @slot header - Header/appbar content.
 * @slot navigation - Wide-screen primary navigation.
 * @slot actions - Wide-screen actions.
 * @slot menu-trigger - Compact-width menu trigger.
 * @slot mobile-menu - Compact-width native popover menu.
 * @slot hero - Hero content.
 * @slot main - Main page content.
 * @slot footer - Page footer.
 */
import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as appbarCSS } from '@duskmoon-dev/core/components/appbar';
import { css as homePageCSS } from '@duskmoon-dev/core/components/home-page';

const appbarStyles = appbarCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
const coreStyles = homePageCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
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

export class ElDmHomePage extends BaseElement {
  constructor() {
    super();
    this.attachStyles(styles);
  }
  render(): string {
    return `
      <div class="home-page" part="page">
        <div class="home-page-frame" part="frame">
          <header class="home-page-header appbar" part="header">
            <slot name="header"></slot>
            <nav class="home-page-nav" part="navigation" aria-label="Primary navigation"><slot name="navigation"></slot></nav>
            <div class="home-page-actions" part="actions"><slot name="actions"></slot></div>
            <div class="home-page-menu-trigger" part="menu-trigger"><slot name="menu-trigger"></slot></div>
            <div class="home-page-mobile-menu" part="mobile-menu"><slot name="mobile-menu"></slot></div>
          </header>
          <main class="home-page-main" part="main">
            <div class="home-page-content">
              <section class="home-page-hero" part="hero"><slot name="hero"></slot></section>
              <slot name="main"></slot><slot></slot>
            </div>
          </main>
          <footer class="home-page-footer" part="footer"><slot name="footer"></slot></footer>
        </div>
      </div>
    `;
  }
}
export function register(): void {
  if (!customElements.get('el-dm-home-page'))
    customElements.define('el-dm-home-page', ElDmHomePage);
}
