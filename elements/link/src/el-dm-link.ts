import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as linkCSS } from '@duskmoon-dev/core/components/link';

export type LinkColor = 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'inherit';
const escapeAttribute = (value: string): string =>
  value.replace(
    /[&"<>]/g,
    (character) => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' })[character]!,
  );
const COLORS = new Set(['primary', 'secondary', 'tertiary', 'neutral', 'inherit']);
const coreStyles = linkCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
const styles = css`
  :host {
    display: inline;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreStyles}
`;

export class ElDmLink extends BaseElement {
  static properties = {
    href: { type: String, reflect: true },
    target: { type: String, reflect: true },
    rel: { type: String, reflect: true },
    download: { type: String, reflect: true },
    color: { type: String, reflect: true },
    hover: { type: Boolean, reflect: true },
  };
  declare href: string;
  declare target: string;
  declare rel: string;
  declare download: string;
  declare color: LinkColor;
  declare hover: boolean;
  constructor() {
    super();
    this.attachStyles(styles);
  }
  render(): string {
    const classes = ['link'];
    if (this.hover) classes.push('link-hover');
    if (COLORS.has(this.color)) classes.push(`link-${this.color}`);
    const ariaLabel = this.getAttribute('aria-label');
    return `<a part="link" class="${classes.join(' ')}" ${this.href ? `href="${escapeAttribute(this.href)}"` : ''} ${this.target ? `target="${escapeAttribute(this.target)}"` : ''} ${this.rel ? `rel="${escapeAttribute(this.rel)}"` : ''} ${this.download !== undefined ? `download="${escapeAttribute(this.download || '')}"` : ''} ${ariaLabel ? `aria-label="${escapeAttribute(ariaLabel)}"` : ''}><slot></slot></a>`;
  }
}
