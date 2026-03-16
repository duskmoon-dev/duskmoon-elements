import { ElDmArtColorSpin } from './el-dm-art-color-spin.js';

export { ElDmArtColorSpin };

export function register(): void {
  if (!customElements.get('el-dm-art-color-spin')) {
    customElements.define('el-dm-art-color-spin', ElDmArtColorSpin);
  }
}
