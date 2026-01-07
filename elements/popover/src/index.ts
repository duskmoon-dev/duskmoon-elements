/**
 * @duskmoon-dev/el-popover
 *
 * DuskMoon Popover custom element
 */

import { ElDmPopover } from './el-dm-popover.js';

export { ElDmPopover };
export type {
  PopoverPlacement,
  PopoverTrigger,
} from './el-dm-popover.js';

/**
 * Register the el-dm-popover custom element
 *
 * @example
 * ```ts
 * import { register } from '@duskmoon-dev/el-popover';
 * register();
 * ```
 */
export function register(): void {
  if (!customElements.get('el-dm-popover')) {
    customElements.define('el-dm-popover', ElDmPopover);
  }
}
