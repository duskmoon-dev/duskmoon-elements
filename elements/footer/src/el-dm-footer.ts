/**
 * Responsive, content-neutral footer composition.
 *
 * @element el-dm-footer
 * @attr {boolean} centered - Center content and text.
 * @attr {'auto'|'horizontal'|'vertical'} direction - Group flow.
 * @slot - Semantic footer groups such as nav and section elements.
 */
import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as footerCSS } from '@duskmoon-dev/core/components/footer';

const coreStyles = footerCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
const styles = css`
  :host {
    display: block;
    width: 100%;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreStyles}
  .footer > slot {
    display: contents;
  }
  .footer ::slotted(:is(nav, section, div)) {
    display: grid;
    align-content: start;
    gap: 0.75rem;
  }
`;
export type FooterDirection = 'auto' | 'horizontal' | 'vertical';

export class ElDmFooter extends BaseElement {
  static properties = {
    centered: { type: Boolean, reflect: true },
    direction: { type: String, reflect: true, default: 'auto' },
  };
  declare centered: boolean;
  declare direction: FooterDirection;

  constructor() {
    super();
    this.attachStyles(styles);
  }
  render(): string {
    const classes = [
      'footer',
      this.centered ? 'footer-center' : '',
      this.direction === 'horizontal' ? 'footer-horizontal' : '',
      this.direction === 'vertical' ? 'footer-vertical' : '',
    ]
      .filter(Boolean)
      .join(' ');
    return `<footer class="${classes}" part="footer"><slot></slot></footer>`;
  }
}
export function register(): void {
  if (!customElements.get('el-dm-footer')) customElements.define('el-dm-footer', ElDmFooter);
}
