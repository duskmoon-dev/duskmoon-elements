/**
 * DuskMoon Code Engine Element
 *
 * A lightweight code editor backed by @duskmoon-dev/code-engine (CodeMirror 6 fork).
 * Behaves like a native <input> or <textarea>: the `value` attribute sets the initial
 * content, the `value` property always reflects the current content, and the element
 * fires `input` on every change and `change` on blur.
 *
 * @element el-dm-code-engine
 *
 * @attr {string} value - Initial editor content (read once at mount, like <input>)
 * @attr {string} language - Language name for syntax highlighting (e.g. "javascript", "css")
 * @attr {boolean} readonly - Whether the editor is read-only
 * @attr {string} theme - Editor theme: "duskmoon" | "sunshine" | "moonlight" | "one-dark"
 * @attr {boolean} wrap - Enable line wrapping
 *
 * @prop {string} value - Gets or sets current editor content
 *
 * @method focus() - Focuses the editor
 * @method getValue() - Returns current editor content
 * @method setValue(value: string) - Sets editor content programmatically
 *
 * @fires input - Fired on every document change, detail: { value: string }
 * @fires change - Fired when editor loses focus, detail: { value: string }
 *
 * @csspart editor - The CodeMirror mount container
 *
 * @attr {boolean} show-topbar - Show the topbar
 * @attr {boolean} show-bottombar - Show the bottombar
 * @attr {string} title - Title shown in topbar (e.g. filename)
 *
 * @fires copy - Fired when copy button is clicked, detail: { value: string }
 * @fires fullscreen - Fired when fullscreen is toggled, detail: { active: boolean }
 *
 * @csspart topbar - The topbar container
 * @csspart bottombar - The bottombar container
 *
 * @slot topbar - Custom topbar content (replaces default)
 * @slot bottombar - Custom bottombar content (replaces default)
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';
import type { Extension } from '@duskmoon-dev/code-engine';
import { EditorView } from '@duskmoon-dev/code-engine/view';
import { EditorState, Compartment } from '@duskmoon-dev/code-engine/state';
import { basicSetup } from '@duskmoon-dev/code-engine/setup';
import { undo, redo } from '@duskmoon-dev/code-engine/commands';

// ── Static theme imports (all 4 are small; avoids runtime bare-specifier issues) ──
import * as _duskmoonTheme from '@duskmoon-dev/code-engine/theme/duskmoon';
import * as _sunshineTheme from '@duskmoon-dev/code-engine/theme/sunshine';
import * as _moonlightTheme from '@duskmoon-dev/code-engine/theme/moonlight';
import * as _oneDarkTheme from '@duskmoon-dev/code-engine/theme/one-dark';

function extractExt(mod: Record<string, unknown>): Extension {
  const v =
    mod.default ??
    Object.values(mod).find((x) => typeof x === 'function' || (x && typeof x !== 'string'));
  // Theme modules export a factory function (e.g. duskMoon(options?))
  if (typeof v === 'function') return (v as () => Extension)() as Extension;
  return (v ?? []) as Extension;
}

const THEMES: Record<string, Extension> = {
  duskmoon: extractExt(_duskmoonTheme as unknown as Record<string, unknown>),
  sunshine: extractExt(_sunshineTheme as unknown as Record<string, unknown>),
  moonlight: extractExt(_moonlightTheme as unknown as Record<string, unknown>),
  'one-dark': extractExt(_oneDarkTheme as unknown as Record<string, unknown>),
};

// ── Language loaders (literal import paths so bundlers can resolve them) ──

function langLoader(
  importFn: () => Promise<Record<string, unknown>>,
  opts?: Record<string, unknown>,
): () => Promise<Extension | null> {
  return async () => {
    const mod = await importFn();
    const factory = mod.default ?? Object.values(mod).find((v) => typeof v === 'function');
    if (typeof factory === 'function') {
      return (opts ? factory(opts) : factory()) as Extension;
    }
    return factory as Extension | null;
  };
}

const LANG_LOADERS: Record<string, () => Promise<Extension | null>> = {
  javascript: langLoader(() => import('@duskmoon-dev/code-engine/lang/javascript')),
  typescript: langLoader(() => import('@duskmoon-dev/code-engine/lang/javascript'), {
    typescript: true,
  }),
  css: langLoader(() => import('@duskmoon-dev/code-engine/lang/css')),
  html: langLoader(() => import('@duskmoon-dev/code-engine/lang/html')),
  json: langLoader(() => import('@duskmoon-dev/code-engine/lang/json')),
  python: langLoader(() => import('@duskmoon-dev/code-engine/lang/python')),
  markdown: langLoader(() => import('@duskmoon-dev/code-engine/lang/markdown')),
  xml: langLoader(() => import('@duskmoon-dev/code-engine/lang/xml')),
  sql: langLoader(() => import('@duskmoon-dev/code-engine/lang/sql')),
  rust: langLoader(() => import('@duskmoon-dev/code-engine/lang/rust')),
  go: langLoader(() => import('@duskmoon-dev/code-engine/lang/go')),
  java: langLoader(() => import('@duskmoon-dev/code-engine/lang/java')),
  cpp: langLoader(() => import('@duskmoon-dev/code-engine/lang/cpp')),
  php: langLoader(() => import('@duskmoon-dev/code-engine/lang/php')),
  yaml: langLoader(() => import('@duskmoon-dev/code-engine/lang/yaml')),
  sass: langLoader(() => import('@duskmoon-dev/code-engine/lang/sass')),
  less: langLoader(() => import('@duskmoon-dev/code-engine/lang/less')),
  elixir: langLoader(() => import('@duskmoon-dev/code-engine/lang/elixir')),
  erlang: langLoader(() => import('@duskmoon-dev/code-engine/lang/erlang')),
  heex: langLoader(() => import('@duskmoon-dev/code-engine/lang/heex')),
  dart: langLoader(() => import('@duskmoon-dev/code-engine/lang/dart')),
  zig: langLoader(() => import('@duskmoon-dev/code-engine/lang/zig')),
  vue: langLoader(() => import('@duskmoon-dev/code-engine/lang/vue')),
  angular: langLoader(() => import('@duskmoon-dev/code-engine/lang/angular')),
  liquid: langLoader(() => import('@duskmoon-dev/code-engine/lang/liquid')),
  jinja: langLoader(() => import('@duskmoon-dev/code-engine/lang/jinja')),
  wast: langLoader(() => import('@duskmoon-dev/code-engine/lang/wast')),
  lezer: langLoader(() => import('@duskmoon-dev/code-engine/lang/lezer')),
  caddyfile: langLoader(() => import('@duskmoon-dev/code-engine/lang/caddyfile')),
};

const LANG_BADGES: Record<string, string> = {
  javascript: 'JS',
  typescript: 'TS',
  python: 'PY',
  rust: 'RS',
  go: 'GO',
  java: 'JAVA',
  cpp: 'C++',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  markdown: 'MD',
  sql: 'SQL',
  yaml: 'YAML',
  xml: 'XML',
  php: 'PHP',
  elixir: 'EX',
  erlang: 'ERL',
  heex: 'HEEX',
  dart: 'DART',
  zig: 'ZIG',
  vue: 'VUE',
  angular: 'NG',
  sass: 'SASS',
  less: 'LESS',
  wast: 'WAST',
  lezer: 'LEZER',
  caddyfile: 'CADDY',
  jinja: 'JINJA',
  liquid: 'LIQUID',
};

const LANG_NAMES: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  rust: 'Rust',
  go: 'Go',
  java: 'Java',
  cpp: 'C++',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  markdown: 'Markdown',
  sql: 'SQL',
  yaml: 'YAML',
  xml: 'XML',
  php: 'PHP',
  elixir: 'Elixir',
  erlang: 'Erlang',
  heex: 'HEEx',
  dart: 'Dart',
  zig: 'Zig',
  vue: 'Vue',
  angular: 'Angular',
  sass: 'Sass',
  less: 'Less',
  wast: 'WAT',
  lezer: 'Lezer',
  caddyfile: 'Caddyfile',
  jinja: 'Jinja',
  liquid: 'Liquid',
};

// ── SVG Icons (14×14, stroke-based) ──

const ICON_UNDO = `<svg viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`;

const ICON_REDO = `<svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`;

const ICON_WRAP = `<svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><path d="M3 12h15a3 3 0 1 1 0 6h-4"/><polyline points="16 16 14 18 16 20"/><line x1="3" y1="18" x2="10" y2="18"/></svg>`;

const ICON_COPY = `<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;

const ICON_CHECK = `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`;

const ICON_FULLSCREEN = `<svg viewBox="0 0 24 24"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;

const ICON_EXIT_FULLSCREEN = `<svg viewBox="0 0 24 24"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;

export type CodeEngineTheme = 'duskmoon' | 'sunshine' | 'moonlight' | 'one-dark';

const styles = css`
  :host {
    display: block;
    min-height: 200px;
    font-family: var(
      --dm-font-mono,
      ui-monospace,
      'Cascadia Code',
      'Source Code Pro',
      Menlo,
      Consolas,
      'DejaVu Sans Mono',
      monospace
    );
  }

  :host([hidden]) {
    display: none !important;
  }

  .cm-host {
    height: 100%;
  }

  .cm-host .cm-editor {
    height: 100%;
  }

  .cm-host .cm-editor.cm-focused {
    outline: none;
  }

  /* ── Topbar ────────────────────────────────────────── */

  .topbar {
    display: none;
  }

  :host([show-topbar]) .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    border-bottom: 1px solid var(--dm-border, #e0e0e0);
    background: var(--dm-surface-container, #f0f0f0);
    font-size: 0.75rem;
    color: var(--dm-on-surface, #1a1a1a);
  }

  .topbar-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .lang-badge {
    padding: 0.0625rem 0.375rem;
    border-radius: var(--dm-radius-sm, 0.25rem);
    background: var(--dm-primary, #6750a4);
    color: var(--dm-on-primary, #fff);
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .topbar-title {
    opacity: 0.7;
    font-size: 0.6875rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .bar-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    border: none;
    border-radius: var(--dm-radius-sm, 0.25rem);
    background: transparent;
    color: var(--dm-on-surface-variant, #555);
    font-family: inherit;
    font-size: 0.75rem;
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s;
  }

  .bar-btn:hover {
    background: var(--dm-surface-container-high, #e0e0e0);
    color: var(--dm-on-surface, #1a1a1a);
  }

  .bar-btn svg {
    width: 14px;
    height: 14px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* ── Bottombar ─────────────────────────────────────── */

  .bottombar {
    display: none;
  }

  :host([show-bottombar]) .bottombar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.25rem 0.75rem;
    border-top: 1px solid var(--dm-border, #e0e0e0);
    background: var(--dm-surface-container-high, #e0e0e0);
    font-size: 0.625rem;
    color: var(--dm-on-surface-variant, #555);
  }

  .bottombar-left,
  .bottombar-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  /* ── Fullscreen ────────────────────────────────────── */

  :host(.fullscreen) {
    position: fixed !important;
    inset: 0 !important;
    z-index: 9999 !important;
    min-height: 100vh !important;
    display: flex;
    flex-direction: column;
  }

  :host(.fullscreen) .cm-host {
    flex: 1;
  }
`;

export class ElDmCodeEngine extends BaseElement {
  static properties = {
    language: { type: String, reflect: true },
    readonly: { type: Boolean, reflect: true },
    theme: { type: String, reflect: true, default: 'duskmoon' },
    wrap: { type: Boolean, reflect: true },
    showTopbar: { type: Boolean, reflect: true },
    showBottombar: { type: Boolean, reflect: true },
    title: { type: String, reflect: true },
  };

  declare language: string;
  declare readonly: boolean;
  declare theme: CodeEngineTheme;
  declare wrap: boolean;
  declare showTopbar: boolean;
  declare showBottombar: boolean;
  declare title: string;

  #editor: EditorView | null = null;
  #pendingValue: string | null = null;

  readonly #languageCompartment = new Compartment();
  readonly #readonlyCompartment = new Compartment();
  readonly #themeCompartment = new Compartment();
  readonly #wrapCompartment = new Compartment();

  readonly #langCache = new Map<string, Extension | null>();

  #cursorLine = 1;
  #cursorCol = 1;
  #lineCount = 0;
  #isFullscreen = false;
  #copyTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  /**
   * Current editor content. Getter always returns live document text.
   * Setter updates the editor document (or queues the value if called before mount).
   */
  get value(): string {
    return (
      this.#editor?.state.doc.toString() ?? this.#pendingValue ?? this.getAttribute('value') ?? ''
    );
  }

  set value(v: string) {
    if (this.#editor) {
      this.#editor.dispatch({
        changes: { from: 0, to: this.#editor.state.doc.length, insert: v },
      });
    } else {
      this.#pendingValue = v;
    }
  }

  /** Focus the editor. */
  focus(): void {
    this.#editor?.focus();
  }

  /** Returns current editor content. Equivalent to reading the `value` property. */
  getValue(): string {
    return this.value;
  }

  /** Sets editor content programmatically. Equivalent to assigning the `value` property. */
  setValue(v: string): void {
    this.value = v;
  }

  protected render(): string {
    return `${this.#renderTopbar()}<div class="cm-host" part="editor"></div>${this.#renderBottombar()}`;
  }

  protected update(): void {
    if (!this.#editor) {
      // First render: create the container then mount the editor.
      super.update();
      void this.#mountEditor();
    } else {
      // Editor already mounted: reconfigure via compartment transactions.
      void this.#applyConfig();
    }
  }

  #clickHandler = (e: Event) => {
    const btn = (e.target as Element)?.closest('[data-action]');
    if (btn) {
      const action = btn.getAttribute('data-action');
      if (action) this.#handleBarAction(action);
    }
  };

  connectedCallback(): void {
    super.connectedCallback();
    this.shadowRoot!.addEventListener('click', this.#clickHandler);
  }

  disconnectedCallback(): void {
    this.shadowRoot!.removeEventListener('click', this.#clickHandler);
    if (this.#copyTimer) {
      clearTimeout(this.#copyTimer);
      this.#copyTimer = null;
    }
    // Save current content so it survives a DOM move/reconnect.
    if (this.#editor) {
      this.#pendingValue = this.#editor.state.doc.toString();
      this.#editor.destroy();
      this.#editor = null;
    }
    super.disconnectedCallback();
  }

  // ── Bar rendering ───────────────────────────────────────────────────

  #renderTopbar(): string {
    const badge = this.language
      ? `<span class="lang-badge">${LANG_BADGES[this.language] ?? this.language.toUpperCase()}</span>`
      : '';
    const t = (this as unknown as { title: string }).title;
    const title = t ? `<span class="topbar-title">${t}</span>` : '';
    return `
      <div class="topbar" part="topbar">
        <slot name="topbar">
          <div class="topbar-left">${badge}${title}</div>
          <div class="topbar-right">
            <button class="bar-btn" data-action="undo" title="Undo">${ICON_UNDO}</button>
            <button class="bar-btn" data-action="redo" title="Redo">${ICON_REDO}</button>
            <button class="bar-btn" data-action="wrap" title="Toggle line wrap">${ICON_WRAP}</button>
            <button class="bar-btn" data-action="copy" title="Copy">${ICON_COPY}</button>
            <button class="bar-btn" data-action="fullscreen" title="Toggle fullscreen">${this.#isFullscreen ? ICON_EXIT_FULLSCREEN : ICON_FULLSCREEN}</button>
          </div>
        </slot>
      </div>
    `;
  }

  #renderBottombar(): string {
    const langName = this.language ? (LANG_NAMES[this.language] ?? this.language) : '';
    return `
      <div class="bottombar" part="bottombar">
        <slot name="bottombar">
          <div class="bottombar-left">
            <span class="cursor-pos">Ln ${this.#cursorLine}, Col ${this.#cursorCol}</span>
            <span class="line-count">${this.#lineCount} lines</span>
          </div>
          <div class="bottombar-right">
            <span>UTF-8</span>
            ${langName ? `<span>${langName}</span>` : ''}
          </div>
        </slot>
      </div>
    `;
  }

  // ── Action handlers ─────────────────────────────────────────────────

  #handleBarAction(action: string): void {
    switch (action) {
      case 'undo':
        if (this.#editor) undo(this.#editor);
        break;
      case 'redo':
        if (this.#editor) redo(this.#editor);
        break;
      case 'wrap':
        this.wrap = !this.wrap;
        break;
      case 'copy':
        void this.#handleCopy();
        break;
      case 'fullscreen':
        this.#toggleFullscreen();
        break;
    }
  }

  async #handleCopy(): Promise<void> {
    const value = this.value;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return; // Clipboard API unavailable or denied
    }
    this.emit('copy', { value });
    this.#showCopyFeedback();
  }

  #showCopyFeedback(): void {
    const btn = this.shadowRoot?.querySelector('[data-action="copy"]');
    if (!btn) return;
    if (this.#copyTimer) clearTimeout(this.#copyTimer);
    btn.innerHTML = ICON_CHECK;
    btn.setAttribute('title', 'Copied!');
    this.#copyTimer = setTimeout(() => {
      btn.innerHTML = ICON_COPY;
      btn.setAttribute('title', 'Copy');
      this.#copyTimer = null;
    }, 2000);
  }

  #toggleFullscreen(): void {
    this.#isFullscreen = !this.#isFullscreen;
    this.classList.toggle('fullscreen', this.#isFullscreen);
    // Update fullscreen button icon
    const btn = this.shadowRoot?.querySelector('[data-action="fullscreen"]');
    if (btn) {
      btn.innerHTML = this.#isFullscreen ? ICON_EXIT_FULLSCREEN : ICON_FULLSCREEN;
      btn.setAttribute('title', this.#isFullscreen ? 'Exit fullscreen' : 'Toggle fullscreen');
    }
    this.emit('fullscreen', { active: this.#isFullscreen });
  }

  // ── Cursor tracking ────────────────────────────────────────────────

  #updateCursorInfo(state: EditorState): void {
    const pos = state.selection.main.head;
    const line = state.doc.lineAt(pos);
    this.#cursorLine = line.number;
    this.#cursorCol = pos - line.from + 1;
    this.#lineCount = state.doc.lines;

    // Update bottombar spans directly (avoid full re-render)
    const cursorEl = this.shadowRoot?.querySelector('.cursor-pos');
    const lineCountEl = this.shadowRoot?.querySelector('.line-count');
    if (cursorEl) cursorEl.textContent = `Ln ${this.#cursorLine}, Col ${this.#cursorCol}`;
    if (lineCountEl) lineCountEl.textContent = `${this.#lineCount} lines`;
  }

  // ── Private helpers ──────────────────────────────────────────────────

  async #mountEditor(): Promise<void> {
    const host = this.shadowRoot?.querySelector('.cm-host');
    if (!host || this.#editor) return;

    const initialDoc = this.#pendingValue ?? this.getAttribute('value') ?? '';
    this.#pendingValue = null;

    const langExt = await this.#loadLanguage(this.language);

    this.#editor = new EditorView({
      state: EditorState.create({
        doc: initialDoc,
        extensions: [
          basicSetup,
          this.#languageCompartment.of(langExt ?? []),
          this.#readonlyCompartment.of(EditorState.readOnly.of(this.readonly ?? false)),
          this.#themeCompartment.of(THEMES[this.theme] ?? []),
          this.#wrapCompartment.of(this.wrap ? EditorView.lineWrapping : []),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              this.emit('input', { value: update.state.doc.toString() });
            }
            if (update.docChanged || update.selectionSet) {
              this.#updateCursorInfo(update.state);
            }
          }),
          EditorView.domEventHandlers({
            blur: () => {
              this.emit('change', { value: this.#editor!.state.doc.toString() });
              return false;
            },
          }),
        ],
      }),
      parent: host,
      root: this.shadowRoot,
    });

    this.#updateCursorInfo(this.#editor.state);
  }

  async #applyConfig(): Promise<void> {
    if (!this.#editor) return;

    const langExt = await this.#loadLanguage(this.language);

    this.#editor.dispatch({
      effects: [
        this.#languageCompartment.reconfigure(langExt ?? []),
        this.#readonlyCompartment.reconfigure(EditorState.readOnly.of(this.readonly ?? false)),
        this.#themeCompartment.reconfigure(THEMES[this.theme] ?? []),
        this.#wrapCompartment.reconfigure(this.wrap ? EditorView.lineWrapping : []),
      ],
    });
  }

  async #loadLanguage(name: string): Promise<Extension | null> {
    if (!name) return null;
    if (this.#langCache.has(name)) return this.#langCache.get(name)!;

    const loader = LANG_LOADERS[name];
    if (!loader) {
      this.#langCache.set(name, null);
      return null;
    }

    try {
      const ext = await loader();
      this.#langCache.set(name, ext);
      return ext;
    } catch {
      this.#langCache.set(name, null);
      return null;
    }
  }
}
