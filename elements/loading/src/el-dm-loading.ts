import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as loadingCSS } from '@duskmoon-dev/core/components/loading';

export type LoadingShape = 'spinner' | 'dots' | 'bars';
export type LoadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LoadingColor =
  'primary' | 'secondary' | 'tertiary' | 'info' | 'success' | 'warning' | 'error';
const SHAPES: LoadingShape[] = ['spinner', 'dots', 'bars'];
const SIZES: LoadingSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
const COLORS: LoadingColor[] = [
  'primary',
  'secondary',
  'tertiary',
  'info',
  'success',
  'warning',
  'error',
];

const coreStyles = loadingCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
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

export class ElDmLoading extends BaseElement {
  static properties = {
    shape: { type: String, reflect: true, default: 'spinner' },
    size: { type: String, reflect: true, default: 'md' },
    color: { type: String, reflect: true },
  };
  declare shape: LoadingShape;
  declare size: LoadingSize;
  declare color: LoadingColor;
  constructor() {
    super();
    this.attachStyles(styles);
  }
  render(): string {
    const shape = SHAPES.includes(this.shape) ? this.shape : 'spinner';
    const size = SIZES.includes(this.size) ? this.size : 'md';
    const classes = ['loading', `loading-${shape}`, `loading-${size}`];
    if (COLORS.includes(this.color)) classes.push(`loading-${this.color}`);
    return `<span class="${classes.join(' ')}" part="loading" aria-hidden="true"></span>`;
  }
}
