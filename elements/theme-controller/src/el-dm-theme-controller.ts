/**
 * @duskmoon-dev/el-theme-controller
 *
 * A presentational wrapper for CSS-based radio theme switching.
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as themeControllerCSS } from '@duskmoon-dev/core/components/theme-controller';

const coreStyles = themeControllerCSS
  .replace(/@layer\s+components\s*\{/, '')
  .replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: inline-flex;
    vertical-align: middle;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreStyles}
`;

export class ElDmThemeController extends BaseElement {
  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    return `<div class="theme-controller"><slot></slot></div>`;
  }
}

export function register(): void {
  if (!customElements.get('el-dm-theme-controller')) {
    customElements.define('el-dm-theme-controller', ElDmThemeController);
  }
}
