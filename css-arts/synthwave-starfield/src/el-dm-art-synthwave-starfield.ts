import { BaseElement, css } from '@duskmoon-dev/el-base';
import rawCss from '@duskmoon-dev/css-art/dist/art/synthwave-starfield.css' with { type: 'text' };

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

export class ElDmArtSynthwaveStarfield extends BaseElement {
  static properties = {
    size: { type: String, reflect: true },
    paused: { type: Boolean, reflect: true },
  };

  declare size: string;
  declare paused: boolean;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    const classes = ['art-synthwave-starfield'];
    if (this.size && this.size !== 'md') classes.push(`art-synthwave-starfield-${this.size}`);
    if (this.paused) classes.push('art-synthwave-starfield-paused');
    return `
      <div class="${classes.join(' ')}">
        <div class="art-synthwave-starfield-lefrig art-synthwave-starfield-sides"></div>
        <div class="art-synthwave-starfield-topbot art-synthwave-starfield-sides"></div>
        <div class="art-synthwave-starfield-stars"></div>
        <div class="art-synthwave-starfield-stars"></div>
      </div>
    `;
  }
}
