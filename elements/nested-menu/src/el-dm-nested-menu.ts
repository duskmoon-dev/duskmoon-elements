import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as nestedMenuCSS } from '@duskmoon-dev/core/components/nested-menu';

const coreStyles = nestedMenuCSS
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

export class ElDmNestedMenu extends BaseElement {
  static properties = {};

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    return `<ul class="nested-menu"><slot></slot></ul>`;
  }
}

export function register(): void {
  if (!customElements.get('el-dm-nested-menu')) {
    customElements.define('el-dm-nested-menu', ElDmNestedMenu);
  }
}
