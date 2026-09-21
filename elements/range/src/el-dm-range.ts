import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as rangeCSS } from '@duskmoon-dev/core/components/range';

export type RangeSize = 'xs' | 'sm' | 'md' | 'lg';
export type RangeColor =
  'primary' | 'secondary' | 'tertiary' | 'info' | 'success' | 'warning' | 'error';
const escapeAttribute = (value: string): string =>
  value.replace(
    /[&"<>]/g,
    (character) => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' })[character]!,
  );
const SIZES = new Set(['xs', 'sm', 'md', 'lg']);
const COLORS = new Set(['primary', 'secondary', 'tertiary', 'info', 'success', 'warning', 'error']);
const coreStyles = rangeCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
const styles = css`
  :host {
    display: block;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreStyles}
`;

export class ElDmRange extends BaseElement {
  static properties = {
    value: { type: Number, reflect: true, default: 0 },
    min: { type: Number, reflect: true, default: 0 },
    max: { type: Number, reflect: true, default: 100 },
    step: { type: Number, reflect: true, default: 1 },
    name: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
    color: { type: String, reflect: true },
  };
  declare value: number;
  declare min: number;
  declare max: number;
  declare step: number;
  declare name: string;
  declare disabled: boolean;
  declare size: RangeSize;
  declare color: RangeColor;
  constructor() {
    super();
    this.attachStyles(styles);
  }
  get input(): HTMLInputElement | null {
    return this.shadowRoot.querySelector('input');
  }
  private onInput = (event: Event): void => {
    this.value = Number((event.target as HTMLInputElement).value);
  };
  render(): string {
    const classes = ['range'];
    if (SIZES.has(this.size) && this.size !== 'md') classes.push(`range-${this.size}`);
    if (COLORS.has(this.color)) classes.push(`range-${this.color}`);
    const ariaLabel = this.getAttribute('aria-label');
    return `<input part="input" class="${classes.join(' ')}" type="range" value="${this.value}" min="${this.min}" max="${this.max}" step="${this.step}" ${this.name ? `name="${escapeAttribute(this.name)}"` : ''} ${this.disabled ? 'disabled' : ''} ${ariaLabel ? `aria-label="${escapeAttribute(ariaLabel)}"` : ''}>`;
  }
  update(): void {
    super.update();
    this.input?.addEventListener('input', this.onInput);
  }
}
