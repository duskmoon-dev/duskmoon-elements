import { ElDmDialog } from './el-dm-dialog.js';

export { ElDmDialog };
export type { DialogSize } from './el-dm-dialog.js';

export function register(): void {
  if (!customElements.get('el-dm-dialog')) {
    customElements.define('el-dm-dialog', ElDmDialog);
  }
}
