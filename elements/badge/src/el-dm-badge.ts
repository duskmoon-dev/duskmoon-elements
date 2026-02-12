/**
 * DuskMoon Badge Element
 *
 * A badge component for displaying status indicators, counts, or labels.
 * Uses styles from @duskmoon-dev/core for consistent theming.
 *
 * @element el-dm-badge
 *
 * @attr {string} variant - Badge variant: filled, outlined, soft
 * @attr {string} color - Badge color: primary, secondary, tertiary, success, warning, error, info
 * @attr {string} size - Badge size: sm, md, lg
 * @attr {boolean} pill - Whether to use pill (rounded) shape
 * @attr {boolean} dot - Show as a dot indicator only
 *
 * @slot - Default slot for badge content
 *
 * @csspart badge - The badge container
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as badgeCSS } from '@duskmoon-dev/core/components/badge';

const VARIANT_CLASSES: Record<string, string> = {
  filled: '',
  outlined: 'badge-outlined',
  soft: 'badge-soft',
};

const COLOR_CLASSES: Record<string, string> = {
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  tertiary: 'badge-tertiary',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
};

const SIZE_CLASSES: Record<string, string> = {
  sm: 'badge-sm',
  md: '',
  lg: 'badge-lg',
};

export type BadgeVariant = 'filled' | 'outlined' | 'soft';
export type BadgeColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

// Strip @layer wrapper for Shadow DOM compatibility
const coreStyles = badgeCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: inline-flex;
    vertical-align: middle;
  }

  :host([hidden]) {
    display: none !important;
  }

  ${coreStyles}

  .badge {
    font-family: inherit;
  }

  .badge-dot {
    width: 0.5rem;
    height: 0.5rem;
    padding: 0;
    min-width: unset;
    border-radius: 50%;
  }

  .badge-dot.badge-sm {
    width: 0.375rem;
    height: 0.375rem;
  }

  .badge-dot.badge-lg {
    width: 0.625rem;
    height: 0.625rem;
  }
`;

export class ElDmBadge extends BaseElement {
  static properties = {
    variant: { type: String, reflect: true, default: 'filled' },
    color: { type: String, reflect: true, default: 'primary' },
    size: { type: String, reflect: true },
    pill: { type: Boolean, reflect: true },
    dot: { type: Boolean, reflect: true },
  };

  declare variant: BadgeVariant;
  declare color: BadgeColor;
  declare size: BadgeSize;
  declare pill: boolean;
  declare dot: boolean;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  private _getBadgeClasses(): string {
    const classes = ['badge'];

    if (this.variant && VARIANT_CLASSES[this.variant]) {
      classes.push(VARIANT_CLASSES[this.variant]);
    }

    if (this.color && COLOR_CLASSES[this.color]) {
      classes.push(COLOR_CLASSES[this.color]);
    }

    if (this.size && SIZE_CLASSES[this.size]) {
      classes.push(SIZE_CLASSES[this.size]);
    }

    if (this.pill) {
      classes.push('badge-pill');
    }

    if (this.dot) {
      classes.push('badge-dot');
    }

    return classes.join(' ');
  }

  render(): string {
    const badgeClasses = this._getBadgeClasses();

    return `
      <span class="${badgeClasses}" part="badge">
        ${this.dot ? '' : '<slot></slot>'}
      </span>
    `;
  }
}
