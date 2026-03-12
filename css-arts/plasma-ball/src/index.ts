import { ElDmArtPlasmaBall } from './el-dm-art-plasma-ball.js';

export { ElDmArtPlasmaBall };

export function register(): void {
  if (!customElements.get('el-dm-art-plasma-ball')) {
    customElements.define('el-dm-art-plasma-ball', ElDmArtPlasmaBall);
  }
}
