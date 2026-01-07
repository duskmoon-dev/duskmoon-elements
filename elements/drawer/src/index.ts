import { ElDmDrawer } from './el-dm-drawer.js';

export { ElDmDrawer };
export type { DrawerPosition } from './el-dm-drawer.js';

export function register(): void {
  if (!customElements.get('el-dm-drawer')) {
    customElements.define('el-dm-drawer', ElDmDrawer);
  }
}
