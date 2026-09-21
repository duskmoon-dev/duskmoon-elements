import { ElDmStack } from './el-dm-stack.js';

export { ElDmStack };
export * from './el-dm-stack.js';

export function register(): void {
  if (!customElements.get('el-dm-stack')) {
    customElements.define('el-dm-stack', ElDmStack);
  }
}
