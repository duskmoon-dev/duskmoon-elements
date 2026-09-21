/**
 * Grouped site navigation composed with a native popover.
 *
 * @element el-dm-megamenu
 * @attr {string} trigger-label - Accessible fallback trigger label.
 * @attr {boolean} full - Expand the panel to the available viewport width.
 * @slot trigger - Trigger content.
 * @slot - Megamenu panel content.
 * @slot mobile - Small-screen navigation fallback.
 */
import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as megamenuCSS } from '@duskmoon-dev/core/components/megamenu';

// Megamenu's generated CSS inlines Menu and Link, each with its own @layer block.
// Keep the layers intact; stripping only the outermost-looking braces would corrupt
// the imported component blocks.
const coreStyles = megamenuCSS;
const styles = css`
  :host {
    display: block;
    max-width: 100%;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreStyles}
`;
let nextMegamenuId = 0;
const escapeAttribute = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export class ElDmMegamenu extends BaseElement {
  static properties = {
    triggerLabel: { type: String, reflect: true, attribute: 'trigger-label', default: 'Open menu' },
    full: { type: Boolean, reflect: true },
  };
  declare triggerLabel: string;
  declare full: boolean;
  private readonly panelId = `el-dm-megamenu-panel-${++nextMegamenuId}`;
  private readonly anchorName = `--el-dm-megamenu-anchor-${nextMegamenuId}`;

  constructor() {
    super();
    this.attachStyles(styles);
  }
  render(): string {
    const panelClass = this.full ? 'megamenu-panel megamenu-panel-full' : 'megamenu-panel';
    return `
      <nav class="megamenu" part="megamenu" aria-label="Site navigation" style="--megamenu-anchor: ${this.anchorName}">
        <div class="megamenu-desktop" part="desktop">
          <ul class="megamenu-bar">
            <li>
              <button class="megamenu-trigger" part="trigger" type="button"
                popovertarget="${this.panelId}" aria-label="${escapeAttribute(this.triggerLabel || 'Open menu')}">
                <slot name="trigger">Menu</slot>
              </button>
              <div id="${this.panelId}" class="${panelClass}" part="panel" popover>
                <div class="megamenu-grid" part="grid"><slot></slot></div>
              </div>
            </li>
          </ul>
        </div>
        <div class="megamenu-mobile" part="mobile"><slot name="mobile"></slot></div>
      </nav>
    `;
  }
}
export function register(): void {
  if (!customElements.get('el-dm-megamenu')) customElements.define('el-dm-megamenu', ElDmMegamenu);
}
