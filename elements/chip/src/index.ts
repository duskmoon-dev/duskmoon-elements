/**
 * @duskmoon-dev/el-chip
 *
 * DuskMoon Chip custom element
 */

import { ElDmChip } from './el-dm-chip.js';

export { ElDmChip };
export type { ChipVariant, ChipColor, ChipSize } from './el-dm-chip.js';

/**
 * Register the el-dm-chip custom element
 *
 * @example
 * ```ts
 * import { register } from '@duskmoon-dev/el-chip';
 * register();
 * ```
 */
export function register(): void {
  if (!customElements.get('el-dm-chip')) {
    customElements.define('el-dm-chip', ElDmChip);
  }
}
