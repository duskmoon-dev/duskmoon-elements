/**
 * Responsive authentication shell driven by its containing width.
 *
 * @element el-dm-sign-page
 * @slot aside - Brand, illustration, or supporting content.
 * @slot - Authentication form content.
 */
import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as signPageCSS } from '@duskmoon-dev/core/components/sign-page';

const coreStyles = signPageCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
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

export class ElDmSignPage extends BaseElement {
  constructor() {
    super();
    this.attachStyles(styles);
  }
  render(): string {
    return `
      <section class="sign-page" part="page">
        <div class="sign-page-frame" part="frame">
          <aside class="sign-page-aside" part="aside"><slot name="aside"></slot></aside>
          <main class="sign-page-main" part="main">
            <div class="sign-page-content" part="content"><slot></slot></div>
          </main>
        </div>
      </section>
    `;
  }
}
export function register(): void {
  if (!customElements.get('el-dm-sign-page'))
    customElements.define('el-dm-sign-page', ElDmSignPage);
}
