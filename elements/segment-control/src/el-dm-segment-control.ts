/**
 * @duskmoon-dev/el-segment-control
 *
 * A segmented button/toggle group component.
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as segmentControlCSS } from '@duskmoon-dev/core/components/segment-control';

const coreStyles = segmentControlCSS
  .replace(/@layer\s+components\s*\{/, '')
  .replace(/\}\s*$/, '');

export type SegmentControlColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'error';

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

export class ElDmSegmentControl extends BaseElement {
  static properties = {
    color: { type: String, reflect: true, default: 'primary' },
  };

  declare color: SegmentControlColor;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    const colorClass = `segment-control-${this.color || 'primary'}`;
    return `<div class="segment-control ${colorClass}"><slot></slot></div>`;
  }
}

export function register(): void {
  if (!customElements.get('el-dm-segment-control')) {
    customElements.define('el-dm-segment-control', ElDmSegmentControl);
  }
}
