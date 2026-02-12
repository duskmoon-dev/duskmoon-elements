/**
 * DuskMoon Markdown Element
 *
 * A markdown renderer component using remark/rehype with syntax highlighting
 * and optional mermaid diagram support. Includes streaming mode for LLM output
 * with automatic syntax error recovery.
 *
 * @element el-dm-markdown
 *
 * @attr {string} src - URL to fetch markdown content from
 * @attr {string} theme - Code theme: github, atom-one-dark, atom-one-light (default: auto)
 * @attr {boolean} debug - Enable debug logging
 * @attr {boolean} no-mermaid - Disable mermaid diagram rendering
 * @attr {boolean} streaming - Read-only attribute reflecting streaming state
 *
 * @prop {string} content - Get/set markdown content directly
 *
 * @slot - Default slot for inline markdown content
 *
 * @csspart container - The main container
 * @csspart content - The rendered markdown content
 *
 * @fires dm-rendered - Fired when markdown is rendered
 * @fires dm-error - Fired when an error occurs
 * @fires dm-stream-chunk - Fired when a chunk is appended during streaming
 * @fires dm-stream-end - Fired when streaming ends
 *
 * @cssprop --markdown-font-family - Font family for content
 * @cssprop --markdown-code-font-family - Font family for code blocks
 * @cssprop --markdown-line-height - Line height
 *
 * @example
 * // Streaming usage
 * const md = document.querySelector('el-dm-markdown');
 * md.startStreaming();
 * for await (const chunk of llmStream) {
 *   md.appendContent(chunk);
 * }
 * md.endStreaming();
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as markdownBodyCSS } from '@duskmoon-dev/core/components/markdown-body';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';

import { github } from './themes/github.js';
import { atomOneDark } from './themes/atom-one-dark.js';
import { atomOneLight } from './themes/atom-one-light.js';

/**
 * Theme options for code syntax highlighting
 */
export type MarkdownTheme = 'github' | 'atom-one-dark' | 'atom-one-light' | 'auto';

// Strip @layer wrapper for Shadow DOM compatibility
const coreStyles = markdownBodyCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

const baseStyles = css`
  :host {
    display: block;
    font-family: var(
      --markdown-font-family,
      var(--font-family, system-ui, -apple-system, sans-serif)
    );
    line-height: var(--markdown-line-height, 1.6);
    color: var(--color-on-surface);
  }

  :host([hidden]) {
    display: none !important;
  }

  /* Import core markdown-body styles */
  ${coreStyles}

  .container {
    width: 100%;
  }

  .markdown-body {
    overflow-wrap: break-word;
    word-wrap: break-word;
  }

  /* Mermaid diagrams */
  .markdown-body .language-mermaid {
    display: flex;
    justify-content: center;
    background: transparent !important;
    padding: 1em 0;
  }

  .markdown-body .language-mermaid svg {
    max-width: 100%;
    height: auto;
  }

  /* Loading state */
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2em;
    color: var(--color-on-surface-variant);
  }

  .loading::after {
    content: '';
    width: 1.5em;
    height: 1.5em;
    margin-left: 0.5em;
    border: 2px solid var(--color-outline);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Error state */
  .error {
    padding: 1em;
    color: var(--color-error);
    background-color: oklch(95% 0.05 25);
    border: 1px solid oklch(85% 0.1 25);
    border-radius: 0.5rem;
  }

  /* Streaming cursor */
  .streaming-cursor {
    display: inline-block;
    width: 2px;
    height: 1.2em;
    background-color: var(--color-primary);
    margin-left: 2px;
    vertical-align: text-bottom;
    animation: cursor-blink 1s step-end infinite;
  }

  @keyframes cursor-blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }
`;

// Create theme stylesheets
const githubSheet = new CSSStyleSheet();
githubSheet.replaceSync(github);

const darkSheet = new CSSStyleSheet();
darkSheet.replaceSync(atomOneDark);

const lightSheet = new CSSStyleSheet();
lightSheet.replaceSync(atomOneLight);

// Auto theme stylesheet (uses prefers-color-scheme)
const autoThemeSheet = new CSSStyleSheet();
autoThemeSheet.replaceSync(`
  @media (prefers-color-scheme: dark) {
    ${atomOneDark}
  }
  @media (prefers-color-scheme: light) {
    ${atomOneLight}
  }
`);

export class ElDmMarkdown extends BaseElement {
  static properties = {
    src: { type: String, reflect: true },
    theme: { type: String, reflect: true, default: 'auto' },
    debug: { type: Boolean, reflect: true },
    noMermaid: { type: Boolean, reflect: true, attribute: 'no-mermaid' },
    streaming: { type: Boolean, reflect: true },
  };

  /** URL to fetch markdown content from */
  declare src: string;

  /** Code theme */
  declare theme: MarkdownTheme;

  /** Enable debug logging */
  declare debug: boolean;

  /** Disable mermaid rendering */
  declare noMermaid: boolean;

  /** Streaming state (reflected as attribute) */
  declare streaming: boolean;

  /** Unique ID for mermaid diagrams */
  private _mid: string = '';

  /** Raw HTML fragment after conversion */
  private _fragment: string = '';

  /** Current content being rendered */
  private _content: string = '';

  /** Loading state */
  private _loading: boolean = false;

  /** Error message */
  private _error: string = '';

  /** Mutation observer for slot changes */
  private _observer?: MutationObserver;

  /** Mermaid module (loaded dynamically) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _mermaid?: any;

  /** Stream buffer for accumulating content */
  private _streamBuffer: string = '';

  /** Internal streaming state */
  private _isStreaming: boolean = false;

  /** Pending render frame ID */
  private _pendingRender: number | null = null;

  constructor() {
    super();
    this.attachStyles(baseStyles);
    this._updateTheme();
  }

  /**
   * Update the theme stylesheet
   */
  private _updateTheme(): void {
    // Remove existing theme sheets
    const sheets = this.shadowRoot.adoptedStyleSheets.filter(
      (s) => s !== githubSheet && s !== darkSheet && s !== lightSheet && s !== autoThemeSheet,
    );

    // Add the appropriate theme sheet
    switch (this.theme) {
      case 'github':
        this.shadowRoot.adoptedStyleSheets = [...sheets, githubSheet];
        break;
      case 'atom-one-dark':
        this.shadowRoot.adoptedStyleSheets = [...sheets, darkSheet];
        break;
      case 'atom-one-light':
        this.shadowRoot.adoptedStyleSheets = [...sheets, lightSheet];
        break;
      case 'auto':
      default:
        this.shadowRoot.adoptedStyleSheets = [...sheets, autoThemeSheet];
        break;
    }
  }

  connectedCallback(): void {
    super.connectedCallback();

    this._mid = this.id || `md-${Date.now()}`;

    // Load mermaid if not disabled
    if (!this.noMermaid) {
      this._loadMermaid();
    }

    // Observe content changes
    this._observer = new MutationObserver(() => {
      this._processContent();
    });
    this._observer.observe(this, {
      subtree: true,
      childList: true,
      characterData: true,
    });

    // Initial render
    this._processContent();
  }

  disconnectedCallback(): void {
    this._observer?.disconnect();
    super.disconnectedCallback();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    super.attributeChangedCallback(name, oldValue, newValue);

    if (name === 'theme' && oldValue !== newValue) {
      this._updateTheme();
    }

    if (name === 'src' && oldValue !== newValue) {
      this._fetchContent();
    }
  }

  /**
   * Load mermaid library dynamically
   */
  private async _loadMermaid(): Promise<void> {
    try {
      // Dynamic import for optional peer dependency
      // @ts-expect-error mermaid is an optional peer dependency
      const mermaidModule = await import('mermaid');
      const mermaid = mermaidModule.default || mermaidModule;
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
      });
      this._mermaid = mermaid;

      if (this.debug) {
        console.log('[el-dm-markdown] Mermaid loaded');
      }
    } catch (error) {
      if (this.debug) {
        console.warn('[el-dm-markdown] Mermaid not available:', error);
      }
    }
  }

  /**
   * Fetch content from src URL
   */
  private async _fetchContent(): Promise<void> {
    if (!this.src) return;

    this._loading = true;
    this._error = '';
    this.update();

    try {
      const response = await fetch(this.src);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      this._content = await response.text();
      await this._renderMarkdown();
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Unknown error';
      this.emit('dm-error', { error: this._error });
    } finally {
      this._loading = false;
      this.update();
    }
  }

  /**
   * Process content from slot or src
   */
  private async _processContent(): Promise<void> {
    // If src is set, let _fetchContent handle it
    if (this.src) return;

    const content = this._removeIndent(this.textContent ?? '');
    if (content !== this._content) {
      this._content = content;
      await this._renderMarkdown();
    }
  }

  /**
   * Render markdown to HTML
   */
  private async _renderMarkdown(): Promise<void> {
    if (!this._content) {
      this._fragment = '';
      this.update();
      return;
    }

    try {
      const result = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeHighlight, { detect: true, ignoreMissing: true })
        .use(rehypeStringify)
        .process(this._content);

      this._fragment = String(result);
      this.update();

      // Process mermaid diagrams after render
      requestAnimationFrame(() => {
        this._processMermaidDiagrams();
      });

      this.emit('dm-rendered', { html: this._fragment });
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Render error';
      this.emit('dm-error', { error: this._error });
      this.update();
    }
  }

  // ==========================================
  // Streaming API
  // ==========================================

  /**
   * Get the current content
   */
  get content(): string {
    return this._streamBuffer || this._content;
  }

  /**
   * Set content directly (works in both streaming and non-streaming modes)
   */
  set content(value: string) {
    this._streamBuffer = value;

    if (this._isStreaming) {
      this._scheduleStreamRender();
    } else {
      this._content = value;
      this._renderMarkdown();
    }
  }

  /**
   * Start streaming mode - clears buffer and shows cursor
   */
  startStreaming(): void {
    this._isStreaming = true;
    this._streamBuffer = '';
    this._fragment = '';
    this._error = '';
    this.streaming = true;
    this.update();

    if (this.debug) {
      console.log('[el-dm-markdown] Streaming started');
    }
  }

  /**
   * Append content chunk during streaming
   */
  appendContent(chunk: string): void {
    this._streamBuffer += chunk;
    this._scheduleStreamRender();

    this.emit('dm-stream-chunk', { content: this._streamBuffer, chunk });
  }

  /**
   * Set complete content (replaces buffer)
   */
  setContent(content: string): void {
    this._streamBuffer = content;

    if (this._isStreaming) {
      this._scheduleStreamRender();
    } else {
      this._content = content;
      this._renderMarkdown();
    }
  }

  /**
   * End streaming mode - final render without syntax fixes
   */
  endStreaming(): void {
    // Cancel any pending render
    if (this._pendingRender) {
      cancelAnimationFrame(this._pendingRender);
      this._pendingRender = null;
    }

    this._isStreaming = false;
    this.streaming = false;
    this._content = this._streamBuffer;

    // Final clean render without syntax fixes
    this._renderMarkdown();

    this.emit('dm-stream-end', { content: this._streamBuffer });

    if (this.debug) {
      console.log('[el-dm-markdown] Streaming ended');
    }
  }

  /**
   * Schedule a stream render using requestAnimationFrame for performance
   */
  private _scheduleStreamRender(): void {
    if (this._pendingRender) return;

    this._pendingRender = requestAnimationFrame(() => {
      this._pendingRender = null;
      this._renderStreamContent();
    });
  }

  /**
   * Render content during streaming with syntax fixes
   */
  private async _renderStreamContent(): Promise<void> {
    if (!this._streamBuffer) {
      this._fragment = '';
      this.update();
      return;
    }

    try {
      const fixedContent = this._fixIncompleteSyntax(this._streamBuffer);

      if (this.debug) {
        console.log(
          '[el-dm-markdown] Stream render, original:',
          this._streamBuffer.length,
          'fixed:',
          fixedContent.length,
        );
      }

      const result = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeHighlight, { detect: true, ignoreMissing: true })
        .use(rehypeStringify)
        .process(fixedContent);

      this._fragment = String(result);
      this.update();

      // Process mermaid diagrams after render (but skip during heavy streaming)
      if (!this._pendingRender) {
        requestAnimationFrame(() => {
          this._processMermaidDiagrams();
        });
      }
    } catch (error) {
      // During streaming, don't show errors for parse failures
      // Just render what we have as-is
      if (this.debug) {
        console.warn('[el-dm-markdown] Stream parse error:', error);
      }
    }
  }

  /**
   * Fix incomplete markdown syntax for streaming display
   * Automatically closes unclosed blocks to prevent render errors
   */
  private _fixIncompleteSyntax(md: string): string {
    if (!md) return md;

    let fixed = md;

    // Fix unclosed fenced code blocks (```)
    const fenceMatches = fixed.match(/^```/gm) || [];
    if (fenceMatches.length % 2 !== 0) {
      fixed += '\n```';
    }

    // Get the last line for inline element fixes
    const lines = fixed.split('\n');
    const lastLine = lines[lines.length - 1];
    let suffix = '';

    // Fix unclosed inline code (`) - count backticks not in code blocks
    // Only check the last line since inline code doesn't span lines
    const backtickCount = (lastLine.match(/`/g) || []).length;
    if (backtickCount % 2 !== 0) {
      suffix += '`';
    }

    // Fix unclosed bold (**) - check for unmatched pairs
    const boldMatches = lastLine.match(/\*\*/g) || [];
    if (boldMatches.length % 2 !== 0) {
      suffix += '**';
    }

    // Fix unclosed italic (*) - more complex due to overlap with bold
    // Count single asterisks (not part of **)
    const singleAsteriskMatches = lastLine.match(/(?<!\*)\*(?!\*)/g) || [];
    if (singleAsteriskMatches.length % 2 !== 0) {
      suffix += '*';
    }

    // Fix unclosed bold with underscore (__)
    const underscoreBoldMatches = lastLine.match(/__/g) || [];
    if (underscoreBoldMatches.length % 2 !== 0) {
      suffix += '__';
    }

    // Fix unclosed italic with underscore (_) - not part of __
    const singleUnderscoreMatches = lastLine.match(/(?<!_)_(?!_)/g) || [];
    if (singleUnderscoreMatches.length % 2 !== 0) {
      suffix += '_';
    }

    // Fix unclosed strikethrough (~~)
    const strikeMatches = lastLine.match(/~~/g) || [];
    if (strikeMatches.length % 2 !== 0) {
      suffix += '~~';
    }

    // Fix unclosed links - [text](url
    // Check for [ without matching ]
    const openBracket = lastLine.lastIndexOf('[');
    const closeBracket = lastLine.lastIndexOf(']');
    if (openBracket > closeBracket) {
      // We have an unclosed [
      const afterBracket = lastLine.substring(openBracket);
      if (afterBracket.includes('](')) {
        // Pattern: [text](url - just need closing )
        suffix += ')';
      } else if (afterBracket.includes(']')) {
        // Pattern: [text] - might need ()
        if (!afterBracket.match(/\]\s*\(/)) {
          suffix += '()';
        }
      } else {
        // Pattern: [text - need ]()
        suffix += ']()';
      }
    } else {
      // Check for ]( without closing )
      const linkStart = lastLine.lastIndexOf('](');
      if (linkStart !== -1) {
        const afterLink = lastLine.substring(linkStart + 2);
        const closeParen = afterLink.indexOf(')');
        if (closeParen === -1) {
          suffix += ')';
        }
      }
    }

    // Fix unclosed images - ![alt](url
    const imgOpenBracket = lastLine.lastIndexOf('![');
    if (imgOpenBracket !== -1) {
      const afterImg = lastLine.substring(imgOpenBracket);
      if (!afterImg.match(/!\[.*?\]\(.*?\)/)) {
        // Incomplete image syntax
        if (!afterImg.includes(']')) {
          suffix += '](placeholder)';
        } else if (!afterImg.includes(')')) {
          suffix += ')';
        }
      }
    }

    if (suffix) {
      fixed += suffix;
    }

    return fixed;
  }

  /**
   * Process mermaid code blocks into diagrams
   */
  private async _processMermaidDiagrams(): Promise<void> {
    if (this.noMermaid || !this._mermaid) return;

    const codeBlocks = this.shadowRoot.querySelectorAll<HTMLElement>('code.language-mermaid');

    // Get the original mermaid content from the fragment
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this._fragment;
    const sourceBlocks = tempDiv.querySelectorAll<HTMLElement>('code.language-mermaid');

    for (let i = 0; i < codeBlocks.length; i++) {
      const el = codeBlocks[i];
      const sourceEl = sourceBlocks[i];

      if (!sourceEl) continue;

      const txt = this._removeIndent(sourceEl.textContent ?? '');
      const decodedTxt = this._decodeEntities(txt);

      if (this.debug) {
        console.log('[el-dm-markdown] Mermaid source:', decodedTxt);
      }

      try {
        const id = `${this._mid}-mermaid-${i}`;
        const { svg } = await this._mermaid.render(id, decodedTxt);
        el.innerHTML = svg;
      } catch (error) {
        if (this.debug) {
          console.error('[el-dm-markdown] Mermaid render error:', error);
        }
        el.textContent = `Mermaid Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }
  }

  /**
   * Decode HTML entities
   */
  private _decodeEntities(txt: string): string {
    return txt.replace(/&gt;/gi, '>').replace(/&lt;/gi, '<').replace(/&amp;/gi, '&');
  }

  /**
   * Remove common indentation from text
   */
  private _removeIndent(txt: string): string {
    const lines = txt.split('\n');

    // Only remove indent when first line is empty
    if (lines.length > 1 && /^\s*$/.test(lines[0])) {
      lines.splice(0, 1);

      const indentSize = /^\s+/.exec(lines[0])?.[0].length ?? 0;
      if (indentSize > 0) {
        const regex = new RegExp(`^\\s{0,${indentSize}}`);
        return lines.map((line) => line.replace(regex, '')).join('\n');
      }
    }

    return lines.join('\n');
  }

  render(): string {
    if (this._loading) {
      return `
        <div class="container" part="container">
          <div class="loading">Loading markdown</div>
        </div>
      `;
    }

    if (this._error) {
      return `
        <div class="container" part="container">
          <div class="error" role="alert">${this._error}</div>
        </div>
      `;
    }

    const cursorHtml = this._isStreaming
      ? '<span class="streaming-cursor" aria-hidden="true"></span>'
      : '';

    return `
      <div class="container" part="container">
        <div class="content markdown-body" part="content">${this._fragment}${cursorHtml}</div>
      </div>
    `;
  }
}
