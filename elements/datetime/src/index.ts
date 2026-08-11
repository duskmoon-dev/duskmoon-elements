/**
 * @duskmoon-dev/el-datetime
 *
 * Display-only ISO date and datetime formatting custom element.
 */

import { ElDmDatetime } from './el-dm-datetime.js';

export { DEFAULT_DATETIME_FORMAT, ElDmDatetime } from './el-dm-datetime.js';

/** Register the el-dm-datetime custom element. */
export function register(): void {
  if (!customElements.get('el-dm-datetime')) {
    customElements.define('el-dm-datetime', ElDmDatetime);
  }
}
