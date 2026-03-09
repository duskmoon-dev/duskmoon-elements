/**
 * @duskmoon-dev/el-markdown-input
 *
 * A form-associated custom element providing a markdown editor with:
 * - Syntax-highlighted write mode (Prism.js, loaded from CDN)
 * - Preview mode with rendered HTML
 * - File upload via drag-and-drop, clipboard paste, or file picker
 * - @mention / #reference autocomplete
 * - Live word / character count status bar
 * - Phoenix LiveView hook (MarkdownInputHook)
 *
 * @example
 * ```ts
 * import { register } from '@duskmoon-dev/el-markdown-input';
 * register();
 * ```
 *
 * @example LiveView
 * ```js
 * import { MarkdownInputHook } from '@duskmoon-dev/el-markdown-input';
 * let liveSocket = new LiveSocket('/live', Socket, {
 *   hooks: { MarkdownInput: MarkdownInputHook }
 * });
 * ```
 */

export { ElDmMarkdownInput } from './element.js';
export type { Suggestion } from './types.js';

/**
 * Register the <el-dm-markdown-input> custom element.
 * Safe to call multiple times — guards against double registration.
 */
export function register(): void {
  if (!customElements.get('el-dm-markdown-input')) {
    // Dynamic import to avoid circular reference at module evaluation time
    import('./element.js').then(({ ElDmMarkdownInput }) => {
      customElements.define('el-dm-markdown-input', ElDmMarkdownInput);
    });
  }
}

// ── Phoenix LiveView Hook ────────────────────────────────────────────────────

type MarkdownInputEl = HTMLElement & {
  getValue(): string;
  setValue(s: string): void;
  dataset: DOMStringMap;
};

interface LiveViewHook {
  el: MarkdownInputEl;
  pushEvent(event: string, payload: Record<string, unknown>): void;
  mounted(): void;
  updated(): void;
}

/**
 * Phoenix LiveView hook that syncs the markdown editor value with the server.
 *
 * Usage:
 * ```js
 * import { MarkdownInputHook, register } from '@duskmoon-dev/el-markdown-input';
 * register();
 * let liveSocket = new LiveSocket('/live', Socket, {
 *   hooks: { MarkdownInput: MarkdownInputHook }
 * });
 * ```
 *
 * Template:
 * ```heex
 * <el-dm-markdown-input
 *   id="body-input"
 *   name="body"
 *   data-value={@content}
 *   phx-hook="MarkdownInput"
 * />
 * ```
 */
export const MarkdownInputHook: Pick<LiveViewHook, 'mounted' | 'updated'> = {
  mounted(this: LiveViewHook) {
    // Sync initial server value
    this.el.setValue(this.el.dataset.value ?? '');

    // Push editor changes to the LiveView process
    this.el.addEventListener('change', (e) => {
      const detail = (e as CustomEvent<{ value: string }>).detail;
      this.pushEvent('content_changed', { value: detail.value });
    });

    // Push upload-start events (server can handle server-side upload flow)
    this.el.addEventListener('upload-start', (e) => {
      const detail = (e as CustomEvent<{ file: File }>).detail;
      this.pushEvent('upload_file', { name: detail.file.name });
    });
  },

  updated(this: LiveViewHook) {
    // Server pushed a new value (e.g. after form reset or server-side update)
    const v = this.el.dataset.value;
    if (v !== undefined && v !== this.el.getValue()) {
      this.el.setValue(v);
    }
  },
};
