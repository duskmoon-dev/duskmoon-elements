import { ElDmIndicator } from './el-dm-indicator.js';

export { ElDmIndicator };
export * from './el-dm-indicator.js';

export function register(): void {
  if (!customElements.get('el-dm-indicator')) {
    customElements.define('el-dm-indicator', ElDmIndicator);
  }
}
