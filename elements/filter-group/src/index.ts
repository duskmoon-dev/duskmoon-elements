import { ElDmFilterGroup } from './el-dm-filter-group.js';
export { ElDmFilterGroup };
export type { FilterGroupColor } from './el-dm-filter-group.js';
export function register(): void {
  if (!customElements.get('el-dm-filter-group'))
    customElements.define('el-dm-filter-group', ElDmFilterGroup);
}
