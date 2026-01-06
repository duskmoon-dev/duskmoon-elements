/**
 * @duskmoon-dev/el-switch
 *
 * DuskMoon Switch custom element
 */

import { ElDmSwitch } from './el-dm-switch.js';

export { ElDmSwitch };
export type { SwitchSize, SwitchColor } from './el-dm-switch.js';

/**
 * Register the el-dm-switch custom element
 *
 * @example
 * ```ts
 * import { register } from '@duskmoon-dev/el-switch';
 * register();
 * ```
 */
export function register(): void {
  if (!customElements.get('el-dm-switch')) {
    customElements.define('el-dm-switch', ElDmSwitch);
  }
}
