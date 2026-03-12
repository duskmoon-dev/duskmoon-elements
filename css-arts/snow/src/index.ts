import { ElDmArtSnow } from './el-dm-art-snow.js';

export { ElDmArtSnow };

export function register(): void {
  if (!customElements.get('el-dm-art-snow')) {
    customElements.define('el-dm-art-snow', ElDmArtSnow);
  }
}
