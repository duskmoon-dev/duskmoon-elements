import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as fileInputCSS } from '@duskmoon-dev/core/components/file-input';

export type FileInputSize = 'xs' | 'sm' | 'md' | 'lg';
export type FileInputColor =
  'primary' | 'secondary' | 'tertiary' | 'info' | 'success' | 'warning' | 'error';
const escapeAttribute = (value: string): string =>
  value.replace(
    /[&"<>]/g,
    (character) => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' })[character]!,
  );
const SIZES = new Set(['xs', 'sm', 'md', 'lg']);
const COLORS = new Set(['primary', 'secondary', 'tertiary', 'info', 'success', 'warning', 'error']);
const coreStyles = fileInputCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
const styles = css`
  :host {
    display: block;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreStyles}
`;

export class ElDmFileInput extends BaseElement {
  static properties = {
    name: { type: String, reflect: true },
    accept: { type: String, reflect: true },
    multiple: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
    color: { type: String, reflect: true },
    ghost: { type: Boolean, reflect: true },
  };
  declare name: string;
  declare accept: string;
  declare multiple: boolean;
  declare required: boolean;
  declare disabled: boolean;
  declare size: FileInputSize;
  declare color: FileInputColor;
  declare ghost: boolean;
  constructor() {
    super();
    this.attachStyles(styles);
  }
  get input(): HTMLInputElement | null {
    return this.shadowRoot.querySelector('input');
  }
  get files(): FileList | null {
    return this.input?.files ?? null;
  }
  render(): string {
    const classes = ['file-input'];
    if (SIZES.has(this.size) && this.size !== 'md') classes.push(`file-input-${this.size}`);
    if (COLORS.has(this.color)) classes.push(`file-input-${this.color}`);
    if (this.ghost) classes.push('file-input-ghost');
    const ariaLabel = this.getAttribute('aria-label');
    return `<input part="input" class="${classes.join(' ')}" type="file" ${this.name ? `name="${escapeAttribute(this.name)}"` : ''} ${this.accept ? `accept="${escapeAttribute(this.accept)}"` : ''} ${this.multiple ? 'multiple' : ''} ${this.required ? 'required' : ''} ${this.disabled ? 'disabled' : ''} ${ariaLabel ? `aria-label="${escapeAttribute(ariaLabel)}"` : ''}>`;
  }
}
