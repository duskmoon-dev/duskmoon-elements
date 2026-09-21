import { ElDmRange } from './el-dm-range.js';
export { ElDmRange };
export type { RangeSize, RangeColor } from './el-dm-range.js';
export function register(): void {
  if (!customElements.get('el-dm-range')) customElements.define('el-dm-range', ElDmRange);
}
