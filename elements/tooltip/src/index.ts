/**
 * @duskmoon-dev/el-tooltip
 *
 * DuskMoon Tooltip custom element
 */

import { ElDmTooltip } from './el-dm-tooltip.js';

export { ElDmTooltip };
export type { TooltipPosition, TooltipTrigger } from './el-dm-tooltip.js';

/**
 * Register the el-dm-tooltip custom element
 *
 * @example
 * ```ts
 * import { register } from '@duskmoon-dev/el-tooltip';
 * register();
 * ```
 */
export function register(): void {
  if (!customElements.get('el-dm-tooltip')) {
    customElements.define('el-dm-tooltip', ElDmTooltip);
  }
}
