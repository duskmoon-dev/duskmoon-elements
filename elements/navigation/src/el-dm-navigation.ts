import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as navigationCSS } from '@duskmoon-dev/core/components/navigation';

const coreStyles = navigationCSS
  .replace(/@layer\s+components\s*\{/, '')
  .replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: block;
  }

  :host([hidden]) {
    display: none !important;
  }

  ${coreStyles}
`;

export class ElDmNavigation extends BaseElement {
  static properties = {};

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    return `<div class="navigation"><slot></slot></div>`;
  }
}

export function register(): void {
  if (!customElements.get('el-dm-navigation')) {
    customElements.define('el-dm-navigation', ElDmNavigation);
  }
}
