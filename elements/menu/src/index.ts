/**
 * @duskmoon-dev/el-menu
 *
 * DuskMoon Menu custom elements
 */

import { ElDmMenu } from './el-dm-menu.js';
import { ElDmMenuItem } from './el-dm-menu.js';

export { ElDmMenu, ElDmMenuItem };

/**
 * Register the el-dm-menu and el-dm-menu-item custom elements
 *
 * @example
 * ```ts
 * import { register } from '@duskmoon-dev/el-menu';
 * register();
 * ```
 */
export function register(): void {
  if (!customElements.get('el-dm-menu')) {
    customElements.define('el-dm-menu', ElDmMenu);
  }
  if (!customElements.get('el-dm-menu-item')) {
    customElements.define('el-dm-menu-item', ElDmMenuItem);
  }
}
