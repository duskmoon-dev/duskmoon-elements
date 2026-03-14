import { BaseElement, css } from '@duskmoon-dev/el-base';
import rawCss from '@duskmoon-dev/css-art/dist/art/flower-animation.css' with { type: 'text' };

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

const HEART_SVG = `<svg class="heart" viewBox="0 0 32 32"><path d="M23.6 2c-3.363 0-6.258 2.736-7.599 5.594-1.342-2.858-4.237-5.594-7.601-5.594-4.637 0-8.4 3.764-8.4 8.401 0 9.433 9.516 11.906 16.001 21.232 6.13-9.268 15.999-12.1 15.999-21.232 0-4.637-3.763-8.401-8.4-8.401z"></path></svg>`;

const lights = (count: number) =>
  Array.from(
    { length: count },
    (_, i) => `<div class="flower__light flower__light--${i + 1}"></div>`,
  ).join('');

const lineLeaves = (count: number) =>
  Array.from(
    { length: count },
    (_, i) => `<div class="flower__line__leaf flower__line__leaf--${i + 1}"></div>`,
  ).join('');

const flower = (num: number, leafsNum: number, lineLeafCount: number) => `
  <div class="flower flower--${num}">
    <div class="flower__leafs flower__leafs--${leafsNum}">
      <div class="flower__leaf flower__leaf--1"></div>
      <div class="flower__leaf flower__leaf--2"></div>
      <div class="flower__leaf flower__leaf--3"></div>
      <div class="flower__leaf flower__leaf--4"></div>
      <div class="flower__white-circle"></div>
      ${lights(8)}
    </div>
    <div class="flower__line">
      ${lineLeaves(lineLeafCount)}
    </div>
  </div>`;

const grassLeaves = (count: number) =>
  Array.from(
    { length: count },
    (_, i) => `<div class="flower__grass__leaf flower__grass__leaf--${i + 1}"></div>`,
  ).join('');

const grass = (variant: number) => `
  <div class="growing-grass">
    <div class="flower__grass flower__grass--${variant}">
      <div class="flower__grass--top"></div>
      <div class="flower__grass--bottom"></div>
      ${grassLeaves(8)}
      <div class="flower__grass__overlay"></div>
    </div>
  </div>`;

const grow = (d: string, inner: string) => `<div class="grow-ans" style="--d:${d}">${inner}</div>`;

const longG = (variant: number, delays: [string, string, string, string]) => `
  <div class="long-g long-g--${variant}">
    ${delays.map((d, i) => grow(d, `<div class="leaf leaf--${i}"></div>`)).join('')}
  </div>`;

const gFrontLeafs = (count: number) =>
  Array.from(
    { length: count },
    (_, i) =>
      `<div class="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--${i + 1}"><div class="flower__g-front__leaf"></div></div>`,
  ).join('');

const gFrLeafs = (count: number) =>
  Array.from(
    { length: count },
    (_, i) => `<div class="flower__g-fr__leaf flower__g-fr__leaf--${i + 1}"></div>`,
  ).join('');

const bubbles = (count: number) =>
  Array.from({ length: count }, () => `<div class="bubble">${HEART_SVG}</div>`).join('');

export class ElDmArtFlowerAnimation extends BaseElement {
  static properties = {
    size: { type: String, reflect: true },
  };

  declare size: string;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    const classes = ['art-flower-animation'];
    if (this.size && this.size !== 'md') classes.push(`art-flower-animation-${this.size}`);

    return `
      <div class="${classes.join(' ')}">
        <div class="night"></div>
        <div class="flowers">
          ${flower(1, 1, 6)}
          ${flower(2, 2, 4)}
          ${flower(3, 3, 4)}
          ${flower(4, 3, 4)}
          ${grow('1.2s', '<div class="flower__g-long"><div class="flower__g-long__top"></div><div class="flower__g-long__bottom"></div></div>')}
          ${grass(1)}
          ${grass(2)}
          ${grow('2.4s', '<div class="flower__g-right flower__g-right--1"><div class="leaf"></div></div>')}
          ${grow('2.8s', '<div class="flower__g-right flower__g-right--2"><div class="leaf"></div></div>')}
          ${grow('2.8s', `<div class="flower__g-front">${gFrontLeafs(8)}<div class="flower__g-front__line"></div></div>`)}
          ${grow('3.2s', `<div class="flower__g-fr"><div class="leaf"></div>${gFrLeafs(8)}</div>`)}
          ${longG(0, ['3s', '2.2s', '3.4s', '3.6s'])}
          ${longG(1, ['3.6s', '3.8s', '4s', '4.2s'])}
          ${longG(2, ['4s', '4.2s', '4.4s', '4.6s'])}
          ${longG(3, ['4s', '4.2s', '3s', '3.6s'])}
          ${longG(4, ['4s', '4.2s', '3s', '3.6s'])}
          ${longG(5, ['4s', '4.2s', '3s', '3.6s'])}
          ${longG(6, ['4.2s', '4.4s', '4.6s', '4.8s'])}
          ${longG(7, ['3s', '3.2s', '3.5s', '3.6s'])}
        </div>
        <div class="bubbles">
          ${bubbles(20)}
        </div>
      </div>
    `;
  }
}
