import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as stackCSS } from '@duskmoon-dev/core/components/stack';

export type StackDirection = 'top' | 'bottom' | 'start' | 'end';
const DIRECTIONS: StackDirection[] = ['top', 'bottom', 'start', 'end'];

const coreStyles = stackCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
const styles = css`
  :host {
    display: inline-grid;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreStyles}
  .stack > slot {
    display: contents;
  }
  .stack ::slotted(*) {
    grid-area: 1 / 1;
    position: relative;
    min-width: 0;
  }
  .stack ::slotted(:first-child) {
    z-index: 3;
  }
  .stack ::slotted(:nth-child(2)) {
    z-index: 2;
    inset-inline-start: var(--stack-inline-offset);
    inset-block-start: var(--stack-block-offset);
  }
  .stack ::slotted(:nth-child(n + 3)) {
    z-index: 1;
    inset-inline-start: calc(var(--stack-inline-offset) * 2);
    inset-block-start: calc(var(--stack-block-offset) * 2);
  }
`;

export class ElDmStack extends BaseElement {
  static properties = { direction: { type: String, reflect: true, default: 'bottom' } };
  declare direction: StackDirection;
  constructor() {
    super();
    this.attachStyles(styles);
  }
  render(): string {
    const direction = DIRECTIONS.includes(this.direction) ? this.direction : 'bottom';
    return `<div class="stack stack-${direction}" part="stack"><slot></slot></div>`;
  }
}
