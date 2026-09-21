import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as kbdCSS } from '@duskmoon-dev/core/components/kbd';

export type KbdSize = 'xs' | 'sm' | 'md' | 'lg';
export type KbdColor =
  'primary' | 'secondary' | 'tertiary' | 'info' | 'success' | 'warning' | 'error';
const SIZES: KbdSize[] = ['xs', 'sm', 'md', 'lg'];
const COLORS: KbdColor[] = [
  'primary',
  'secondary',
  'tertiary',
  'info',
  'success',
  'warning',
  'error',
];

const coreStyles = kbdCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
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

export class ElDmKbd extends BaseElement {
  static properties = {
    size: { type: String, reflect: true, default: 'md' },
    color: { type: String, reflect: true },
    ghost: { type: Boolean, reflect: true },
  };
  declare size: KbdSize;
  declare color: KbdColor;
  declare ghost: boolean;
  constructor() {
    super();
    this.attachStyles(styles);
  }
  render(): string {
    const classes = ['kbd'];
    if (SIZES.includes(this.size) && this.size !== 'md') classes.push(`kbd-${this.size}`);
    if (COLORS.includes(this.color)) classes.push(`kbd-${this.color}`);
    if (this.ghost) classes.push('kbd-ghost');
    return `<kbd class="${classes.join(' ')}" part="kbd"><slot></slot></kbd>`;
  }
}
