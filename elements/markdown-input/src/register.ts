/**
 * Auto-register el-dm-markdown-input custom element.
 *
 * @example
 * ```ts
 * import '@duskmoon-dev/el-markdown-input/register';
 * // <el-dm-markdown-input> is now available in HTML
 * ```
 */
import { ElDmMarkdownInput } from './element.js';

if (!customElements.get('el-dm-markdown-input')) {
  customElements.define('el-dm-markdown-input', ElDmMarkdownInput);
}
