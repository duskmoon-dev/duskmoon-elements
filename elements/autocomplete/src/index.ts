/**
 * @duskmoon-dev/el-autocomplete
 *
 * DuskMoon Autocomplete custom element
 */

import { ElDmAutocomplete } from './el-dm-autocomplete.js';

export { ElDmAutocomplete };
export type { AutocompleteSize, AutocompleteOption } from './el-dm-autocomplete.js';

/**
 * Register the el-dm-autocomplete custom element
 *
 * @example
 * ```ts
 * import { register } from '@duskmoon-dev/el-autocomplete';
 * register();
 * ```
 */
export function register(): void {
  if (!customElements.get('el-dm-autocomplete')) {
    customElements.define('el-dm-autocomplete', ElDmAutocomplete);
  }
}
