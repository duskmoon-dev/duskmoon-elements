/**
 * @duskmoon-dev/el-stepper
 *
 * DuskMoon Stepper custom elements for multi-step progress indicators
 */

import { ElDmStepper, ElDmStep } from './el-dm-stepper.js';

export { ElDmStepper, ElDmStep };
export type { StepData, StepperOrientation, StepperColor } from './el-dm-stepper.js';

/**
 * Register the el-dm-stepper and el-dm-step custom elements
 *
 * @example
 * ```ts
 * import { register } from '@duskmoon-dev/el-stepper';
 * register();
 * ```
 */
export function register(): void {
  if (!customElements.get('el-dm-stepper')) {
    customElements.define('el-dm-stepper', ElDmStepper);
  }
  if (!customElements.get('el-dm-step')) {
    customElements.define('el-dm-step', ElDmStep);
  }
}
