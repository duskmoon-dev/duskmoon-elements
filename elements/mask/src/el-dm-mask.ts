import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as maskCSS } from '@duskmoon-dev/core/components/mask';

export type MaskShape = 'circle' | 'squircle' | 'square' | 'diamond' | 'hexagon' | 'triangle';
const SHAPES: MaskShape[] = ['circle', 'squircle', 'square', 'diamond', 'hexagon', 'triangle'];

const coreStyles = maskCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
const styles = css`
  :host {
    display: inline-block;
    max-width: 100%;
    vertical-align: middle;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreStyles}
  .mask ::slotted(*) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export class ElDmMask extends BaseElement {
  static properties = { shape: { type: String, reflect: true, default: 'circle' } };
  declare shape: MaskShape;
  constructor() {
    super();
    this.attachStyles(styles);
  }
  render(): string {
    const shape = SHAPES.includes(this.shape) ? this.shape : 'circle';
    return `<span class="mask mask-${shape}" part="mask"><slot></slot></span>`;
  }
}
