import { ElDmArtEclipse } from './el-dm-art-eclipse.js';

export { ElDmArtEclipse };

export function register(): void {
  if (!customElements.get('el-dm-art-eclipse')) {
    customElements.define('el-dm-art-eclipse', ElDmArtEclipse);
  }
}
