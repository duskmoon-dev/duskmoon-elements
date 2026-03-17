import { ElDmCodeBlock } from './el-dm-code-block.js';

export { ElDmCodeBlock };

export function register(): void {
  if (!customElements.get('el-dm-code-block')) {
    customElements.define('el-dm-code-block', ElDmCodeBlock);
  }
}
