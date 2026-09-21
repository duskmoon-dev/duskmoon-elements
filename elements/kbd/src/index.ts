import { ElDmKbd } from './el-dm-kbd.js';

export { ElDmKbd };
export * from './el-dm-kbd.js';

export function register(): void {
  if (!customElements.get('el-dm-kbd')) {
    customElements.define('el-dm-kbd', ElDmKbd);
  }
}
