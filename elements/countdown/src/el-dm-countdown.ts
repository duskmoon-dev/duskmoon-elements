import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as countdownCSS } from '@duskmoon-dev/core/components/countdown';

export type CountdownSize = 'sm' | 'md' | 'lg';
export type CountdownColor =
  'primary' | 'secondary' | 'tertiary' | 'info' | 'success' | 'warning' | 'error';
const SIZES: CountdownSize[] = ['sm', 'md', 'lg'];
const COLORS: CountdownColor[] = [
  'primary',
  'secondary',
  'tertiary',
  'info',
  'success',
  'warning',
  'error',
];

const coreStyles = countdownCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
const styles = css`
  :host {
    display: inline-flex;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreStyles}
  .countdown > slot {
    display: contents;
  }
  .countdown ::slotted(.countdown-value) {
    display: inline-block;
    min-inline-size: 2ch;
    text-align: center;
    font-size: 2rem;
    line-height: 1.2;
    overflow-wrap: anywhere;
  }
  .countdown-sm ::slotted(.countdown-value) {
    font-size: 1rem;
  }
  .countdown-lg ::slotted(.countdown-value) {
    font-size: 3rem;
  }
`;

export class ElDmCountdown extends BaseElement {
  static properties = {
    size: { type: String, reflect: true, default: 'md' },
    color: { type: String, reflect: true },
    animated: { type: Boolean, reflect: true },
    transition: { type: Boolean, reflect: true },
  };
  declare size: CountdownSize;
  declare color: CountdownColor;
  declare animated: boolean;
  declare transition: boolean;
  constructor() {
    super();
    this.attachStyles(styles);
  }
  render(): string {
    const classes = ['countdown'];
    if (SIZES.includes(this.size) && this.size !== 'md') classes.push(`countdown-${this.size}`);
    if (COLORS.includes(this.color)) classes.push(`countdown-${this.color}`);
    if (this.animated) classes.push('countdown-animated');
    if (this.transition) classes.push('countdown-transition');
    return `<span class="${classes.join(' ')}" part="countdown"><slot></slot></span>`;
  }
}
