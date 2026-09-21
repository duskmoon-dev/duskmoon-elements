import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as dropdownCSS } from '@duskmoon-dev/core/components/dropdown';

export type DropdownPlacement = 'block-start' | 'block-end' | 'inline-start' | 'inline-end';
const escapeMarkup = (value: string): string =>
  value.replace(
    /[&"<>]/g,
    (character) => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' })[character]!,
  );

const coreStyles = dropdownCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
const styles = css`
  :host {
    display: inline-block;
    vertical-align: middle;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreStyles}
  .dropdown-trigger {
    font: inherit;
  }
`;

export class ElDmDropdown extends BaseElement {
  static properties = {
    placement: { type: String, reflect: true, default: 'block-end' },
    triggerLabel: { type: String, reflect: true, attribute: 'trigger-label', default: 'Open' },
    disabled: { type: Boolean, reflect: true },
  };

  declare placement: DropdownPlacement;
  declare triggerLabel: string;
  declare disabled: boolean;
  readonly #popoverId = `dropdown-${Math.random().toString(36).slice(2)}`;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  show(): void {
    this.shadowRoot.querySelector<HTMLElement>('[popover]')?.showPopover();
  }
  hide(): void {
    this.shadowRoot.querySelector<HTMLElement>('[popover]')?.hidePopover();
  }
  toggle(): void {
    this.shadowRoot.querySelector<HTMLElement>('[popover]')?.togglePopover();
  }

  render(): string {
    const placement = ['block-start', 'block-end', 'inline-start', 'inline-end'].includes(
      this.placement,
    )
      ? ` dropdown-${this.placement}`
      : '';
    return `<div class="dropdown${placement}" part="dropdown">
      <button class="dropdown-trigger" part="trigger" type="button" popovertarget="${this.#popoverId}" ${this.disabled ? 'disabled' : ''}>
        <slot name="trigger">${escapeMarkup(this.triggerLabel)}</slot>
      </button>
      <div class="dropdown-content" part="content" id="${this.#popoverId}" popover="auto"><slot></slot></div>
    </div>`;
  }
}
