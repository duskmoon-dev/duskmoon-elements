import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as multiSelectCSS } from '@duskmoon-dev/core/components/multi-select';

const coreStyles = multiSelectCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: block;
    width: 100%;
  }

  :host([hidden]) {
    display: none !important;
  }

  ${coreStyles}
`;

export class ElDmMultiSelect extends BaseElement {
  static properties = {
    placeholder: { type: String, reflect: true, default: 'Select...' },
    disabled: { type: Boolean, reflect: true },
    color: { type: String, reflect: true, default: 'primary' },
  };

  declare placeholder: string;
  declare disabled: boolean;
  declare color: string;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    const colorClass =
      this.color && this.color !== 'primary' ? `multi-select-${this.color}` : 'multi-select-primary';
    return `
      <div class="multi-select ${colorClass}">
        <button type="button" class="multi-select-trigger" ${this.disabled ? 'disabled' : ''}>
          <span class="multi-select-placeholder">${this.placeholder}</span>
        </button>
        <slot></slot>
      </div>
    `;
  }
}

export function register(): void {
  if (!customElements.get('el-dm-multi-select')) {
    customElements.define('el-dm-multi-select', ElDmMultiSelect);
  }
}
