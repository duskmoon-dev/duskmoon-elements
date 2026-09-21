import { ElDmToggleSwitch } from './el-dm-toggle-switch.js';
export { ElDmToggleSwitch };
export type { ToggleSwitchSize, ToggleSwitchColor } from './el-dm-toggle-switch.js';
export function register(): void {
  if (!customElements.get('el-dm-toggle-switch'))
    customElements.define('el-dm-toggle-switch', ElDmToggleSwitch);
}
