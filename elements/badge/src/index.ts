/**
 * @duskmoon-dev/el-badge
 *
 * DuskMoon Badge custom element
 */

import { ElDmBadge } from './el-dm-badge.js';

export { ElDmBadge };
export type { BadgeVariant, BadgeColor, BadgeSize } from './el-dm-badge.js';

/**
 * Register the el-dm-badge custom element
 *
 * @example
 * ```ts
 * import { register } from '@duskmoon-dev/el-badge';
 * register();
 * ```
 */
export function register(): void {
  if (!customElements.get('el-dm-badge')) {
    customElements.define('el-dm-badge', ElDmBadge);
  }
}
