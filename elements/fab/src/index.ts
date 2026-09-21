import { ElDmFab } from './el-dm-fab.js';
export { ElDmFab };
export function register(): void {
  if (!customElements.get('el-dm-fab')) customElements.define('el-dm-fab', ElDmFab);
}
