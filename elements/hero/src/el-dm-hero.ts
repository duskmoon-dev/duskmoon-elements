/**
 * Layered hero composition with a presentation-neutral overlay.
 *
 * @element el-dm-hero
 * @attr {'start'|'center'|'end'} align - Logical content alignment.
 * @slot - Foreground hero content.
 * @slot overlay - Decorative background or overlay.
 */
import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as heroCSS } from '@duskmoon-dev/core/components/hero';

const coreStyles = heroCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
const styles = css`
  :host {
    display: block;
    width: 100%;
    min-width: 0;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreStyles}
  .hero-overlay ::slotted(*) {
    width: 100%;
    height: 100%;
  }
`;
export type HeroAlign = 'start' | 'center' | 'end';

export class ElDmHero extends BaseElement {
  static properties = { align: { type: String, reflect: true, default: 'center' } };
  declare align: HeroAlign;

  constructor() {
    super();
    this.attachStyles(styles);
  }
  render(): string {
    const align = ['start', 'end'].includes(this.align) ? this.align : 'center';
    return `
      <section class="hero hero-${align}" part="hero">
        <div class="hero-overlay" part="overlay" aria-hidden="true"><slot name="overlay"></slot></div>
        <div class="hero-content" part="content"><slot></slot></div>
      </section>
    `;
  }
}
export function register(): void {
  if (!customElements.get('el-dm-hero')) customElements.define('el-dm-hero', ElDmHero);
}
