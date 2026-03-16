import { BaseElement, css } from '@duskmoon-dev/el-base';
import rawCss from '@duskmoon-dev/css-art/dist/art/atom.css' with { type: 'text' };

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

export class ElDmArtAtom extends BaseElement {
  static properties = {
    size: { type: String, reflect: true },
  };

  declare size: string;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    const classes = ['art-atom'];
    if (this.size && this.size !== 'md') classes.push(`art-atom-${this.size}`);
    return `
      <div class="${classes.join(' ')}">
        <div class="electron electron-alpha"></div>
        <div class="electron electron-omega"></div>
        <div class="electron"></div>
      </div>
    `;
  }
}
