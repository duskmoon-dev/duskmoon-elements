import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as swapCSS } from '@duskmoon-dev/core/components/swap';
const escapeAttribute = (value: string): string =>
  value.replace(
    /[&"<>]/g,
    (character) => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' })[character]!,
  );

const coreStyles = swapCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
const styles = css`
  :host {
    display: inline-flex;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreStyles}
`;

export class ElDmSwap extends BaseElement {
  static properties = {
    checked: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    rotate: { type: Boolean, reflect: true },
    active: { type: Boolean, reflect: true },
    name: { type: String, reflect: true },
    value: { type: String, reflect: true },
  };
  declare checked: boolean;
  declare disabled: boolean;
  declare rotate: boolean;
  declare active: boolean;
  declare name: string;
  declare value: string;
  constructor() {
    super();
    this.attachStyles(styles);
  }
  private onChange = (event: Event): void => {
    this.checked = (event.target as HTMLInputElement).checked;
  };
  render(): string {
    const classes = ['swap'];
    if (this.rotate) classes.push('swap-rotate');
    if (this.active) classes.push('swap-active');
    const ariaLabel = this.getAttribute('aria-label');
    return `<label class="${classes.join(' ')}" part="swap">
      <input class="swap-input" part="input" type="checkbox" ${this.checked ? 'checked' : ''} ${this.disabled ? 'disabled' : ''} ${this.name ? `name="${escapeAttribute(this.name)}"` : ''} ${this.value ? `value="${escapeAttribute(this.value)}"` : ''} ${ariaLabel ? `aria-label="${escapeAttribute(ariaLabel)}"` : ''}>
      <span class="swap-on" part="on" aria-hidden="true"><slot name="on"></slot></span>
      <span class="swap-off" part="off" aria-hidden="true"><slot name="off"></slot></span>
    </label>`;
  }
  update(): void {
    super.update();
    this.shadowRoot.querySelector('input')?.addEventListener('change', this.onChange);
  }
}
