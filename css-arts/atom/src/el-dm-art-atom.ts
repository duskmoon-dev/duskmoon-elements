import { BaseElement, css } from '@duskmoon-dev/el-base';
import rawCss from '@duskmoon-dev/css-art/dist/art/atom.css' with { type: 'text' };

const coreCss = rawCss.replace(/@layer\s+css-art\s*\{/, '').replace(/\}\s*$/, '');

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
