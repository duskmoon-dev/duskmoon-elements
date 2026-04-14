/**
 * DuskMoon Markdown Input Element
 *
 * A form-associated custom element providing a markdown editor with:
 * - Write tab with syntax-highlighted render layer (Prism.js CDN)
 * - Preview tab with rendered HTML (.markdown-body from @duskmoon-dev/core)
 * - File upload via drag-and-drop, clipboard paste, or file picker
 * - @mention / #reference autocomplete dropdown
 * - Live word / character count status bar
 * - Phoenix LiveView hook (MarkdownInputHook, exported from index.ts)
 *
 * @element el-dm-markdown-input
 *
 * @attr {string}  name         Form field name
 * @attr {string}  value        Initial markdown content
 * @attr {string}  placeholder  Textarea placeholder (default: "Write markdown…")
 * @attr {boolean} disabled     Disables editing
 * @attr {boolean} readonly     Makes the editor read-only (value still submitted)
 * @attr {string}  upload-url   POST endpoint for file uploads
 * @attr {number}  max-words    Soft word cap shown in status bar
 * @attr {boolean} dark         Activates dark Prism theme + dark CSS variable defaults
 * @attr {boolean} no-preview   Hides the preview tab and toolbar; write-only mode
 *
 * @fires change          `{ value: string }` — on every input
 * @fires upload-start    `{ file: File }` — when a file is accepted
 * @fires upload-done     `{ file: File, url: string, markdown: string }` — on success
 * @fires upload-error    `{ file: File, error: string }` — on failure
 * @fires mention-query   `{ trigger: "@", query, resolve }` — on @word input
 * @fires reference-query `{ trigger: "#", query, resolve }` — on #word input
 */

import { BaseElement } from '@duskmoon-dev/el-base';
import { css as markdownBodyCSS } from '@duskmoon-dev/core/components/markdown-body';

import { elementStyles } from './css.js';
import { ensurePrism, highlightMarkdown, applyPrismTheme } from './highlight.js';
import { uploadFile, fileToMarkdown, isAcceptedType } from './upload.js';
import { detectTrigger, confirmSuggestion, renderDropdown } from './autocomplete.js';
import { handlePairKey, handleEnterKey, handleTabKey } from './pairs.js';
import { countWords, renderStatusCount } from './status-bar.js';
import type { Suggestion } from './types.js';

// Render pipeline is lazy-loaded — only imported when preview tab is first activated
import type { renderMarkdown as RenderFn, renderMermaidBlocks as MermaidFn } from './render.js';

// Strip @layer wrapper for Shadow DOM compatibility
const coreMarkdownStyles = markdownBodyCSS
  .replace(/@layer\s+components\s*\{/, '')
  .replace(/\}\s*$/, '');

// Inject core markdown-body styles as a constructable stylesheet
import { css } from '@duskmoon-dev/el-base';
const markdownBodySheet = css`
  ${coreMarkdownStyles}
`;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export class ElDmMarkdownInput extends BaseElement {
  static formAssociated = true as const;

  static properties = {
    name: { type: String, reflect: true, default: '' },
    value: { type: String, default: '' },
    placeholder: { type: String, reflect: true, default: 'Write markdown\u2026' },
    disabled: { type: Boolean, reflect: true },
    readonly: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    uploadUrl: { type: String, reflect: true, attribute: 'upload-url' },
    maxWords: { type: Number, reflect: true, attribute: 'max-words' },
    dark: { type: Boolean, reflect: true },
    livePreview: { type: Boolean, reflect: true, attribute: 'live-preview' },
    debounce: { type: Number, reflect: true, default: 300 },
    katexCssUrl: { type: String, reflect: true, attribute: 'katex-css-url' },
    mermaidSrc: { type: String, reflect: true, attribute: 'mermaid-src' },
    resize: { type: String, reflect: true, default: 'none' },
    noPreview: { type: Boolean, reflect: true, attribute: 'no-preview' },
  };

  declare name: string;
  declare value: string;
  declare placeholder: string;
  declare disabled: boolean;
  declare readonly: boolean;
  declare required: boolean;
  declare uploadUrl: string | undefined;
  declare maxWords: number | undefined;
  declare dark: boolean;
  declare livePreview: boolean;
  declare debounce: number;
  declare katexCssUrl: string | undefined;
  declare mermaidSrc: string | undefined;
  declare resize: 'none' | 'vertical' | 'horizontal' | 'both';
  declare noPreview: boolean;

  // ── ElementInternals for form association ────────────────────────────
  #internals!: ElementInternals;

  // ── Rendering state ──────────────────────────────────────────────────
  /** True after the first full render has populated the shadow DOM. */
  #initialized = false;

  /** Which tab is currently active. */
  #activeTab: 'write' | 'preview' = 'write';

  // ── Debounce timers ──────────────────────────────────────────────────
  #highlightTimer: ReturnType<typeof setTimeout> | null = null;
  #statusTimer: ReturnType<typeof setTimeout> | null = null;

  // ── DOM element refs (set after first render) ────────────────────────
  #textarea: HTMLTextAreaElement | null = null;
  #renderLayer: HTMLElement | null = null;
  #writeArea: HTMLElement | null = null;
  #previewBody: HTMLElement | null = null;
  #statusCount: HTMLElement | null = null;
  #acDropdown: HTMLElement | null = null;
  #uploadList: HTMLElement | null = null;
  #fileInput: HTMLInputElement | null = null;

  // ── Autocomplete state ───────────────────────────────────────────────
  #acSuggestions: Suggestion[] = [];
  #acSelectedIndex = -1;
  #acTriggerPos = -1;
  #acTrigger: '@' | '#' | null = null;
  /** Monotonically-increasing counter to discard out-of-order resolve() calls. */
  #acGeneration = 0;

  // ── Render pipeline (lazy-loaded) ───────────────────────────────────
  #prevDark = false;
  #renderFn: typeof RenderFn | null = null;
  #mermaidFn: typeof MermaidFn | null = null;
  #livePreviewTimer: ReturnType<typeof setTimeout> | null = null;
  #renderAbortController: AbortController | null = null;
  /** Source value from the last completed preview render — skip re-render if unchanged. */
  #lastRenderedSource: string | null = null;
  /** True once the KaTeX <link> stylesheet has been injected into the shadow root. */
  #katexCssInjected = false;

  // ── Upload state ─────────────────────────────────────────────────────
  #uploadIdCounter = 0;
  /** Files stored locally for form submission (used when upload-url is not set). */
  #attachedFiles: File[] = [];

  constructor() {
    super();
    // attachInternals() must be called in the constructor per HTML spec
    this.#internals = this.attachInternals();
    this.attachStyles([elementStyles, markdownBodySheet]);
  }

  // ════════════════════════════════════════════════════════════════════
  // Lifecycle
  // ════════════════════════════════════════════════════════════════════

  connectedCallback(): void {
    super.connectedCallback(); // triggers initial update() → render()
  }

  disconnectedCallback(): void {
    this.#renderAbortController?.abort();
    if (this.#livePreviewTimer !== null) clearTimeout(this.#livePreviewTimer);
    super.disconnectedCallback();
  }

  // ════════════════════════════════════════════════════════════════════
  // Rendering — override update() to protect the textarea after init
  // ════════════════════════════════════════════════════════════════════

  protected override update(): void {
    if (!this.#initialized) {
      // Full initial render — creates all DOM nodes
      super.update(); // calls render() → shadowRoot.innerHTML = content
      this.#initialized = true;
      this.#cacheDOMRefs();
      this.#attachEventHandlers();
      this.#initHighlight();

      // Restore initial value from reactive prop BEFORE updating status bar,
      // so that required+valueMissing validity is evaluated against the real
      // initial content rather than a transient empty textarea.
      const initVal = (this as unknown as { value: string }).value ?? '';
      if (this.#textarea) {
        this.#textarea.value = initVal;
        this.#syncFormValue();
        if (initVal) this.#scheduleHighlight();
      }
      this.#updateStatusBarNow();
      return;
    }

    // Incremental update — patch only specific DOM regions
    this.#patchDynamicRegions();
  }

  /**
   * Patch DOM regions that can change due to reactive property updates,
   * without replacing the textarea (which would lose state).
   */
  #patchDynamicRegions(): void {
    const ta = this.#textarea;
    if (!ta) return;

    // Sync simple attributes
    const placeholder =
      (this as unknown as { placeholder: string }).placeholder ?? 'Write markdown\u2026';
    ta.placeholder = placeholder;
    ta.disabled = !!(this as unknown as { disabled: boolean }).disabled;
    ta.readOnly = !!(this as unknown as { readonly: boolean }).readonly;

    const attachBtn = this.shadowRoot.querySelector<HTMLButtonElement>('.attach-btn');
    if (attachBtn) {
      attachBtn.disabled = ta.disabled || ta.readOnly;
    }

    // Sync value if the reactive prop was updated externally (e.g. attributeChangedCallback)
    const propVal = (this as unknown as { value: string }).value ?? '';
    if (propVal !== ta.value) {
      ta.value = propVal;
      this.#syncFormValue();
      this.#scheduleHighlight();
      // Re-render preview if the value changed while the preview tab is active
      if (this.#activeTab === 'preview' && this.#previewBody) {
        this.#renderPreview(propVal);
      }
    }

    // Update Prism theme when dark attribute changes
    const dark = !!(this as unknown as { dark: boolean }).dark;
    applyPrismTheme(this.shadowRoot, dark);

    // Re-render preview if dark attribute changed while preview tab is active
    // (mermaid diagrams use theme-dependent SVGs, code blocks need matching Prism theme)
    // Force=true bypasses the source cache so theme-sensitive renders always refresh.
    if (dark !== this.#prevDark) {
      this.#prevDark = dark;
      if (this.#activeTab === 'preview' && this.#previewBody) {
        this.#lastRenderedSource = null; // invalidate cache on theme change
        this.#renderPreview(ta.value);
      }
    }

    // Toggle toolbar visibility when noPreview changes
    const noPreview = !!(this as unknown as { noPreview: boolean }).noPreview;
    const toolbar = this.shadowRoot.querySelector('.toolbar');
    if (noPreview) {
      toolbar?.setAttribute('hidden', '');
      // Force back to write tab if preview is currently active
      if (this.#activeTab === 'preview') {
        this.#activeTab = 'write';
        this.#writeArea?.removeAttribute('hidden');
        this.#previewBody?.setAttribute('hidden', '');
      }
    } else {
      toolbar?.removeAttribute('hidden');
    }

    // Re-render status bar (maxWords may have changed)
    this.#updateStatusBarNow();
  }

  protected override render(): string {
    const ph = (this as unknown as { placeholder: string }).placeholder ?? 'Write markdown\u2026';
    const disabled = !!(this as unknown as { disabled: boolean }).disabled;
    const readonly = !!(this as unknown as { readonly: boolean }).readonly;
    const noPreview = !!(this as unknown as { noPreview: boolean }).noPreview;

    return `
      <div class="editor">
        <div class="toolbar" role="tablist" aria-label="Editor mode" ${noPreview ? 'hidden' : ''}>
          <button
            class="tab-btn"
            id="tab-write"
            data-tab="write"
            role="tab"
            aria-selected="true"
            aria-controls="write-panel"
            tabindex="0"
          >Write</button>
          <button
            class="tab-btn"
            id="tab-preview"
            data-tab="preview"
            role="tab"
            aria-selected="false"
            aria-controls="preview-panel"
            tabindex="-1"
          >Preview</button>
        </div>

        <div class="write-area" id="write-panel" role="tabpanel" aria-labelledby="tab-write">
          <div class="render-layer" aria-hidden="true"></div>
          <textarea
            aria-label="Markdown editor"
            aria-haspopup="listbox"
            aria-expanded="false"
            aria-autocomplete="list"
            aria-controls="ac-dropdown"
            placeholder="${escapeHtmlStr(ph)}"
            ${disabled ? 'disabled' : ''}
            ${readonly ? 'readonly' : ''}
            spellcheck="false"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
          ></textarea>
        </div>

        <div
          class="preview-body markdown-body"
          id="preview-panel"
          role="tabpanel"
          aria-labelledby="tab-preview"
          hidden
        ></div>

        <div class="status-bar">
          <slot name="bottom">
            <div class="status-bar-start">
              <slot name="bottom-start">
                <button class="attach-btn" type="button" aria-label="Attach files" ${disabled || readonly ? 'disabled' : ''}>
                  &#128206; Attach files
                </button>
              </slot>
            </div>
            <div class="status-bar-end">
              <slot name="bottom-end">
                <span class="status-bar-count" aria-live="polite"></span>
              </slot>
            </div>
          </slot>
          <input
            type="file"
            class="file-input"
            multiple
            accept="image/*,application/pdf,.zip,.txt,.csv,.json,.md"
            aria-hidden="true"
            tabindex="-1"
          >
        </div>

        <div class="upload-list"></div>
      </div>
      <ul id="ac-dropdown" class="ac-dropdown" role="listbox" aria-label="Suggestions" hidden></ul>
    `;
  }

  // ════════════════════════════════════════════════════════════════════
  // Post-render setup
  // ════════════════════════════════════════════════════════════════════

  #cacheDOMRefs(): void {
    this.#textarea = this.shadowRoot.querySelector('textarea');
    this.#renderLayer = this.shadowRoot.querySelector('.render-layer');
    this.#writeArea = this.shadowRoot.querySelector('.write-area');
    this.#previewBody = this.shadowRoot.querySelector('.preview-body');
    this.#statusCount = this.shadowRoot.querySelector('.status-bar-count');
    this.#acDropdown = this.shadowRoot.querySelector('.ac-dropdown');
    this.#uploadList = this.shadowRoot.querySelector('.upload-list');
    this.#fileInput = this.shadowRoot.querySelector('.file-input');
  }

  #attachEventHandlers(): void {
    const ta = this.#textarea;
    if (!ta) return;

    // ── Textarea input ─────────────────────────────────────────────
    ta.addEventListener('input', () => {
      this.#syncFormValue();
      this.emit('change', { value: ta.value });
      this.#scheduleHighlight();
      this.#scheduleStatusUpdate();
      this.#handleAutocompleteInput();
      this.#scheduleLivePreview();
    });

    // ── Close dropdown when focus leaves the textarea ──────────────
    ta.addEventListener('blur', () => {
      // Delay to allow pointer events on dropdown items to fire first
      setTimeout(() => {
        if (!this.shadowRoot?.activeElement) {
          this.#closeDropdown();
        }
      }, 150);
    });

    // ── Keydown: autocomplete nav, smart pairs, list/heading continuation ──
    ta.addEventListener('keydown', (e) => {
      // Autocomplete dropdown takes priority when open
      if (this.#acSuggestions.length > 0 && !this.#acDropdown?.hidden) {
        this.#handleDropdownKeydown(e);
        if (e.defaultPrevented) return;
      }

      // Ctrl+Shift+P (Windows/Linux) or Cmd+Shift+P (Mac) → toggle preview
      // Suppressed when no-preview is set.
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key === 'P' &&
        !(this as unknown as { noPreview: boolean }).noPreview
      ) {
        e.preventDefault();
        this.#switchTab(this.#activeTab === 'write' ? 'preview' : 'write');
        return;
      }

      // Skip smart editing when the editor is read-only or disabled
      if (
        (this as unknown as { disabled: boolean }).disabled ||
        (this as unknown as { readonly: boolean }).readonly
      ) {
        return;
      }

      // Smart pair insertion (backtick pairing)
      if (!e.ctrlKey && !e.metaKey && !e.altKey && handlePairKey(ta, e.key)) {
        e.preventDefault();
        this.#syncFormValue();
        this.emit('change', { value: ta.value });
        this.#scheduleHighlight();
        return;
      }

      // Tab indent / Shift+Tab de-indent
      if (e.key === 'Tab' && !e.ctrlKey && !e.metaKey) {
        if (handleTabKey(ta, e)) {
          this.#syncFormValue();
          this.emit('change', { value: ta.value });
          this.#scheduleHighlight();
        }
        return;
      }

      // List/heading Enter continuation
      if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (handleEnterKey(ta, e)) {
          this.#syncFormValue();
          this.emit('change', { value: ta.value });
          this.#scheduleHighlight();
          this.#scheduleStatusUpdate();
        }
      }
    });

    // ── Drag and drop ──────────────────────────────────────────────
    const writeArea = this.#writeArea;
    if (writeArea) {
      writeArea.addEventListener('dragover', (e) => {
        if ((this as unknown as { disabled: boolean }).disabled) return;
        if ((this as unknown as { readonly: boolean }).readonly) return;
        e.preventDefault();
        writeArea.style.opacity = '0.8';
      });
      writeArea.addEventListener('dragleave', () => {
        writeArea.style.opacity = '';
      });
      writeArea.addEventListener('drop', (e) => {
        e.preventDefault();
        writeArea.style.opacity = '';
        if ((this as unknown as { disabled: boolean }).disabled) return;
        if ((this as unknown as { readonly: boolean }).readonly) return;
        const files = Array.from(e.dataTransfer?.files ?? []).filter(isAcceptedType);
        files.forEach((f) => this.#startUpload(f));
      });
    }

    // ── Clipboard paste (images only) ─────────────────────────────
    ta.addEventListener('paste', (e) => {
      if ((this as unknown as { disabled: boolean }).disabled) return;
      if ((this as unknown as { readonly: boolean }).readonly) return;
      const imageFiles = Array.from(e.clipboardData?.files ?? []).filter((f) =>
        f.type.startsWith('image/'),
      );
      if (imageFiles.length > 0) {
        e.preventDefault();
        imageFiles.forEach((f) => this.#startUpload(f));
      }
    });

    // ── Tab buttons ────────────────────────────────────────────────
    const toolbar = this.shadowRoot.querySelector('.toolbar');
    toolbar?.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('.tab-btn');
      const tab = btn?.dataset.tab as 'write' | 'preview' | undefined;
      if (tab) this.#switchTab(tab);
    });

    // Arrow key navigation between tabs (WAI-ARIA tablist pattern)
    toolbar?.addEventListener('keydown', (e) => {
      const kev = e as KeyboardEvent;
      if (kev.key === 'ArrowLeft' || kev.key === 'ArrowRight') {
        kev.preventDefault();
        const nextTab = this.#activeTab === 'write' ? 'preview' : 'write';
        this.#switchTab(nextTab);
        const nextBtn = this.shadowRoot.querySelector<HTMLElement>(
          `.tab-btn[data-tab="${nextTab}"]`,
        );
        nextBtn?.focus();
      }
    });

    // ── Attach button ──────────────────────────────────────────────
    const attachBtn = this.shadowRoot.querySelector('.attach-btn');
    attachBtn?.addEventListener('click', () => this.#fileInput?.click());

    this.#fileInput?.addEventListener('change', () => {
      const files = Array.from(this.#fileInput?.files ?? []).filter(isAcceptedType);
      files.forEach((f) => this.#startUpload(f));
      if (this.#fileInput) this.#fileInput.value = '';
    });

    // ── Autocomplete dropdown click delegation ─────────────────────
    this.#acDropdown?.addEventListener('click', (e) => {
      const item = (e.target as HTMLElement).closest<HTMLElement>('[data-ac-index]');
      if (item) {
        const idx = parseInt(item.dataset.acIndex ?? '-1', 10);
        if (idx >= 0) {
          this.#acSelectedIndex = idx;
          this.#confirmAutocomplete();
        }
      }
    });
  }

  // ════════════════════════════════════════════════════════════════════
  // Highlight (Write tab render layer)
  // ════════════════════════════════════════════════════════════════════

  #initHighlight(): void {
    const dark = !!(this as unknown as { dark: boolean }).dark;
    applyPrismTheme(this.shadowRoot, dark);
    ensurePrism().then(() => {
      // Highlight immediately once Prism is ready
      if (this.#textarea && this.#renderLayer) {
        this.#renderLayer.innerHTML = highlightMarkdown(this.#textarea.value);
      }
    });
  }

  #scheduleHighlight(): void {
    if (this.#highlightTimer !== null) clearTimeout(this.#highlightTimer);
    this.#highlightTimer = setTimeout(() => {
      this.#highlightTimer = null;
      if (this.#renderLayer && this.#textarea) {
        this.#renderLayer.innerHTML = highlightMarkdown(this.#textarea.value);
      }
    }, 60);
  }

  // ════════════════════════════════════════════════════════════════════
  // Tab switching (Write ↔ Preview)
  // ════════════════════════════════════════════════════════════════════

  #switchTab(tab: 'write' | 'preview'): void {
    if (tab === this.#activeTab) return;
    // Block switching to preview when no-preview mode is active
    if (tab === 'preview' && (this as unknown as { noPreview: boolean }).noPreview) return;
    this.#activeTab = tab;

    const writeBtns = this.shadowRoot.querySelectorAll<HTMLElement>('.tab-btn');
    writeBtns.forEach((btn) => {
      const isActive = btn.dataset.tab === tab;
      btn.setAttribute('aria-selected', String(isActive));
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    if (tab === 'preview') {
      this.#writeArea?.setAttribute('hidden', '');
      if (this.#previewBody) {
        this.#previewBody.removeAttribute('hidden');
        this.#renderPreview(this.#textarea?.value ?? '');
      }
    } else {
      this.#writeArea?.removeAttribute('hidden');
      this.#previewBody?.setAttribute('hidden', '');
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // Unified render pipeline (preview tab)
  // ════════════════════════════════════════════════════════════════════

  /**
   * Load the render pipeline lazily. Called on first preview activation.
   * Returns cached functions on subsequent calls.
   */
  async #loadRenderPipeline(): Promise<{
    renderMarkdown: typeof RenderFn;
    renderMermaidBlocks: typeof MermaidFn;
  }> {
    if (this.#renderFn && this.#mermaidFn) {
      return { renderMarkdown: this.#renderFn, renderMermaidBlocks: this.#mermaidFn };
    }

    const mod = await import('./render.js');
    this.#renderFn = mod.renderMarkdown;
    this.#mermaidFn = mod.renderMermaidBlocks;
    return { renderMarkdown: this.#renderFn, renderMermaidBlocks: this.#mermaidFn };
  }

  /**
   * Render markdown to the preview panel using the unified pipeline.
   * Shows a loading skeleton on first load, emits render events.
   * Skips re-render if the source and theme are unchanged from the last render.
   */
  async #renderPreview(source: string, force = false): Promise<void> {
    const preview = this.#previewBody;
    if (!preview) return;

    // Skip if source is identical to the last completed render (and not forced)
    if (!force && this.#lastRenderedSource === source && this.#renderFn !== null) {
      return;
    }

    // Cancel any in-flight render
    this.#renderAbortController?.abort();
    const controller = new AbortController();
    this.#renderAbortController = controller;

    this.emit('render-start', {});
    preview.setAttribute('aria-busy', 'true');

    // Show skeleton on first load while pipeline imports
    if (!this.#renderFn) {
      preview.innerHTML = `
        <div class="preview-skeleton" aria-label="Loading preview…">
          <div class="skeleton-line" style="width:90%"></div>
          <div class="skeleton-line" style="width:75%"></div>
          <div class="skeleton-line" style="width:85%"></div>
          <div class="skeleton-line" style="width:60%"></div>
        </div>`;
    }

    try {
      const { renderMarkdown, renderMermaidBlocks } = await this.#loadRenderPipeline();

      // If this render was aborted (new one started), bail out
      if (controller.signal.aborted) {
        preview.removeAttribute('aria-busy');
        return;
      }

      const html = await renderMarkdown(source);
      if (controller.signal.aborted) {
        preview.removeAttribute('aria-busy');
        return;
      }

      preview.innerHTML = html;
      preview.removeAttribute('aria-busy');

      // Inject KaTeX CSS into shadow DOM if not already present
      this.#ensureKatexCss();

      // Mermaid post-render step
      const mermaidSrc = (this as unknown as { mermaidSrc: string | undefined }).mermaidSrc;
      await renderMermaidBlocks(preview, mermaidSrc);
      if (controller.signal.aborted) {
        preview.removeAttribute('aria-busy');
        return;
      }

      // Update cache only after the full render pipeline (including mermaid)
      // completes successfully. Setting it earlier would cause cache hits
      // to skip mermaid post-processing on re-render.
      this.#lastRenderedSource = source;

      this.emit('render-done', { html });
    } catch (err) {
      if (controller.signal.aborted) {
        preview.removeAttribute('aria-busy');
        return;
      }

      // Fallback: show raw markdown as preformatted text
      preview.removeAttribute('aria-busy');
      preview.innerHTML = `<pre class="render-error-fallback">${escapeHtmlStr(source)}</pre>`;
      this.emit('render-error', { error: err instanceof Error ? err : new Error(String(err)) });
    }
  }

  /**
   * Ensure KaTeX CSS is loaded in the shadow DOM.
   */
  #ensureKatexCss(): void {
    if (this.#katexCssInjected) return;
    this.#katexCssInjected = true;

    const rawUrl =
      (this as unknown as { katexCssUrl: string | undefined }).katexCssUrl ??
      'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';

    // Only allow https: URLs to prevent data:/javascript: CSS injection.
    // katex-css-url is a trusted-author attribute but must not be user-controlled.
    const katexUrl = /^https:\/\//i.test(rawUrl)
      ? rawUrl
      : 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';
    if (katexUrl !== rawUrl) {
      console.warn(
        `[el-dm-markdown-input] katex-css-url "${rawUrl}" rejected — only https: URLs are allowed.`,
      );
    }

    const link = document.createElement('link');
    link.id = 'katex-css';
    link.rel = 'stylesheet';
    link.href = katexUrl;
    this.shadowRoot.appendChild(link);
  }

  /**
   * Schedule a debounced live preview render (only when live-preview attribute is set).
   */
  #scheduleLivePreview(): void {
    if (!(this as unknown as { livePreview: boolean }).livePreview) return;
    if (this.#activeTab !== 'preview') return;

    if (this.#livePreviewTimer !== null) clearTimeout(this.#livePreviewTimer);
    const ms = (this as unknown as { debounce: number }).debounce ?? 300;
    this.#livePreviewTimer = setTimeout(() => {
      this.#livePreviewTimer = null;
      this.#renderPreview(this.#textarea?.value ?? '');
    }, ms);
  }

  // ════════════════════════════════════════════════════════════════════
  // Form association
  // ════════════════════════════════════════════════════════════════════

  #syncFormValue(): void {
    const text = this.#textarea?.value ?? '';
    if (this.#attachedFiles.length === 0) {
      this.#internals?.setFormValue(text);
      return;
    }
    const name = (this as unknown as { name: string }).name || 'markdown';
    const fd = new FormData();
    fd.append(name, text);
    for (const f of this.#attachedFiles) {
      fd.append(`${name}_files`, f, f.name);
    }
    this.#internals?.setFormValue(fd);
  }

  // ════════════════════════════════════════════════════════════════════
  // File upload
  // ════════════════════════════════════════════════════════════════════

  #startUpload(file: File): void {
    this.emit('upload-start', { file });

    const id = `upload-${++this.#uploadIdCounter}`;
    const uploadUrl = (this as unknown as { uploadUrl: string | undefined }).uploadUrl;

    if (!uploadUrl) {
      // No upload endpoint — store file locally for form submission
      this.#attachedFiles.push(file);
      this.#addAttachedRow(file, this.#attachedFiles.length - 1, id);
      this.#syncFormValue();
      this.emit('upload-done', { file, url: '', markdown: '' });
      return;
    }

    // Create progress row
    this.#addProgressRow(id, file.name);

    uploadFile(file, uploadUrl, (pct) => {
      this.#updateProgressRow(id, pct);
    })
      .then((url) => {
        this.#removeUploadRow(id);
        const markdown = fileToMarkdown(file, url);
        this.insertText(markdown);
        this.emit('upload-done', { file, url, markdown });
      })
      .catch((err: unknown) => {
        this.#removeUploadRow(id);
        const errorMsg = err instanceof Error ? err.message : 'Upload failed';
        this.emit('upload-error', { file, error: errorMsg });
        this.#showUploadError(file, errorMsg);
      });
  }

  #addProgressRow(id: string, filename: string): void {
    if (!this.#uploadList) return;
    const row = document.createElement('div');
    row.className = 'upload-row';
    row.id = id;
    row.innerHTML = `
      <span class="upload-filename">${escapeHtmlStr(filename)}</span>
      <div class="upload-bar-track" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" aria-label="Uploading ${escapeHtmlStr(filename)}">
        <div class="upload-bar" style="width: 0%"></div>
      </div>
    `;
    this.#uploadList.appendChild(row);
  }

  #updateProgressRow(id: string, pct: number): void {
    const track = this.#uploadList?.querySelector<HTMLElement>(`#${id} .upload-bar-track`);
    if (track) track.setAttribute('aria-valuenow', String(pct));
    const bar = this.#uploadList?.querySelector<HTMLElement>(`#${id} .upload-bar`);
    if (bar) bar.style.width = `${pct}%`;
  }

  #removeUploadRow(id: string): void {
    this.#uploadList?.querySelector(`#${id}`)?.remove();
  }

  #showUploadError(file: File, message: string): void {
    if (!this.#uploadList) return;
    const row = document.createElement('div');
    row.className = 'upload-error-row';
    row.setAttribute('role', 'alert');
    row.innerHTML = `
      <span class="upload-error-msg">${escapeHtmlStr(file.name)}: ${escapeHtmlStr(message)}</span>
    `;
    this.#uploadList.appendChild(row);
    setTimeout(() => row.remove(), 4000);
  }

  #addAttachedRow(file: File, index: number, id: string): void {
    if (!this.#uploadList) return;
    const row = document.createElement('div');
    row.className = 'upload-attached-row';
    row.id = id;
    row.innerHTML = `
      <span class="upload-filename">${escapeHtmlStr(file.name)}</span>
      <span class="upload-attached-size">${formatFileSize(file.size)}</span>
      <button type="button" class="upload-remove-btn" data-attach-index="${index}" aria-label="Remove ${escapeHtmlStr(file.name)}">&#215;</button>
    `;
    row.querySelector('.upload-remove-btn')!.addEventListener('click', () => {
      this.removeFile(index);
    });
    this.#uploadList.appendChild(row);
  }

  // ════════════════════════════════════════════════════════════════════
  // Autocomplete
  // ════════════════════════════════════════════════════════════════════

  #handleAutocompleteInput(): void {
    const ta = this.#textarea;
    if (!ta) return;

    const result = detectTrigger(ta.value, ta.selectionStart ?? 0);

    if (!result) {
      this.#closeDropdown();
      return;
    }

    const { trigger, query, triggerPos } = result;
    this.#acTrigger = trigger;
    this.#acTriggerPos = triggerPos;

    // Capture current generation so stale async resolutions are ignored
    const gen = ++this.#acGeneration;
    const resolve = (list: Suggestion[]) => {
      if (gen === this.#acGeneration) this.setSuggestions(list);
    };

    if (trigger === '@') {
      this.emit('mention-query', { trigger, query, resolve });
    } else {
      this.emit('reference-query', { trigger, query, resolve });
    }
  }

  #handleDropdownKeydown(e: KeyboardEvent): void {
    const len = this.#acSuggestions.length;
    if (len === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.#acSelectedIndex = (this.#acSelectedIndex + 1) % len;
        this.#updateDropdown();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.#acSelectedIndex = (this.#acSelectedIndex - 1 + len) % len;
        this.#updateDropdown();
        break;
      case 'Enter':
      case 'Tab':
        if (this.#acSelectedIndex >= 0) {
          e.preventDefault();
          this.#confirmAutocomplete();
        }
        break;
      case 'Escape':
        this.#closeDropdown();
        break;
    }
  }

  #confirmAutocomplete(): void {
    const ta = this.#textarea;
    if (!ta || this.#acSelectedIndex < 0 || !this.#acTrigger) return;

    const suggestion = this.#acSuggestions[this.#acSelectedIndex];
    if (!suggestion) return;

    const { newValue, newCursorPos } = confirmSuggestion(
      ta.value,
      this.#acTriggerPos,
      ta.selectionStart ?? ta.value.length,
      this.#acTrigger,
      suggestion.id,
    );

    ta.value = newValue;
    ta.setSelectionRange(newCursorPos, newCursorPos);
    this.#syncFormValue();
    this.emit('change', { value: ta.value });
    this.#scheduleHighlight();
    this.#scheduleStatusUpdate();
    this.#closeDropdown();
  }

  #closeDropdown(): void {
    this.#acGeneration++; // invalidate any pending resolve() callbacks
    this.#acSuggestions = [];
    this.#acSelectedIndex = -1;
    this.#acTrigger = null;
    this.#acTriggerPos = -1;
    if (this.#acDropdown) {
      this.#acDropdown.innerHTML = '';
      this.#acDropdown.hidden = true;
    }
    this.#textarea?.setAttribute('aria-expanded', 'false');
    this.#textarea?.removeAttribute('aria-activedescendant');
  }

  #updateDropdown(): void {
    if (!this.#acDropdown) return;
    if (this.#acSuggestions.length === 0) {
      this.#acDropdown.hidden = true;
      this.#textarea?.setAttribute('aria-expanded', 'false');
      this.#textarea?.removeAttribute('aria-activedescendant');
      return;
    }
    this.#acDropdown.innerHTML = renderDropdown(this.#acSuggestions, this.#acSelectedIndex);
    this.#acDropdown.hidden = false;
    this.#textarea?.setAttribute('aria-expanded', 'true');
    // Update aria-activedescendant so screen readers announce the highlighted item
    if (this.#acSelectedIndex >= 0) {
      this.#textarea?.setAttribute('aria-activedescendant', `ac-item-${this.#acSelectedIndex}`);
    } else {
      this.#textarea?.removeAttribute('aria-activedescendant');
    }
    // Position the dropdown near the caret
    const coords = this.#getCaretCoords();
    if (coords) {
      this.#acDropdown.style.top = `${coords.top}px`;
      this.#acDropdown.style.left = `${coords.left}px`;
    }
  }

  /**
   * Compute the caret's position (top-left of the line below the cursor)
   * in coordinates relative to :host.
   *
   * Uses a hidden mirror div positioned at the textarea's exact viewport
   * location so text wraps identically, making the marker span's
   * getBoundingClientRect() directly give us the cursor's viewport position.
   */
  #getCaretCoords(): { top: number; left: number } | null {
    const ta = this.#textarea;
    if (!ta) return null;
    const pos = ta.selectionStart ?? 0;
    const cs = getComputedStyle(ta);
    const taRect = ta.getBoundingClientRect();

    const mirror = document.createElement('div');
    Object.assign(mirror.style, {
      position: 'fixed',
      visibility: 'hidden',
      pointerEvents: 'none',
      top: `${taRect.top}px`,
      left: `${taRect.left}px`,
      width: `${taRect.width}px`,
      font: cs.font,
      letterSpacing: cs.letterSpacing,
      paddingTop: cs.paddingTop,
      paddingRight: cs.paddingRight,
      paddingBottom: cs.paddingBottom,
      paddingLeft: cs.paddingLeft,
      borderTopWidth: cs.borderTopWidth,
      borderRightWidth: cs.borderRightWidth,
      borderBottomWidth: cs.borderBottomWidth,
      borderLeftWidth: cs.borderLeftWidth,
      boxSizing: cs.boxSizing,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      overflowWrap: cs.overflowWrap,
      overflow: 'hidden',
    });

    const before = document.createTextNode(ta.value.substring(0, pos));
    const marker = document.createElement('span');
    marker.textContent = '\u200b';
    mirror.appendChild(before);
    mirror.appendChild(marker);

    document.body.appendChild(mirror);
    const markerRect = marker.getBoundingClientRect();
    document.body.removeChild(mirror);

    const hostRect = this.getBoundingClientRect();
    const lineHeight = parseFloat(cs.lineHeight) || 20;

    return {
      top: markerRect.top - hostRect.top - ta.scrollTop + lineHeight,
      left: Math.max(0, markerRect.left - hostRect.left),
    };
  }

  // ════════════════════════════════════════════════════════════════════
  // Status bar
  // ════════════════════════════════════════════════════════════════════

  #scheduleStatusUpdate(): void {
    if (this.#statusTimer !== null) clearTimeout(this.#statusTimer);
    this.#statusTimer = setTimeout(() => {
      this.#statusTimer = null;
      this.#updateStatusBarNow();
    }, 100);
  }

  #updateStatusBarNow(): void {
    if (!this.#statusCount) return;
    const text = this.#textarea?.value ?? '';
    const words = countWords(text);
    const chars = text.length;
    const maxWords = (this as unknown as { maxWords: number | undefined }).maxWords ?? null;
    this.#statusCount.innerHTML = renderStatusCount(words, chars, maxWords);

    // Report form validity
    const isRequired = !!(this as unknown as { required: boolean }).required;
    if (maxWords && words > maxWords) {
      this.#internals?.setValidity(
        { customError: true },
        `Content exceeds ${maxWords} word limit (${words} words)`,
        this.#textarea ?? undefined,
      );
    } else if (isRequired && text.trim() === '') {
      this.#internals?.setValidity(
        { valueMissing: true },
        'Please fill in this field.',
        this.#textarea ?? undefined,
      );
    } else {
      this.#internals?.setValidity({});
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // Public API
  // ════════════════════════════════════════════════════════════════════

  /** Returns the current markdown content. */
  getValue(): string {
    return this.#textarea?.value ?? '';
  }

  /**
   * Set the editor content programmatically.
   * Does NOT fire a change event. Updates the form value.
   */
  setValue(str: string): void {
    if (this.#textarea) {
      this.#textarea.value = str;
      this.#syncFormValue();
      this.#scheduleHighlight();
      this.#updateStatusBarNow();
      // Keep preview in sync when value is set programmatically
      if (this.#activeTab === 'preview' && this.#previewBody) {
        this.#renderPreview(str);
      }
    } else {
      // Called before element is connected — store in reactive property
      (this as unknown as { value: string }).value = str;
    }
  }

  /**
   * Insert text at the current cursor position, replacing any selection.
   * Fires a change event after insertion.
   */
  insertText(str: string): void {
    const ta = this.#textarea;
    if (!ta) return;

    const start = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? ta.value.length;
    ta.value = ta.value.slice(0, start) + str + ta.value.slice(end);
    const newPos = start + str.length;
    ta.setSelectionRange(newPos, newPos);
    // Dispatch 'input' — the textarea's input listener handles syncFormValue(),
    // emit('change'), scheduleHighlight(), scheduleStatusUpdate(), and autocomplete.
    // bubbles: false keeps the synthetic event inside the shadow root so it is not
    // observable on the host element (preventing shadow DOM boundary leakage).
    ta.dispatchEvent(new Event('input', { bubbles: false }));
  }

  /**
   * Feed suggestions into the autocomplete dropdown.
   * Pass an empty array to close the dropdown.
   */
  setSuggestions(list: Suggestion[]): void {
    this.#acSuggestions = list;
    this.#acSelectedIndex = list.length > 0 ? 0 : -1;
    this.#updateDropdown();
  }

  /** Returns a copy of the locally attached files (when no upload-url is set). */
  getFiles(): File[] {
    return [...this.#attachedFiles];
  }

  /** Remove a locally attached file by index and update the form value. */
  removeFile(index: number): void {
    if (index < 0 || index >= this.#attachedFiles.length) return;
    this.#attachedFiles.splice(index, 1);
    // Re-render all attached rows to keep indices in sync
    this.#rebuildAttachedRows();
    this.#syncFormValue();
  }

  /** Re-render all attached file rows after an index change. */
  #rebuildAttachedRows(): void {
    if (!this.#uploadList) return;
    // Remove all attached rows
    this.#uploadList.querySelectorAll('.upload-attached-row').forEach((r) => r.remove());
    // Re-add with correct indices
    this.#attachedFiles.forEach((file, i) => {
      const id = `upload-${++this.#uploadIdCounter}`;
      this.#addAttachedRow(file, i, id);
    });
  }
}

/** HTML-escape a string for safe insertion into innerHTML. */
function escapeHtmlStr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
