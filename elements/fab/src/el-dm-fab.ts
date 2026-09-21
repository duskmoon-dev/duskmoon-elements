import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as buttonCSS } from '@duskmoon-dev/core/components/button';
import { css as fabCSS } from '@duskmoon-dev/core/components/fab';
const escapeAttribute = (value: string): string =>
  value.replace(
    /[&"<>]/g,
    (character) => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' })[character]!,
  );

const stripLayer = (value: string): string =>
  value.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
const styles = css`
  :host {
    display: contents;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${stripLayer(buttonCSS)}
  ${stripLayer(fabCSS)}
`;

export class ElDmFab extends BaseElement {
  static properties = {
    start: { type: Boolean, reflect: true },
    contained: { type: Boolean, reflect: true },
    extended: { type: Boolean, reflect: true },
    label: { type: String, reflect: true, default: 'Open actions' },
    disabled: { type: Boolean, reflect: true },
  };

  declare start: boolean;
  declare contained: boolean;
  declare extended: boolean;
  declare label: string;
  declare disabled: boolean;
  readonly #actionsId = `fab-${Math.random().toString(36).slice(2)}`;

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

  render(): string {
    const classes = ['fab', 'fab-speed-dial'];
    if (this.start) classes.push('fab-start');
    if (this.contained) classes.push('fab-contained');
    const trigger = ['btn', 'btn-primary', 'fab-trigger'];
    if (this.extended) trigger.push('fab-extended');
    else trigger.push('btn-icon');
    return `<div class="${classes.join(' ')}" part="fab">
      <button class="${trigger.join(' ')}" part="trigger" type="button" aria-label="${escapeAttribute(this.label)}" popovertarget="${this.#actionsId}" ${this.disabled ? 'disabled' : ''}>
        <slot name="trigger">+</slot>
      </button>
      <div class="fab-actions" part="actions" id="${this.#actionsId}" popover="auto"><slot></slot></div>
    </div>`;
  }
}
