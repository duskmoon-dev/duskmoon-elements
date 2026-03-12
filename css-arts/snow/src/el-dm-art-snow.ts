import { BaseElement, css } from '@duskmoon-dev/el-base';
import rawCss from '@duskmoon-dev/css-art/dist/art/snow.css' with { type: 'text' };

const coreCss = rawCss.replace(/@layer\s+css-art\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: block;
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 300px;
    background: transparent;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreCss}
`;

// Deterministic pseudo-random based on index
function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export class ElDmArtSnow extends BaseElement {
  static properties = {
    count: { type: Number, reflect: true, default: 20 },
    unicode: { type: Boolean, reflect: true },
    fall: { type: Boolean, reflect: true },
  };

  declare count: number;
  declare unicode: boolean;
  declare fall: boolean;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    const n = Math.max(1, Math.min(100, this.count || 20));
    const flakes = Array.from({ length: n }, (_, i) => {
      const left = Math.round(seededRand(i * 3) * 100);
      const top = Math.round(seededRand(i * 3 + 1) * 100);
      const size = Math.round(seededRand(i * 3 + 2) * 16 + 4);
      const duration = (3 + seededRand(i * 7) * 7).toFixed(1);
      const classes = ['art-snowflake'];
      if (this.unicode) classes.push('art-snowflake-unicode');
      if (this.fall) classes.push('art-snowflake-fall');
      const style = [
        `left:${left}%`,
        `top:${top}%`,
        `--art-snowflake-size:${size}px`,
        this.fall ? `--art-snowflake-duration:${duration}s` : '',
      ].filter(Boolean).join(';');
      return `<div class="${classes.join(' ')}" style="${style}"></div>`;
    }).join('\n');
    return flakes;
  }
}
