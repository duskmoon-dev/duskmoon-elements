/**
 * @duskmoon-dev/el-bottom-navigation
 *
 * DuskMoon Bottom Navigation custom element
 */

import { ElDmBottomNavigation } from './el-dm-bottom-navigation.js';

export { ElDmBottomNavigation };
export type { BottomNavigationItem } from './el-dm-bottom-navigation.js';

/**
 * Register the el-dm-bottom-navigation custom element
 *
 * @example
 * ```ts
 * import { register } from '@duskmoon-dev/el-bottom-navigation';
 * register();
 * ```
 */
export function register(): void {
  if (!customElements.get('el-dm-bottom-navigation')) {
    customElements.define('el-dm-bottom-navigation', ElDmBottomNavigation);
  }
}
