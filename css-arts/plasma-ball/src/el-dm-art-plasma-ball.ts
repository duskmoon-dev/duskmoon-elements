import { BaseElement, css } from '@duskmoon-dev/el-base';
import rawCss from '@duskmoon-dev/css-art/dist/art/plasma-ball.css' with { type: 'text' };

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

const rays = () => `
  <div class="rays">
    <div class="ray"><span></span><span></span><span></span></div>
    <div class="ray"><span></span><span></span><span></span></div>
    <div class="ray"><span></span><span></span><span></span></div>
    <div class="ray bigwave"><span></span><span></span><span></span></div>
    <div class="ray"><span></span><span></span><span></span></div>
  </div>
`;

export class ElDmArtPlasmaBall extends BaseElement {
  static properties = {
    size: { type: String, reflect: true },
  };

  declare size: string;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    const classes = ['art-plasma-ball'];
    if (this.size && this.size !== 'md') classes.push(`art-plasma-ball-${this.size}`);
    return `
      <div class="${classes.join(' ')}">
        <input type="checkbox" class="switcher" aria-label="Toggle plasma ball">
        <div class="glassball">
          <div class="electrode hide-electrode"></div>
          <div class="electrode"></div>
          ${rays()}
          ${rays()}
          ${rays()}
          ${rays()}
          ${rays()}
          ${rays()}
        </div>
        <div class="base">
          <div></div>
          <div></div>
          <span></span>
        </div>
        <div class="switch"></div>
      </div>
    `;
  }
}
