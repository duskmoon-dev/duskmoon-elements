/**
 * @duskmoon-dev/el-progress
 *
 * DuskMoon Progress custom element
 */

import { ElDmProgress } from './el-dm-progress.js';

export { ElDmProgress };
export type { ProgressColor, ProgressSize } from './el-dm-progress.js';

/**
 * Register the el-dm-progress custom element
 *
 * @example
 * ```ts
 * import { register } from '@duskmoon-dev/el-progress';
 * register();
 * ```
 */
export function register(): void {
  if (!customElements.get('el-dm-progress')) {
    customElements.define('el-dm-progress', ElDmProgress);
  }
}
