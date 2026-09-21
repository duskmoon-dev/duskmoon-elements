import { ElDmRadialProgress } from './el-dm-radial-progress.js';

export { ElDmRadialProgress };
export * from './el-dm-radial-progress.js';

export function register(): void {
  if (!customElements.get('el-dm-radial-progress')) {
    customElements.define('el-dm-radial-progress', ElDmRadialProgress);
  }
}
