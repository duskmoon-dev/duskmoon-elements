/**
 * DuskMoon Markdown Input Element
 *
 * A form-associated custom element providing a markdown editor with:
 * - Write tab with syntax-highlighted backdrop (Prism.js CDN)
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
 * @attr {string}  upload-url   POST endpoint for file uploads
 * @attr {number}  max-words    Soft word cap shown in status bar
 * @attr {boolean} dark         Activates dark Prism theme + dark CSS variable defaults
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
import { countWords, renderStatusCount } from './status-bar.js';
import type { Suggestion } from './types.js';

// Strip @layer wrapper for Shadow DOM compatibility
const coreMarkdownStyles = markdownBodyCSS
  .replace(/@layer\s+components\s*\{/, '')
  .replace(/\}\s*$/, '');

// Inject core markdown-body styles as a constructable stylesheet
import { css } from '@duskmoon-dev/el-base';
const markdownBodySheet = css`
  ${coreMarkdownStyles}
`;

export class ElDmMarkdownInput extends BaseElement {
  static formAssociated = true as const;

  static properties = {
    name: { type: String, reflect: true, default: '' },
    value: { type: String, default: '' },
    placeholder: { type: String, reflect: true, default: 'Write markdown\u2026' },
    disabled: { type: Boolean, reflect: true },
    uploadUrl: { type: String, reflect: true, attribute: 'upload-url' },
    maxWords: { type: Number, reflect: true, attribute: 'max-words' },
    dark: { type: Boolean, reflect: true },
  };

  declare name: string;
  declare value: string;
  declare placeholder: string;
  declare disabled: boolean;
  declare uploadUrl: string | undefined;
  declare maxWords: number | undefined;
  declare dark: boolean;

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
  #backdrop: HTMLElement | null = null;
  #backdropContent: HTMLElement | null = null;
  #writeArea: HTMLElement | null = null;
  #previewBody: HTMLElement | null = null;
  #statusCount: HTMLElement | null = null;
  #acDropdown: HTMLElement | null = null;
  #uploadList: HTMLElement | null = null;
  #fileInput: HTMLInputElement | null = null;

  // ── Resize observer ──────────────────────────────────────────────────
  #resizeObserver: ResizeObserver | null = null;

  // ── Autocomplete state ───────────────────────────────────────────────
  #acSuggestions: Suggestion[] = [];
  #acSelectedIndex = -1;
  #acTriggerPos = -1;
  #acTrigger: '@' | '#' | null = null;

  // ── Upload state ─────────────────────────────────────────────────────
  #uploadIdCounter = 0;

  constructor() {
    super();
    this.attachStyles([elementStyles, markdownBodySheet]);
  }

  // ════════════════════════════════════════════════════════════════════
  // Lifecycle
  // ════════════════════════════════════════════════════════════════════

  connectedCallback(): void {
    super.connectedCallback(); // triggers initial update() → render()
    this.#internals = this.attachInternals();

    // Set initial form value from the reactive `value` property
    const initial = (this as unknown as { value: string }).value ?? '';
    if (initial && this.#textarea) {
      this.#textarea.value = initial;
      this.#syncFormValue();
    }
  }

  disconnectedCallback(): void {
    this.#resizeObserver?.disconnect();
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
      this.#updateStatusBarNow();

      // Restore initial value from reactive prop
      const initVal = (this as unknown as { value: string }).value ?? '';
      if (initVal && this.#textarea) {
        this.#textarea.value = initVal;
        this.#syncFormValue();
        this.#scheduleHighlight();
      }
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
    const placeholder = (this as unknown as { placeholder: string }).placeholder ?? 'Write markdown\u2026';
    ta.placeholder = placeholder;
    ta.disabled = !!(this as unknown as { disabled: boolean }).disabled;

    // Sync value if the reactive prop was updated externally (e.g. attributeChangedCallback)
    const propVal = (this as unknown as { value: string }).value ?? '';
    if (propVal !== '' && propVal !== ta.value) {
      ta.value = propVal;
      this.#syncFormValue();
      this.#scheduleHighlight();
    }

    // Update Prism theme when dark attribute changes
    const dark = !!(this as unknown as { dark: boolean }).dark;
    applyPrismTheme(this.shadowRoot, dark);

    // Re-render status bar (maxWords may have changed)
    this.#updateStatusBarNow();
  }

  protected override render(): string {
    const ph = (this as unknown as { placeholder: string }).placeholder ?? 'Write markdown\u2026';
    const disabled = !!(this as unknown as { disabled: boolean }).disabled;

    return `
      <div class="editor">
        <div class="toolbar" role="tablist" aria-label="Editor mode">
          <button
            class="tab-btn"
            data-tab="write"
            role="tab"
            aria-selected="true"
            aria-controls="write-panel"
          >Write</button>
          <button
            class="tab-btn"
            data-tab="preview"
            role="tab"
            aria-selected="false"
            aria-controls="preview-panel"
          >Preview</button>
        </div>

        <div class="write-area" id="write-panel" role="tabpanel" aria-label="Markdown editor">
          <div class="backdrop" aria-hidden="true">
            <div class="backdrop-content"></div>
          </div>
          <textarea
            aria-label="Markdown editor"
            placeholder="${ph}"
            ${disabled ? 'disabled' : ''}
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
          aria-label="Markdown preview"
          hidden
        ></div>

        <div class="status-bar">
          <button class="attach-btn" type="button" aria-label="Attach files">
            &#128206; Attach files
          </button>
          <span class="status-bar-count" aria-live="polite"></span>
          <input
            type="file"
            class="file-input"
            multiple
            accept="image/*,application/pdf,.zip,.txt,.csv,.json,.md"
            aria-hidden="true"
            tabindex="-1"
          >
        </div>

        <ul class="ac-dropdown" role="listbox" aria-label="Suggestions" hidden></ul>
        <div class="upload-list"></div>
      </div>
    `;
  }

  // ════════════════════════════════════════════════════════════════════
  // Post-render setup
  // ════════════════════════════════════════════════════════════════════

  #cacheDOMRefs(): void {
    this.#textarea = this.shadowRoot.querySelector('textarea');
    this.#backdrop = this.shadowRoot.querySelector('.backdrop');
    this.#backdropContent = this.shadowRoot.querySelector('.backdrop-content');
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
    });

    // ── Scroll sync (backdrop must follow textarea scroll) ─────────
    ta.addEventListener('scroll', () => {
      if (this.#backdrop) {
        this.#backdrop.scrollTop = ta.scrollTop;
        this.#backdrop.scrollLeft = ta.scrollLeft;
      }
    });

    // ── Tab key for autocomplete (prevent default only when dropdown open) ──
    ta.addEventListener('keydown', (e) => {
      if (this.#acSuggestions.length > 0 && !this.#acDropdown?.hidden) {
        this.#handleDropdownKeydown(e);
      }
      // Ctrl+Shift+P → toggle preview (T023)
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        this.#switchTab(this.#activeTab === 'write' ? 'preview' : 'write');
      }
    });

    // ── Drag and drop ──────────────────────────────────────────────
    const writeArea = this.#writeArea;
    if (writeArea) {
      writeArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        writeArea.style.opacity = '0.8';
      });
      writeArea.addEventListener('dragleave', () => {
        writeArea.style.opacity = '';
      });
      writeArea.addEventListener('drop', (e) => {
        e.preventDefault();
        writeArea.style.opacity = '';
        const files = Array.from(e.dataTransfer?.files ?? []).filter(isAcceptedType);
        files.forEach((f) => this.#startUpload(f));
      });
    }

    // ── Clipboard paste (images only) ─────────────────────────────
    ta.addEventListener('paste', (e) => {
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

    // ── ResizeObserver: mirror textarea dimensions to backdrop ─────
    if (typeof ResizeObserver !== 'undefined') {
      this.#resizeObserver = new ResizeObserver(() => {
        if (this.#backdrop && this.#textarea) {
          this.#backdrop.style.height = `${this.#textarea.offsetHeight}px`;
        }
      });
      this.#resizeObserver.observe(ta);
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // Highlight (Write tab backdrop)
  // ════════════════════════════════════════════════════════════════════

  #initHighlight(): void {
    const dark = !!(this as unknown as { dark: boolean }).dark;
    applyPrismTheme(this.shadowRoot, dark);
    ensurePrism().then(() => {
      // Highlight immediately once Prism is ready
      if (this.#textarea && this.#backdropContent) {
        this.#backdropContent.innerHTML = highlightMarkdown(this.#textarea.value);
      }
    });
  }

  #scheduleHighlight(): void {
    if (this.#highlightTimer !== null) clearTimeout(this.#highlightTimer);
    this.#highlightTimer = setTimeout(() => {
      this.#highlightTimer = null;
      if (this.#backdropContent && this.#textarea) {
        this.#backdropContent.innerHTML = highlightMarkdown(this.#textarea.value);
      }
      // Sync scroll after highlight (content size may change)
      if (this.#backdrop && this.#textarea) {
        this.#backdrop.scrollTop = this.#textarea.scrollTop;
      }
    }, 60);
  }

  // ════════════════════════════════════════════════════════════════════
  // Tab switching (Write ↔ Preview)
  // ════════════════════════════════════════════════════════════════════

  #switchTab(tab: 'write' | 'preview'): void {
    if (tab === this.#activeTab) return;
    this.#activeTab = tab;

    const writeBtns = this.shadowRoot.querySelectorAll<HTMLElement>('.tab-btn');
    writeBtns.forEach((btn) => {
      const isActive = btn.dataset.tab === tab;
      btn.setAttribute('aria-selected', String(isActive));
    });

    if (tab === 'preview') {
      this.#writeArea?.setAttribute('hidden', '');
      if (this.#previewBody) {
        this.#previewBody.removeAttribute('hidden');
        this.#previewBody.innerHTML = this.#renderMarkdown(this.#textarea?.value ?? '');
      }
    } else {
      this.#writeArea?.removeAttribute('hidden');
      this.#previewBody?.setAttribute('hidden', '');
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // Minimal markdown renderer (preview tab)
  // ════════════════════════════════════════════════════════════════════

  #renderMarkdown(md: string): string {
    if (!md.trim()) return '<p></p>';

    // Step 1: Extract fenced code blocks
    // Use a placeholder string that won't appear in markdown content
    const CB_PH = '\u2060CB';
    const IC_PH = '\u2060IC';
    const codeBlocks: string[] = [];
    let html = md.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
      const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const idx =
        codeBlocks.push(`<pre><code class="language-${lang || 'text'}">${escaped}</code></pre>`) -
        1;
      return `${CB_PH}${idx}${CB_PH}`;
    });

    // Step 2: Extract inline code
    const inlineCodes: string[] = [];
    html = html.replace(/`([^`\n]+)`/g, (_, code) => {
      const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const idx = inlineCodes.push(`<code>${escaped}</code>`) - 1;
      return `${IC_PH}${idx}${IC_PH}`;
    });

    // Step 3: HTML-escape remaining content
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Step 4: Markdown transformations
    // Images before links
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Headings
    html = html
      .replace(/^###### (.+)$/gm, '<h6>$1</h6>')
      .replace(/^##### (.+)$/gm, '<h5>$1</h5>')
      .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Horizontal rules
    html = html.replace(/^[-*_]{3,}$/gm, '<hr>');

    // Blockquotes (note: > is escaped to &gt; above)
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

    // Bold + italic (order matters: *** before ** before *)
    html = html
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/___(.+?)___/g, '<strong><em>$1</em></strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      .replace(/_(.+?)_/g, '<em>$1</em>');

    // Strikethrough
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

    // Lists (simple single-level)
    html = html.replace(/^[ \t]*[-*+] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>[\s\S]+?<\/li>)/g, '<ul>$1</ul>');
    html = html.replace(/^[ \t]*\d+\. (.+)$/gm, '<li>$1</li>');

    // Paragraphs
    const lines = html.split('\n\n');
    html = lines
      .map((block) => {
        const t = block.trim();
        if (!t) return '';
        if (/^<(h[1-6]|ul|ol|li|blockquote|hr|pre)/.test(t) || t.startsWith(CB_PH)) return t;
        return `<p>${t.replace(/\n/g, '<br>')}</p>`;
      })
      .filter(Boolean)
      .join('\n');

    // Step 5: Restore placeholders
    html = html.replace(
      new RegExp(`${CB_PH}(\\d+)${CB_PH}`, 'g'),
      (_, i) => codeBlocks[parseInt(i, 10)] ?? '',
    );
    html = html.replace(
      new RegExp(`${IC_PH}(\\d+)${IC_PH}`, 'g'),
      (_, i) => inlineCodes[parseInt(i, 10)] ?? '',
    );

    return html;
  }

  // ════════════════════════════════════════════════════════════════════
  // Form association
  // ════════════════════════════════════════════════════════════════════

  #syncFormValue(): void {
    this.#internals?.setFormValue(this.#textarea?.value ?? '');
  }

  // ════════════════════════════════════════════════════════════════════
  // File upload
  // ════════════════════════════════════════════════════════════════════

  #startUpload(file: File): void {
    this.emit('upload-start', { file });

    const id = `upload-${++this.#uploadIdCounter}`;
    const uploadUrl = (this as unknown as { uploadUrl: string | undefined }).uploadUrl;

    if (!uploadUrl) {
      this.emit('upload-error', { file, error: 'no upload-url set' });
      this.#showUploadError(file, 'no upload-url set');
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
      .catch((err: string) => {
        this.#removeUploadRow(id);
        const errorMsg = typeof err === 'string' ? err : 'Upload failed';
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
      <div class="upload-bar-track">
        <div class="upload-bar" style="width: 0%"></div>
      </div>
    `;
    this.#uploadList.appendChild(row);
  }

  #updateProgressRow(id: string, pct: number): void {
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
    row.innerHTML = `
      <span class="upload-error-msg">${escapeHtmlStr(file.name)}: ${escapeHtmlStr(message)}</span>
    `;
    this.#uploadList.appendChild(row);
    setTimeout(() => row.remove(), 4000);
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

    const resolve = (list: Suggestion[]) => this.setSuggestions(list);

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
    this.#acSuggestions = [];
    this.#acSelectedIndex = -1;
    this.#acTrigger = null;
    this.#acTriggerPos = -1;
    if (this.#acDropdown) {
      this.#acDropdown.innerHTML = '';
      this.#acDropdown.hidden = true;
    }
  }

  #updateDropdown(): void {
    if (!this.#acDropdown) return;
    if (this.#acSuggestions.length === 0) {
      this.#acDropdown.hidden = true;
      return;
    }
    this.#acDropdown.innerHTML = renderDropdown(this.#acSuggestions, this.#acSelectedIndex);
    this.#acDropdown.hidden = false;
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
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    this.#syncFormValue();
    this.emit('change', { value: ta.value });
    this.#scheduleHighlight();
    this.#scheduleStatusUpdate();
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
}

/** HTML-escape a string for safe insertion into innerHTML. */
function escapeHtmlStr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
