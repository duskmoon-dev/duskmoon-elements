import { ElDmLoading } from './el-dm-loading.js';

export { ElDmLoading };
export * from './el-dm-loading.js';

export function register(): void {
  if (!customElements.get('el-dm-loading')) {
    customElements.define('el-dm-loading', ElDmLoading);
  }
}
