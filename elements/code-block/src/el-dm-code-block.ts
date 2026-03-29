/**
 * DuskMoon Code Block Element
 *
 * A styled container for displaying code with optional header, language badge, and copy button.
 *
 * @element el-dm-code-block
 *
 * @attr {string} language - Language label shown in the header badge
 * @attr {string} title - Optional title shown in the header
 * @attr {boolean} copyable - Whether to show a copy button
 * @attr {boolean} compact - Use compact (reduced padding) styling
 * @attr {boolean} borderless - Remove borders
 *
 * @slot - Default slot for code content (place a <pre><code> here)
 *
 * @csspart container - The code-block container div
 * @csspart header - The header bar
 * @csspart content - The code content wrapper
 *
 * @fires copy - Fired when the copy button is clicked, detail: { text: string }
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';

const styles = css`
  :host {
    display: block;
  }
  :host([hidden]) {
    display: none !important;
  }

  .code-block {
    border: 1px solid var(--dm-border, #e0e0e0);
    border-radius: var(--dm-radius-md, 0.5rem);
    background: var(--dm-surface, #fafafa);
    color: var(--dm-on-surface, #1a1a1a);
    font-family: var(
      --dm-font-mono,
      ui-monospace,
      SFMono-Regular,
      Menlo,
      Monaco,
      Consolas,
      monospace
    );
    font-size: 0.875rem;
    line-height: 1.5;
    overflow: hidden;
  }

  .code-block-compact .code-content {
    padding: 0.5rem;
  }

  .code-block-borderless {
    border: none;
  }

  .code-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--dm-border, #e0e0e0);
    background: var(--dm-surface-container, #f0f0f0);
    font-size: 0.75rem;
  }

  .code-title {
    font-weight: 600;
    color: var(--dm-on-surface, #1a1a1a);
  }

  .code-language {
    margin-inline-start: auto;
    padding: 0.125rem 0.5rem;
    border-radius: var(--dm-radius-sm, 0.25rem);
    background: var(--dm-primary, #6750a4);
    color: var(--dm-on-primary, #fff);
    font-size: 0.6875rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .code-title + .code-language {
    margin-inline-start: 0;
  }

  .copy-button {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    margin-inline-start: auto;
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--dm-border, #e0e0e0);
    border-radius: var(--dm-radius-sm, 0.25rem);
    background: var(--dm-surface, #fafafa);
    color: var(--dm-on-surface-variant, #555);
    font-family: inherit;
    font-size: 0.6875rem;
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s;
  }

  .copy-button:hover {
    background: var(--dm-surface-container-high, #e0e0e0);
    color: var(--dm-on-surface, #1a1a1a);
  }

  .code-content {
    padding: 0;
  }

  ::slotted(pre) {
    margin: 0;
    padding: 1rem;
    background: transparent;
    overflow-x: auto;
  }

  ::slotted(code) {
    background: transparent;
    padding: 0;
  }
`;

const COPY_ICON = `<svg class="copy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;

const CHECK_ICON = `<svg class="copy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;

export class ElDmCodeBlock extends BaseElement {
  static properties = {
    language: { type: String, reflect: true },
    title: { type: String, reflect: true },
    copyable: { type: Boolean, reflect: true },
    compact: { type: Boolean, reflect: true },
    borderless: { type: Boolean, reflect: true },
  };

  declare language: string;
  declare title: string;
  declare copyable: boolean;
  declare compact: boolean;
  declare borderless: boolean;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  private _getSlottedText(): string {
    const slot = this.shadowRoot?.querySelector('slot:not([name])') as HTMLSlotElement | null;
    if (!slot) return '';
    return slot
      .assignedNodes({ flatten: true })
      .map((n) => n.textContent ?? '')
      .join('');
  }

  private async _handleCopy(): Promise<void> {
    const text = this._getSlottedText();
    try {
      await navigator.clipboard.writeText(text);
      this.emit('copy', { text });
      this._showCopied();
    } catch {
      // Clipboard API unavailable — silently ignore
    }
  }

  private _showCopied(): void {
    const btn = this.shadowRoot?.querySelector('.copy-button');
    if (!btn) return;
    btn.innerHTML = `${CHECK_ICON} Copied`;
    setTimeout(() => {
      btn.innerHTML = `${COPY_ICON} Copy`;
    }, 2000);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.shadowRoot?.addEventListener('click', (e) => {
      if ((e.target as Element)?.closest('.copy-button')) {
        this._handleCopy();
      }
    });
  }

  private _renderHeader(): string {
    const hasHeader = this.title || this.language || this.copyable;
    if (!hasHeader) return '';
    return `
      <div class="code-header" part="header">
        ${this.title ? `<span class="code-title">${this.title}</span>` : ''}
        ${this.language ? `<span class="code-language">${this.language}</span>` : ''}
        ${this.copyable ? `<button class="copy-button" type="button" aria-label="Copy code">${COPY_ICON} Copy</button>` : ''}
      </div>
    `;
  }

  render(): string {
    const classes = ['code-block'];
    if (this.compact) classes.push('code-block-compact');
    if (this.borderless) classes.push('code-block-borderless');

    return `
      <div class="${classes.join(' ')}" part="container">
        ${this._renderHeader()}
        <div class="code-content" part="content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
