import { ElDmFileInput } from './el-dm-file-input.js';
export { ElDmFileInput };
export type { FileInputSize, FileInputColor } from './el-dm-file-input.js';
export function register(): void {
  if (!customElements.get('el-dm-file-input'))
    customElements.define('el-dm-file-input', ElDmFileInput);
}
