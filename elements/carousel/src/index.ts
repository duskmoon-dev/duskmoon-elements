import { ElDmCarousel } from './el-dm-carousel.js';

export { ElDmCarousel };
export * from './el-dm-carousel.js';

export function register(): void {
  if (!customElements.get('el-dm-carousel')) {
    customElements.define('el-dm-carousel', ElDmCarousel);
  }
}
