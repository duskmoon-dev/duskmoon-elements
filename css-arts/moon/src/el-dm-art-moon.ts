import { BaseElement, css } from '@duskmoon-dev/el-base';
import rawCss from '@duskmoon-dev/css-art/dist/art/moon.css' with { type: 'text' };

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

export class ElDmArtMoon extends BaseElement {
  static properties = {
    variant: { type: String, reflect: true, default: 'full' },
    size: { type: String, reflect: true },
    glow: { type: Boolean, reflect: true },
  };

  declare variant: string;
  declare size: string;
  declare glow: boolean;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    const classes = ['art-moon'];
    if (this.variant === 'crescent') classes.push('art-moon-crescent');
    if (this.size && this.size !== 'md') classes.push(`art-moon-${this.size}`);
    if (this.glow) classes.push('art-moon-glow');
    return `<div class="${classes.join(' ')}"></div>`;
  }
}
