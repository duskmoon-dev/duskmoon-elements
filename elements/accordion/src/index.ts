/**
 * @duskmoon-dev/el-accordion
 *
 * DuskMoon Accordion custom element for expandable/collapsible panels
 */

import { ElDmAccordion, ElDmAccordionItem } from './el-dm-accordion.js';

export { ElDmAccordion, ElDmAccordionItem };

/**
 * Register the el-dm-accordion and el-dm-accordion-item custom elements
 *
 * @example
 * ```ts
 * import { register } from '@duskmoon-dev/el-accordion';
 * register();
 * ```
 */
export function register(): void {
  if (!customElements.get('el-dm-accordion')) {
    customElements.define('el-dm-accordion', ElDmAccordion);
  }
  if (!customElements.get('el-dm-accordion-item')) {
    customElements.define('el-dm-accordion-item', ElDmAccordionItem);
  }
}
