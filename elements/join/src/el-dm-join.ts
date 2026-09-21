import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as joinCSS } from '@duskmoon-dev/core/components/join';

export type JoinOrientation = 'horizontal' | 'vertical';
const coreStyles = joinCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
const styles = css`
  :host {
    display: inline-flex;
    max-width: 100%;
    vertical-align: middle;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreStyles}
  ::slotted(*) {
    position: relative;
    flex: 0 1 auto;
  }
  :host(:not([orientation='vertical'])) ::slotted(*:not(:first-child)) {
    margin-inline-start: -1px;
  }
  :host(:not([orientation='vertical'])) ::slotted(*:not(:first-child):not(:last-child)) {
    border-radius: 0;
  }
  :host(:not([orientation='vertical'])) ::slotted(*:first-child:not(:last-child)) {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }
  :host(:not([orientation='vertical'])) ::slotted(*:last-child:not(:first-child)) {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }
  :host([orientation='vertical']) ::slotted(*:not(:first-child)) {
    margin-block-start: -1px;
  }
  :host([orientation='vertical']) ::slotted(*:not(:first-child):not(:last-child)) {
    border-radius: 0;
  }
  :host([orientation='vertical']) ::slotted(*:first-child:not(:last-child)) {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }
  :host([orientation='vertical']) ::slotted(*:last-child:not(:first-child)) {
    border-start-start-radius: 0;
    border-start-end-radius: 0;
  }
  ::slotted(*:hover),
  ::slotted(*:focus),
  ::slotted(*:focus-within) {
    z-index: 1;
  }
`;

export class ElDmJoin extends BaseElement {
  static properties = { orientation: { type: String, reflect: true, default: 'horizontal' } };
  declare orientation: JoinOrientation;
  constructor() {
    super();
    this.attachStyles(styles);
  }
  render(): string {
    const orientation = this.orientation === 'vertical' ? ' join-vertical' : ' join-horizontal';
    return `<div class="join${orientation}" part="join"><slot></slot></div>`;
  }
}
