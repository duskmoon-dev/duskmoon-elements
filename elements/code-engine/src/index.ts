/**
 * @duskmoon-dev/el-code-engine
 *
 * DuskMoon Code Engine custom element — a lightweight code editor
 * backed by @duskmoon-dev/code-engine (CodeMirror 6 fork).
 */

import { ElDmCodeEngine } from './el-dm-code-engine.js';

export { ElDmCodeEngine };
export type { CodeEngineTheme } from './el-dm-code-engine.js';

/**
 * Register the el-dm-code-engine custom element.
 *
 * @example
 * ```ts
 * import { register } from '@duskmoon-dev/el-code-engine';
 * register();
 * ```
 */
export function register(): void {
  if (!customElements.get('el-dm-code-engine')) {
    customElements.define('el-dm-code-engine', ElDmCodeEngine);
  }
}
