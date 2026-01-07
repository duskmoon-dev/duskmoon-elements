import { ElDmBottomSheet } from './el-dm-bottom-sheet.js';

export { ElDmBottomSheet };

export function register(): void {
  if (!customElements.get('el-dm-bottom-sheet')) {
    customElements.define('el-dm-bottom-sheet', ElDmBottomSheet);
  }
}
