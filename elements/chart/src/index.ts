/**
 * @duskmoon-dev/el-chart
 *
 * DuskMoon Chart custom element
 */

import { ElDmChart } from './el-dm-chart.js';

export { ElDmChart };
export type {
  ChartColor,
  ChartData,
  ChartDataset,
  ChartOptions,
  ChartSize,
  ChartType,
  ChartVariant,
} from './el-dm-chart.js';

/**
 * Register the el-dm-chart custom element
 *
 * @example
 * ```ts
 * import { register } from '@duskmoon-dev/el-chart';
 * register();
 * ```
 */
export function register(): void {
  if (!customElements.get('el-dm-chart')) {
    customElements.define('el-dm-chart', ElDmChart);
  }
}
