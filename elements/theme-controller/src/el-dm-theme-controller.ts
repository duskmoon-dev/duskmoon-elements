/**
 * @duskmoon-dev/el-theme-controller
 *
 * A presentational wrapper for CSS-based radio theme switching.
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as themeControllerCSS } from '@duskmoon-dev/core/components/theme-controller';

const coreStyles = themeControllerCSS
  .replace(/@layer\s+components\s*\{/, '')
  .replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: inline-flex;
    vertical-align: middle;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreStyles}
`;

export class ElDmThemeController extends BaseElement {
  static properties = {
    size: { type: String, reflect: true },
  };

  #name = `theme-${Math.random().toString(36).slice(2, 8)}`;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('slotchange', this.#onSlotChange);
    // Defer initial build so light DOM children are parsed
    queueMicrotask(() => this.#buildFromLightDOM());
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('slotchange', this.#onSlotChange);
  }

  #onSlotChange = (): void => {
    this.#buildFromLightDOM();
  };

  #buildFromLightDOM(): void {
    const inputs = this.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    if (inputs.length === 0) return;

    // Extract name from first radio (or use generated fallback)
    const name = inputs[0].name || this.#name;

    const items: { value: string; label: string; checked: boolean }[] = [];
    inputs.forEach((input) => {
      const label = input.closest('label');
      const text =
        label?.textContent?.replace(input.textContent || '', '').trim() || input.value;
      items.push({ value: input.value, label: text, checked: input.checked });
    });

    if (items.length === 0) return;

    const sizeClass =
      (this as unknown as { size: string }).size === 'sm'
        ? ' theme-controller-sm'
        : (this as unknown as { size: string }).size === 'lg'
          ? ' theme-controller-lg'
          : '';

    const shadow = this.shadowRoot;
    if (!shadow) return;

    const container = shadow.querySelector('.theme-controller');
    if (!container) return;

    container.className = `theme-controller${sizeClass}`;
    container.innerHTML = items
      .map(
        (item, i) =>
          `<input type="radio" class="theme-controller-item" name="${name}" value="${item.value}" id="${this.#name}-${i}"${item.checked ? ' checked' : ''} />` +
          `<label class="theme-controller-label" for="${this.#name}-${i}">${item.label}</label>`,
      )
      .join('');

    // Wire up change events to dispatch from host
    container.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        this.emit('change', { value: radio.value });
      });
    });
  }

  render(): string {
    return `<div class="theme-controller"><slot></slot></div>`;
  }
}

export function register(): void {
  if (!customElements.get('el-dm-theme-controller')) {
    customElements.define('el-dm-theme-controller', ElDmThemeController);
  }
}
