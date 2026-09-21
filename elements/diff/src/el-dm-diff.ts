import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as diffCSS } from '@duskmoon-dev/core/components/diff';

export type DiffColor =
  'primary' | 'secondary' | 'tertiary' | 'info' | 'success' | 'warning' | 'error';
const COLORS: DiffColor[] = [
  'primary',
  'secondary',
  'tertiary',
  'info',
  'success',
  'warning',
  'error',
];

const coreStyles = diffCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
const styles = css`
  :host {
    display: block;
    max-width: 100%;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreStyles}
  .diff-before ::slotted(*), .diff-after ::slotted(*) {
    display: block;
    inline-size: 100%;
    block-size: 100%;
    object-fit: cover;
  }
`;

export class ElDmDiff extends BaseElement {
  static properties = {
    position: { type: Number, reflect: true, default: 50 },
    ratio: { type: String, reflect: true, default: '16 / 9' },
    static: { type: Boolean, reflect: true },
    color: { type: String, reflect: true },
  };
  declare position: number;
  declare ratio: string;
  declare static: boolean;
  declare color: DiffColor;
  constructor() {
    super();
    this.attachStyles(styles);
  }
  render(): string {
    const value = Math.max(0, Math.min(100, Number(this.position) || 0));
    const classes = ['diff'];
    if (this.static) classes.push('diff-static');
    if (COLORS.includes(this.color)) classes.push(`diff-${this.color}`);
    const ratio = /^\s*\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)?\s*$/.test(this.ratio)
      ? this.ratio
      : '16 / 9';
    return `<figure class="${classes.join(' ')}" part="diff" style="--diff-position: ${value}%; --diff-ratio: ${ratio}">
      <div class="diff-before" part="before"><slot name="before"></slot><span class="diff-label" part="before-label"><slot name="before-label"></slot></span></div>
      <div class="diff-after" part="after"><slot name="after"></slot><span class="diff-label" part="after-label"><slot name="after-label"></slot></span></div>
    </figure>`;
  }
}
