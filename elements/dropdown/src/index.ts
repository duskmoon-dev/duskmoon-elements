import { ElDmDropdown } from './el-dm-dropdown.js';
export { ElDmDropdown };
export type { DropdownPlacement } from './el-dm-dropdown.js';
export function register(): void {
  if (!customElements.get('el-dm-dropdown')) customElements.define('el-dm-dropdown', ElDmDropdown);
}
