import { ElDmAlert } from './el-dm-alert.js';

export { ElDmAlert };
export type { AlertType, AlertVariant } from './el-dm-alert.js';

export function register(): void {
  if (!customElements.get('el-dm-alert')) {
    customElements.define('el-dm-alert', ElDmAlert);
  }
}
