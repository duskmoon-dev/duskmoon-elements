/**
 * @duskmoon-dev/el-slider
 *
 * DuskMoon Slider custom element
 */

import { ElDmSlider } from './el-dm-slider.js';

export { ElDmSlider };
export type { SliderSize, SliderColor } from './el-dm-slider.js';

/**
 * Register the el-dm-slider custom element
 *
 * @example
 * ```ts
 * import { register } from '@duskmoon-dev/el-slider';
 * register();
 * ```
 */
export function register(): void {
  if (!customElements.get('el-dm-slider')) {
    customElements.define('el-dm-slider', ElDmSlider);
  }
}
