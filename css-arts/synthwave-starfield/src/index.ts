import { ElDmArtSynthwaveStarfield } from './el-dm-art-synthwave-starfield.js';

export { ElDmArtSynthwaveStarfield };

export function register(): void {
  if (!customElements.get('el-dm-art-synthwave-starfield')) {
    customElements.define('el-dm-art-synthwave-starfield', ElDmArtSynthwaveStarfield);
  }
}
