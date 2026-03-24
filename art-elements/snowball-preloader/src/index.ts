import { ElDmArtSnowballPreloader } from './el-dm-art-snowball-preloader.js';

export { ElDmArtSnowballPreloader };

export function register(): void {
  if (!customElements.get('el-dm-art-snowball-preloader')) {
    customElements.define('el-dm-art-snowball-preloader', ElDmArtSnowballPreloader);
  }
}
