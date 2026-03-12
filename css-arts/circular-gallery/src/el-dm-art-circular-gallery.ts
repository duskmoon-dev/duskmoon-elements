import { BaseElement, css } from '@duskmoon-dev/el-base';
import rawCss from '@duskmoon-dev/css-art/dist/art/circular-gallery.css' with { type: 'text' };

// @property declaration lives outside @layer — split and preserve it
const layerMatch = rawCss.match(/@layer\s+css-art\s*\{([\s\S]*)\}\s*$/);
const propertyDecls = rawCss.slice(0, rawCss.indexOf('@layer'));
const coreCss = (layerMatch ? layerMatch[1] : rawCss);

const styles = css`
  :host {
    display: inline-block;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${propertyDecls}
  ${coreCss}
`;

const PLACEHOLDER_COLORS = [
  '#e8b4b8', '#a8d5e2', '#b8d8be', '#f7e0b5',
  '#c9b8e8', '#f5c6a0', '#b5d5c5', '#f0b8d0',
  '#b8c8e8', '#d5e8b5', '#e8d5b8', '#c8e8d5',
];

export class ElDmArtCircularGallery extends BaseElement {
  static properties = {
    size: { type: String, reflect: true },
    title: { type: String, reflect: true, default: 'Gallery' },
    count: { type: Number, reflect: true, default: 12 },
  };

  declare size: string;
  declare title: string;
  declare count: number;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    const classes = ['art-circular-gallery'];
    if (this.size && this.size !== 'md') classes.push(`art-circular-gallery-${this.size}`);
    const n = Math.max(3, Math.min(20, this.count || 12));
    const items = Array.from({ length: n }, (_, i) => {
      const color = PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length];
      return `<div style="--i:${i + 1}" data-title="Item ${i + 1}">
        <a href="#item-${i + 1}">
          <img src="" alt="Item ${i + 1}" style="background:${color};width:100%;height:100%;display:block;">
        </a>
      </div>`;
    }).join('\n');
    return `
      <div class="${classes.join(' ')}">
        <h1>${this.title}</h1>
        ${items}
      </div>
    `;
  }
}
