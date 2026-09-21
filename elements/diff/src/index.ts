import { ElDmDiff } from './el-dm-diff.js';

export { ElDmDiff };
export * from './el-dm-diff.js';

export function register(): void {
  if (!customElements.get('el-dm-diff')) {
    customElements.define('el-dm-diff', ElDmDiff);
  }
}
