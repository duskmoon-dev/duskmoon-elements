/**
 * @duskmoon-dev/el-file-upload
 *
 * DuskMoon File Upload custom element
 */

import { ElDmFileUpload } from './el-dm-file-upload.js';

export { ElDmFileUpload };
export type { FileUploadSize, UploadedFile } from './el-dm-file-upload.js';

/**
 * Register the el-dm-file-upload custom element
 *
 * @example
 * ```ts
 * import { register } from '@duskmoon-dev/el-file-upload';
 * register();
 * ```
 */
export function register(): void {
  if (!customElements.get('el-dm-file-upload')) {
    customElements.define('el-dm-file-upload', ElDmFileUpload);
  }
}
