import { ElDmArtMoon } from './el-dm-art-moon.js';

export { ElDmArtMoon };

export function register(): void {
  if (!customElements.get('el-dm-art-moon')) {
    customElements.define('el-dm-art-moon', ElDmArtMoon);
  }
}
