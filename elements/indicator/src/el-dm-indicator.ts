import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as indicatorCSS } from '@duskmoon-dev/core/components/indicator';

export type IndicatorVertical = 'top' | 'middle' | 'bottom';
export type IndicatorHorizontal = 'start' | 'center' | 'end';
const VERTICALS: IndicatorVertical[] = ['top', 'middle', 'bottom'];
const HORIZONTALS: IndicatorHorizontal[] = ['start', 'center', 'end'];

const coreStyles = indicatorCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
const styles = css`
  :host {
    display: inline-grid;
    max-width: 100%;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreStyles}
`;

export class ElDmIndicator extends BaseElement {
  static properties = {
    vertical: { type: String, reflect: true, default: 'top' },
    horizontal: { type: String, reflect: true, default: 'end' },
  };
  declare vertical: IndicatorVertical;
  declare horizontal: IndicatorHorizontal;
  constructor() {
    super();
    this.attachStyles(styles);
  }
  render(): string {
    const vertical = VERTICALS.includes(this.vertical) ? this.vertical : 'top';
    const horizontal = HORIZONTALS.includes(this.horizontal) ? this.horizontal : 'end';
    const classes = ['indicator-item', `indicator-${vertical}`, `indicator-${horizontal}`];
    return `<div class="indicator" part="indicator"><span class="${classes.join(' ')}" part="item"><slot name="indicator"></slot></span><slot></slot></div>`;
  }
}
