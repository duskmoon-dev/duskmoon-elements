import { BaseElement, css } from '@duskmoon-dev/el-base';
import rawCss from '@duskmoon-dev/css-art/dist/art/csswitch.css' with { type: 'text' };

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

export class ElDmArtCsswitch extends BaseElement {
  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    return `
      <div class="art-csswitch">
        <div class="controller">
          <div class="lr rr"></div>
          <div class="lr"></div>
          <div class="volume"></div>
          <button class="minus"></button>
          <div class="mushroom round"></div>
          <div class="direction up arrow"></div>
          <div class="direction right arrow right"></div>
          <div class="direction down arrow down"></div>
          <div class="direction left arrow left"></div>
          <button class="home round"></button>
        </div>
        <div class="body">
          <div class="frame">
            <div class="screen"></div>
          </div>
        </div>
        <div class="controller right">
          <div class="lr rr"></div>
          <div class="lr"></div>
          <div class="mushroom round"></div>
          <div class="direction x"></div>
          <div class="direction y"></div>
          <div class="direction a"></div>
          <div class="direction b"></div>
          <button class="plus"></button>
          <div class="menu round"></div>
          <button class="home round"></button>
        </div>
      </div>
    `;
  }
}
