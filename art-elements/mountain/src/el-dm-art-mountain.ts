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
    size: { type: String, reflect: true },
  };

  declare size: string;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    const classes = ['art-mountain'];
    if (this.size && this.size !== 'md') classes.push(`art-mountain-${this.size}`);

    return `
      <div class="${classes.join(' ')}">
        <div class="mountains">
          <div class="mountain"></div>
          <div class="mountain"></div>
          <div class="mountain"></div>
          <div class="mountain"></div>
        </div>
        <div class="trees">
          <div class="tree"></div>
          <div class="tree"></div>
          <div class="tree"></div>
        </div>
        <div class="lights">
          <div class="borealis"></div>
          <div class="borealis"></div>
          <div class="borealis"></div>
          <div class="borealis"></div>
          <div class="borealis"></div>
          <div class="borealis"></div>
          <div class="borealis"></div>
          <div class="borealis"></div>
          <div class="borealis"></div>
        </div>
      </div>
    `;
  }
}
