import { ElDmCountdown } from './el-dm-countdown.js';

export { ElDmCountdown };
export * from './el-dm-countdown.js';

export function register(): void {
  if (!customElements.get('el-dm-countdown')) {
    customElements.define('el-dm-countdown', ElDmCountdown);
  }
}
