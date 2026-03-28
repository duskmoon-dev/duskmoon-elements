import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as formGroupCSS } from '@duskmoon-dev/core/components/form-group';

const coreStyles = formGroupCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

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

export class ElDmFormGroup extends BaseElement {
  static properties = {
    orientation: { type: String, reflect: true, default: 'vertical' },
  };

  declare orientation: 'vertical' | 'horizontal';

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    const orientationClass =
      this.orientation === 'horizontal' ? 'form-group form-group-horizontal' : 'form-group';
    return `
      <div class="${orientationClass}">
        <slot></slot>
      </div>
    `;
  }
}

export function register(): void {
  if (!customElements.get('el-dm-form-group')) {
    customElements.define('el-dm-form-group', ElDmFormGroup);
  }
}
