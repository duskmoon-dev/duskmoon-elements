import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as toggleCSS } from '@duskmoon-dev/core/components/toggle-switch';

export type ToggleSwitchSize = 'xs' | 'sm' | 'md' | 'lg';
export type ToggleSwitchColor =
  'primary' | 'secondary' | 'tertiary' | 'info' | 'success' | 'warning' | 'error';
const escapeAttribute = (value: string): string =>
  value.replace(
    /[&"<>]/g,
    (character) => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' })[character]!,
  );
const SIZES = new Set(['xs', 'sm', 'md', 'lg']);
const COLORS = new Set(['primary', 'secondary', 'tertiary', 'info', 'success', 'warning', 'error']);
const coreStyles = toggleCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
const styles = css`
  :host {
    display: inline-flex;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreStyles} label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

export class ElDmToggleSwitch extends BaseElement {
  static properties = {
    checked: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    name: { type: String, reflect: true },
    value: { type: String, reflect: true },
    size: { type: String, reflect: true },
    color: { type: String, reflect: true },
    ghost: { type: Boolean, reflect: true },
  };
  declare checked: boolean;
  declare disabled: boolean;
  declare required: boolean;
  declare name: string;
  declare value: string;
  declare size: ToggleSwitchSize;
  declare color: ToggleSwitchColor;
  declare ghost: boolean;
  constructor() {
    super();
    this.attachStyles(styles);
  }
  private onChange = (event: Event): void => {
    this.checked = (event.target as HTMLInputElement).checked;
  };
  render(): string {
    const classes = ['toggle'];
    if (SIZES.has(this.size) && this.size !== 'md') classes.push(`toggle-${this.size}`);
    if (COLORS.has(this.color)) classes.push(`toggle-${this.color}`);
    if (this.ghost) classes.push('toggle-ghost');
    const ariaLabel = this.getAttribute('aria-label');
    return `<label part="label"><input part="input" class="${classes.join(' ')}" type="checkbox" role="switch" ${this.checked ? 'checked' : ''} ${this.disabled ? 'disabled' : ''} ${this.required ? 'required' : ''} ${this.name ? `name="${escapeAttribute(this.name)}"` : ''} ${this.value ? `value="${escapeAttribute(this.value)}"` : ''} ${ariaLabel ? `aria-label="${escapeAttribute(ariaLabel)}"` : ''}><slot></slot></label>`;
  }
  update(): void {
    super.update();
    this.shadowRoot.querySelector('input')?.addEventListener('change', this.onChange);
  }
}
