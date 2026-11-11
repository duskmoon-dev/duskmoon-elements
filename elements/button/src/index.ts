/**
 * @duskmoon-dev/el-button
 *
 * DuskMoon Button custom element
 */

import { ElDmButton } from './el-dm-button.js';

export { ElDmButton };
export type { ButtonShape } from './el-dm-button.js';

/**
 * Register the el-dm-button custom element
 *
 * @example
 * ```ts
 * import { register } from '@duskmoon-dev/el-button';
 * register();
 * ```
 */
export function register(): void {
  if (!customElements.get('el-dm-button')) {
    customElements.define('el-dm-button', ElDmButton);
  }
}
