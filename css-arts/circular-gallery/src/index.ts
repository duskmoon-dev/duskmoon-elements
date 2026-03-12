import { ElDmArtCircularGallery } from './el-dm-art-circular-gallery.js';

export { ElDmArtCircularGallery };

export function register(): void {
  if (!customElements.get('el-dm-art-circular-gallery')) {
    customElements.define('el-dm-art-circular-gallery', ElDmArtCircularGallery);
  }
}
