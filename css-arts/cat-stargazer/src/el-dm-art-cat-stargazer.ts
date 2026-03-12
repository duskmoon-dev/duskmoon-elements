import { BaseElement, css } from '@duskmoon-dev/el-base';
import rawCss from '@duskmoon-dev/css-art/dist/art/cat-stargazer.css' with { type: 'text' };

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

export class ElDmArtCatStargazer extends BaseElement {
  static properties = {
    size: { type: String, reflect: true },
  };

  declare size: string;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    const classes = ['art-cat-stargazer'];
    if (this.size && this.size !== 'md') classes.push(`art-cat-stargazer-${this.size}`);
    return `
      <div class="${classes.join(' ')}">
        <div class="moon"></div>
        <div class="cat">
          <div class="bubble"></div>
          <div class="backpack"></div>
          <div class="tail"></div>
          <div class="body">
            <div class="leg"></div>
            <div class="paw"></div>
            <div class="paw"></div>
          </div>
          <div class="ear"></div>
          <div class="ear"></div>
          <div class="head">
            <div class="whisker"></div>
            <div class="whisker"></div>
            <div class="whisker"></div>
            <div class="whisker"></div>
            <div class="nose"></div>
            <div class="eye"></div>
            <div class="eye"></div>
          </div>
        </div>
      </div>
    `;
  }
}
