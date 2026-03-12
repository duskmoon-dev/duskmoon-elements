import { ElDmArtSun } from './el-dm-art-sun.js';

export { ElDmArtSun };

export function register(): void {
  if (!customElements.get('el-dm-art-sun')) {
    customElements.define('el-dm-art-sun', ElDmArtSun);
  }
}
