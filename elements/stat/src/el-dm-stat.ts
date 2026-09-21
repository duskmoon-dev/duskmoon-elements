import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as statCSS } from '@duskmoon-dev/core/components/stat';

export type StatColor =
  'primary' | 'secondary' | 'tertiary' | 'info' | 'success' | 'warning' | 'error';
const COLORS: StatColor[] = [
  'primary',
  'secondary',
  'tertiary',
  'info',
  'success',
  'warning',
  'error',
];

const coreStyles = statCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
const styles = css`
  :host {
    display: block;
    min-width: 0;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreStyles}
`;

export class ElDmStat extends BaseElement {
  static properties = { color: { type: String, reflect: true } };
  declare color: StatColor;
  constructor() {
    super();
    this.attachStyles(styles);
  }
  render(): string {
    const classes = ['stat'];
    if (COLORS.includes(this.color)) classes.push(`stat-${this.color}`);
    return `<div class="${classes.join(' ')}" part="stat">
      <div class="stat-title" part="title"><slot name="title"></slot></div>
      <div class="stat-value" part="value"><slot name="value"></slot></div>
      <div class="stat-desc" part="description"><slot name="description"></slot></div>
      <div class="stat-figure" part="figure"><slot name="figure"></slot></div>
      <div class="stat-actions" part="actions"><slot name="actions"></slot></div>
    </div>`;
  }
}
