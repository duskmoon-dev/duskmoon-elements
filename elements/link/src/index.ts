import { ElDmLink } from './el-dm-link.js';
export { ElDmLink };
export type { LinkColor } from './el-dm-link.js';
export function register(): void {
  if (!customElements.get('el-dm-link')) customElements.define('el-dm-link', ElDmLink);
}
