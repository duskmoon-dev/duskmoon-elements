import { BaseElement, css } from '@duskmoon-dev/el-base';
import rawCss from '@duskmoon-dev/css-art/dist/art/snowball-preloader.css' with { type: 'text' };

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

export class ElDmArtSnowballPreloader extends BaseElement {
  static properties = {
    size: { type: String, reflect: true },
  };

  declare size: string;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    const classes = ['art-snowball-preloader'];
    if (this.size && this.size !== 'md') classes.push(`art-snowball-preloader-${this.size}`);
    return `
      <div class="${classes.join(' ')}">
        <div class="art-snowball-preloader-outer-ring"></div>
        <div class="art-snowball-preloader-inner-ring"></div>
        <div class="art-snowball-preloader-track-cover"></div>
        <div class="art-snowball-preloader-ball">
          <div class="art-snowball-preloader-ball-texture"></div>
          <div class="art-snowball-preloader-ball-outer-shadow"></div>
          <div class="art-snowball-preloader-ball-inner-shadow"></div>
          <div class="art-snowball-preloader-ball-side-shadows"></div>
        </div>
      </div>
    `;
  }
}
