/**
 * @duskmoon-dev/el-breadcrumbs
 *
 * DuskMoon Breadcrumbs custom element
 */

import { ElDmBreadcrumbs } from './el-dm-breadcrumbs.js';

export { ElDmBreadcrumbs };
export type { BreadcrumbItem, NavigateEventDetail } from './el-dm-breadcrumbs.js';

/**
 * Register the el-dm-breadcrumbs custom element
 *
 * @example
 * ```ts
 * import { register } from '@duskmoon-dev/el-breadcrumbs';
 * register();
 * ```
 */
export function register(): void {
  if (!customElements.get('el-dm-breadcrumbs')) {
    customElements.define('el-dm-breadcrumbs', ElDmBreadcrumbs);
  }
}
