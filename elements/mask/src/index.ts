import { ElDmMask } from './el-dm-mask.js';

export { ElDmMask };
export * from './el-dm-mask.js';

export function register(): void {
  if (!customElements.get('el-dm-mask')) {
    customElements.define('el-dm-mask', ElDmMask);
  }
}
