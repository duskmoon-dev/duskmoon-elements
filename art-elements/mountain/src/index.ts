import { ElDmArtMountain } from './el-dm-art-mountain.js';

export { ElDmArtMountain };

export function register(): void {
  if (!customElements.get('el-dm-art-mountain')) {
    customElements.define('el-dm-art-mountain', ElDmArtMountain);
  }
}
