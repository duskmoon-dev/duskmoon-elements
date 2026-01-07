/**
 * @duskmoon-dev/el-tabs
 *
 * DuskMoon Tabs custom elements for tab navigation
 */

import { ElDmTabs, ElDmTab, ElDmTabPanel } from './el-dm-tabs.js';

export { ElDmTabs, ElDmTab, ElDmTabPanel };
export type { TabsVariant, TabsOrientation } from './el-dm-tabs.js';

/**
 * Register all tab-related custom elements
 *
 * @example
 * ```ts
 * import { register } from '@duskmoon-dev/el-tabs';
 * register();
 * ```
 */
export function register(): void {
  if (!customElements.get('el-dm-tabs')) {
    customElements.define('el-dm-tabs', ElDmTabs);
  }
  if (!customElements.get('el-dm-tab')) {
    customElements.define('el-dm-tab', ElDmTab);
  }
  if (!customElements.get('el-dm-tab-panel')) {
    customElements.define('el-dm-tab-panel', ElDmTabPanel);
  }
}
