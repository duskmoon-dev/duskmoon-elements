import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as carouselCSS } from '@duskmoon-dev/core/components/carousel';

export type CarouselOrientation = 'horizontal' | 'vertical';
export type CarouselAlign = 'start' | 'center' | 'end';
export type CarouselColor =
  'primary' | 'secondary' | 'tertiary' | 'info' | 'success' | 'warning' | 'error';
const ORIENTATIONS: CarouselOrientation[] = ['horizontal', 'vertical'];
const ALIGNS: CarouselAlign[] = ['start', 'center', 'end'];
const COLORS: CarouselColor[] = [
  'primary',
  'secondary',
  'tertiary',
  'info',
  'success',
  'warning',
  'error',
];
const escapeAttribute = (value: string): string =>
  value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

const coreStyles = carouselCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
const styles = css`
  :host {
    display: block;
    min-width: 0;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreStyles}
  .carousel > slot {
    display: contents;
  }
  .carousel ::slotted(*) {
    flex: none;
    min-inline-size: 0;
    max-inline-size: 100%;
    scroll-snap-align: start;
    overflow-wrap: anywhere;
  }
  .carousel-center ::slotted(*) {
    scroll-snap-align: center;
  }
  .carousel-end ::slotted(*) {
    scroll-snap-align: end;
  }
`;

export class ElDmCarousel extends BaseElement {
  static properties = {
    orientation: { type: String, reflect: true, default: 'horizontal' },
    align: { type: String, reflect: true, default: 'start' },
    color: { type: String, reflect: true },
  };
  declare orientation: CarouselOrientation;
  declare align: CarouselAlign;
  declare color: CarouselColor;
  constructor() {
    super();
    this.attachStyles(styles);
  }
  render(): string {
    const orientation = ORIENTATIONS.includes(this.orientation) ? this.orientation : 'horizontal';
    const classes = ['carousel', `carousel-${orientation}`];
    if (ALIGNS.includes(this.align)) classes.push(`carousel-${this.align}`);
    if (COLORS.includes(this.color)) classes.push(`carousel-${this.color}`);
    const label = this.getAttribute('aria-label');
    const labelAttribute = label ? ` aria-label="${escapeAttribute(label)}"` : '';
    return `<div class="${classes.join(' ')}" part="carousel" tabindex="0"${labelAttribute}><slot></slot></div>`;
  }
}
