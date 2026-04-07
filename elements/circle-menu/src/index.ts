/**
 * @duskmoon-dev/el-circle-menu
 *
 * DuskMoon Circle Menu custom element — a radial navigation menu
 */

import { ElDmCircleMenu } from './el-dm-circle-menu.js';

export { ElDmCircleMenu };
export type { CircleMenuColor, CircleMenuSize } from './el-dm-circle-menu.js';

/**
 * Register the el-dm-circle-menu custom element
 *
 * @example
 * ```ts
 * import { register } from '@duskmoon-dev/el-circle-menu';
 * register();
 * ```
 */
export function register(): void {
  if (!customElements.get('el-dm-circle-menu')) {
    customElements.define('el-dm-circle-menu', ElDmCircleMenu);
  }
}
