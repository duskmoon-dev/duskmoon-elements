import { BaseElement, css } from '@duskmoon-dev/el-base';
import rawCss from '@duskmoon-dev/css-art/dist/art/eclipse.css' with { type: 'text' };

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

export class ElDmArtEclipse extends BaseElement {
  static properties = {
    size: { type: String, reflect: true },
  };

  declare size: string;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    const classes = ['art-eclipse'];
    if (this.size && this.size !== 'md') classes.push(`art-eclipse-${this.size}`);
    return `
      <div class="${classes.join(' ')}">
        <div class="layer layer-1"></div>
        <div class="layer layer-2"></div>
        <div class="layer layer-3"></div>
        <div class="layer layer-4"></div>
        <div class="layer layer-5"></div>
        <div class="layer layer-6"></div>
      </div>
    `;
  }
}
