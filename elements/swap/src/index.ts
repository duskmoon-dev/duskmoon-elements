import { ElDmSwap } from './el-dm-swap.js';
export { ElDmSwap };
export function register(): void {
  if (!customElements.get('el-dm-swap')) customElements.define('el-dm-swap', ElDmSwap);
}
