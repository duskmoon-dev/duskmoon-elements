import { BaseElement, css } from '@duskmoon-dev/el-base';
import rawCss from '@duskmoon-dev/css-art/dist/art/mountain.css' with { type: 'text' };

const layerMatch = rawCss.match(/@layer\s+css-art\s*\{([\s\S]*)\}\s*$/);
const coreCss = layerMatch ? layerMatch[1] : rawCss;

const styles = css`
  :host {
    display: inline-block;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreCss}
`;

export class ElDmArtMountain extends BaseElement {
  static properties = {
    variant: { type: String, reflect: true, default: 'single' },
    size: { type: String, reflect: true },
  };

  declare variant: string;
  declare size: string;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    const isRange = this.variant === 'range';
    const classes = ['art-mountain'];
    if (isRange) classes.push('art-mountain-range');
    if (this.variant === 'sunset') classes.push('art-mountain-sunset');
    if (this.variant === 'forest') classes.push('art-mountain-forest');
    if (this.size && this.size !== 'md') classes.push(`art-mountain-${this.size}`);

    if (isRange) {
      return `
        <div class="${classes.join(' ')}">
          <div class="art-peak"></div>
          <div class="art-peak"></div>
          <div class="art-peak"></div>
        </div>
      `;
    }
    return `<div class="${classes.join(' ')}"></div>`;
  }
}
