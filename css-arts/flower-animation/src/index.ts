import { ElDmArtFlowerAnimation } from './el-dm-art-flower-animation.js';

export { ElDmArtFlowerAnimation };

export function register(): void {
  if (!customElements.get('el-dm-art-flower-animation')) {
    customElements.define('el-dm-art-flower-animation', ElDmArtFlowerAnimation);
  }
}
