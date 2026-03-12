import { ElDmArtAtom } from './el-dm-art-atom.js';

export { ElDmArtAtom };

export function register(): void {
  if (!customElements.get('el-dm-art-atom')) {
    customElements.define('el-dm-art-atom', ElDmArtAtom);
  }
}
