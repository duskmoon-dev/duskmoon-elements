import { ElDmArtCsswitch } from './el-dm-art-csswitch.js';

export { ElDmArtCsswitch };

export function register(): void {
  if (!customElements.get('el-dm-art-csswitch')) {
    customElements.define('el-dm-art-csswitch', ElDmArtCsswitch);
  }
}
