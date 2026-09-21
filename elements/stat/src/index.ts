import { ElDmStat } from './el-dm-stat.js';

export { ElDmStat };
export * from './el-dm-stat.js';

export function register(): void {
  if (!customElements.get('el-dm-stat')) {
    customElements.define('el-dm-stat', ElDmStat);
  }
}
