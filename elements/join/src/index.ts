import { ElDmJoin } from './el-dm-join.js';
export { ElDmJoin };
export type { JoinOrientation } from './el-dm-join.js';
export function register(): void {
  if (!customElements.get('el-dm-join')) customElements.define('el-dm-join', ElDmJoin);
}
