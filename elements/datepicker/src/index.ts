/**
 * @duskmoon-dev/el-datepicker
 *
 * DuskMoon Datepicker custom element
 */

import { ElDmDatepicker } from './el-dm-datepicker.js';

export { ElDmDatepicker };
export type { DatepickerSize } from './el-dm-datepicker.js';

/**
 * Register the el-dm-datepicker custom element
 *
 * @example
 * ```ts
 * import { register } from '@duskmoon-dev/el-datepicker';
 * register();
 * ```
 */
export function register(): void {
  if (!customElements.get('el-dm-datepicker')) {
    customElements.define('el-dm-datepicker', ElDmDatepicker);
  }
}
