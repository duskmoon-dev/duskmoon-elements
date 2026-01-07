/**
 * @duskmoon-dev/el-navbar
 *
 * DuskMoon Navbar custom element
 */

import { ElDmNavbar } from './el-dm-navbar.js';

export { ElDmNavbar };
export type { NavbarColor } from './el-dm-navbar.js';

/**
 * Register the el-dm-navbar custom element
 *
 * @example
 * ```ts
 * import { register } from '@duskmoon-dev/el-navbar';
 * register();
 * ```
 */
export function register(): void {
  if (!customElements.get('el-dm-navbar')) {
    customElements.define('el-dm-navbar', ElDmNavbar);
  }
}
