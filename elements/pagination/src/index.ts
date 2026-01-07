/**
 * @duskmoon-dev/el-pagination
 *
 * DuskMoon Pagination custom element
 */

import { ElDmPagination } from './el-dm-pagination.js';

export { ElDmPagination };

/**
 * Register the el-dm-pagination custom element
 *
 * @example
 * ```ts
 * import { register } from '@duskmoon-dev/el-pagination';
 * register();
 * ```
 */
export function register(): void {
  if (!customElements.get('el-dm-pagination')) {
    customElements.define('el-dm-pagination', ElDmPagination);
  }
}
