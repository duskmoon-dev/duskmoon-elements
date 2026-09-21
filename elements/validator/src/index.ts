import { ElDmValidator } from './el-dm-validator.js';
export { ElDmValidator };
export type { ValidatorState } from './el-dm-validator.js';
export function register(): void {
  if (!customElements.get('el-dm-validator'))
    customElements.define('el-dm-validator', ElDmValidator);
}
