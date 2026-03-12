import { BaseElement, css } from '@duskmoon-dev/el-base';
import rawCss from '@duskmoon-dev/css-art/dist/art/sun.css' with { type: 'text' };

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

export class ElDmArtSun extends BaseElement {
  static properties = {
    variant: { type: String, reflect: true, default: 'default' },
    size: { type: String, reflect: true },
    rays: { type: Boolean, reflect: true },
    pulse: { type: Boolean, reflect: true },
  };

  declare variant: string;
  declare size: string;
  declare rays: boolean;
  declare pulse: boolean;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    const classes = ['art-sun'];
    if (this.variant === 'sunset') classes.push('art-sun-sunset');
    if (this.rays) classes.push('art-sun-rays');
    if (this.size && this.size !== 'md') classes.push(`art-sun-${this.size}`);
    if (this.pulse) classes.push('art-sun-pulse');
    return `<div class="${classes.join(' ')}"></div>`;
  }
}
