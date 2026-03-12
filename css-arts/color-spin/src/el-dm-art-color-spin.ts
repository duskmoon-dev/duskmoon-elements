import { BaseElement, css } from '@duskmoon-dev/el-base';
import rawCss from '@duskmoon-dev/css-art/dist/art/color-spin.css' with { type: 'text' };

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

export class ElDmArtColorSpin extends BaseElement {
  static properties = {
    size: { type: String, reflect: true },
  };

  declare size: string;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    const classes = ['art-color-spin'];
    if (this.size && this.size !== 'md') classes.push(`art-color-spin-${this.size}`);
    return `
      <div class="${classes.join(' ')}">
        <ul>
          <li style="--i:1"></li>
          <li style="--i:2"></li>
          <li style="--i:3"></li>
          <li style="--i:4"></li>
        </ul>
      </div>
    `;
  }
}
