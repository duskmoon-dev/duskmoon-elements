/**
 * @duskmoon-dev/el-form
 *
 * DuskMoon Form custom element
 */

import { ElDmForm } from './el-dm-form.js';

export { ElDmForm };
export type { FormValidationState } from './el-dm-form.js';

/**
 * Register the el-dm-form custom element
 *
 * @example
 * ```ts
 * import { register } from '@duskmoon-dev/el-form';
 * register();
 * ```
 */
export function register(): void {
  if (!customElements.get('el-dm-form')) {
    customElements.define('el-dm-form', ElDmForm);
  }
}
