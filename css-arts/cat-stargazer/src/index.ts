import { ElDmArtCatStargazer } from './el-dm-art-cat-stargazer.js';

export { ElDmArtCatStargazer };

export function register(): void {
  if (!customElements.get('el-dm-art-cat-stargazer')) {
    customElements.define('el-dm-art-cat-stargazer', ElDmArtCatStargazer);
  }
}
