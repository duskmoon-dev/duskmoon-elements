import { css } from '@duskmoon-dev/el-base';

/**
 * Shadow DOM stylesheet for el-dm-markdown-input.
 *
 * Exposes --md-* custom properties as the external theming API.
 * Each --md-* variable falls back to the corresponding --color-* token
 * from @duskmoon-dev/core so the element automatically adopts the
 * active design-system theme without any consumer configuration.
 */
export const elementStyles = css`
  /* ── Custom property defaults with design-system fallbacks ─────────── */
  :host {
    --md-border: var(--color-outline, #d0d7de);
    --md-border-focus: var(--color-primary, #0969da);
    --md-bg: var(--color-surface, #ffffff);
    --md-bg-toolbar: var(--color-surface-variant, #f6f8fa);
    --md-bg-hover: var(--color-surface-container, #eaeef2);
    --md-text: var(--color-on-surface, #1f2328);
    --md-text-muted: var(--color-on-surface-variant, #656d76);
    --md-accent: var(--color-primary, #0969da);
    --md-radius: 6px;
    --md-upload-bar: var(--color-primary, #0969da);
    --md-color-warning: var(--color-warning, #d97706);
    --md-color-error: var(--color-error, #dc2626);

    display: block;
    position: relative; /* establishes containing block for the ac-dropdown portal */
    font-family: inherit;
  }

  :host([hidden]) {
    display: none !important;
  }

  /* Dark-mode overrides (activated by [dark] attribute on host) */
  :host([dark]) {
    --md-border: #30363d;
    --md-border-focus: #58a6ff;
    --md-bg: #0d1117;
    --md-bg-toolbar: #161b22;
    --md-bg-hover: #21262d;
    --md-text: #e6edf3;
    --md-text-muted: #8b949e;
    --md-accent: #58a6ff;
    --md-upload-bar: #58a6ff;
    --md-color-warning: #f59e0b;
    --md-color-error: #fca5a5;
  }

  /* ── Editor chrome ──────────────────────────────────────────────────── */
  .editor {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--md-border);
    border-radius: var(--md-radius);
    background: var(--md-bg);
    color: var(--md-text);
    overflow: hidden;
    height: inherit;
    min-height: 12rem;
  }

  .editor:focus-within {
    border-color: var(--md-border-focus);
    outline: 2px solid var(--md-border-focus);
    outline-offset: -1px;
  }

  /* ── Toolbar / tab bar ──────────────────────────────────────────────── */
  .toolbar {
    display: flex;
    gap: 0;
    background: var(--md-bg-toolbar);
    border-bottom: 1px solid var(--md-border);
    padding: 0 0.5rem;
  }

  .tab-btn {
    padding: 0.5rem 0.875rem;
    border: none;
    background: transparent;
    color: var(--md-text-muted);
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    transition:
      color 150ms ease,
      border-color 150ms ease;
  }

  .tab-btn:hover {
    color: var(--md-text);
    background: var(--md-bg-hover);
  }

  .tab-btn[aria-selected='true'] {
    color: var(--md-text);
    border-bottom-color: var(--md-accent);
  }

  .tab-btn:focus-visible {
    outline: 2px solid var(--md-accent);
    outline-offset: -2px;
    border-radius: 3px;
  }

  /* ── Write area (render-layer + textarea overlay) ──────────────────── */
  /*
   * CSS grid overlay model: both .render-layer and textarea occupy the same
   * grid cell (grid-area: 1/1), making them normal-flow siblings. The
   * render-layer drives the cell's height; the textarea stretches to match.
   * The write-area is the scroll container — both layers scroll together
   * with no JS sync required. This fixes overflow when the editor has a
   * fixed height set by the consumer.
   */
  .write-area {
    position: relative;
    display: grid;
    overflow-y: auto;
    min-height: 0;
    flex: 1 1 auto;
  }

  .write-area[hidden] {
    display: none;
  }

  /*
   * Render layer: highlighted HTML that drives the grid cell height.
   * pointer-events: none lets clicks pass through to the textarea on top.
   * Font metrics MUST match the textarea exactly for pixel-aligned overlay.
   */
  .render-layer {
    grid-area: 1 / 1;
    pointer-events: none;
    font-family: ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 0.875rem;
    line-height: 1.6;
    padding: 0.75rem;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    color: var(--md-text);
  }

  /*
   * Textarea: grid overlay on top of the render layer. Transparent text
   * lets highlighted content show through; caret-color keeps cursor visible.
   * overflow: hidden — the write-area is the scroll container, not textarea.
   */
  textarea {
    grid-area: 1 / 1;
    z-index: 1;
    display: block;
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    resize: none;
    background: transparent;
    color: transparent;
    caret-color: var(--md-text);
    box-sizing: border-box;
    overflow: hidden;
    font-family: ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 0.875rem;
    line-height: 1.6;
    padding: 0.75rem;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  textarea::placeholder {
    color: var(--md-text-muted);
  }

  textarea:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* ── Preview panel ──────────────────────────────────────────────────── */
  .preview-body {
    padding: 0.75rem;
    min-height: 0; /* allow flex item to shrink and scroll */
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    color: var(--md-text);
    /* .markdown-body styles come from @duskmoon-dev/core via the element */
  }

  .preview-body[hidden] {
    display: none;
  }

  /* ── Preview skeleton (shown while render pipeline loads) ──────────── */
  .preview-skeleton {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.5rem 0;
  }

  .skeleton-line {
    height: 0.875rem;
    background: linear-gradient(
      90deg,
      var(--md-bg-toolbar) 25%,
      var(--md-bg-hover) 50%,
      var(--md-bg-toolbar) 75%
    );
    background-size: 200% 100%;
    border-radius: 4px;
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
  }

  @keyframes skeleton-shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton-line {
      animation: none;
      background: var(--md-bg-hover);
    }
  }

  /* ── Mermaid diagram blocks ────────────────────────────────────────── */
  .mermaid-diagram {
    display: flex;
    justify-content: center;
    margin: 1rem 0;
    overflow-x: auto;
  }

  .mermaid-error {
    border-left: 3px solid var(--md-color-error);
    opacity: 0.7;
    position: relative;
  }

  .mermaid-error::before {
    content: 'Mermaid render failed';
    display: block;
    font-size: 0.75rem;
    color: var(--md-color-error);
    font-family: inherit;
    margin-bottom: 0.25rem;
    padding-left: 0.5rem;
  }

  /* ── Render error fallback ──────────────────────────────────────────── */
  .render-error-fallback {
    white-space: pre-wrap;
    word-wrap: break-word;
    font-size: 0.875rem;
    opacity: 0.8;
    border-left: 3px solid var(--md-color-error);
    padding-left: 0.75rem;
    color: var(--md-text-muted);
  }

  .render-error-fallback::before {
    content: 'Preview render failed — showing raw markdown';
    display: block;
    font-size: 0.75rem;
    color: var(--md-color-error);
    font-family: inherit;
    margin-bottom: 0.5rem;
  }

  /* ── Status bar ─────────────────────────────────────────────────────── */
  .status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.375rem 0.75rem;
    border-top: 1px solid var(--md-border);
    background: var(--md-bg-toolbar);
    font-size: 0.75rem;
    color: var(--md-text-muted);
    gap: 0.5rem;
  }

  .attach-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    border: none;
    background: transparent;
    color: var(--md-text-muted);
    font-family: inherit;
    font-size: 0.75rem;
    cursor: pointer;
    border-radius: 4px;
    transition:
      color 150ms ease,
      background 150ms ease;
  }

  .attach-btn:hover {
    color: var(--md-text);
    background: var(--md-bg-hover);
  }

  .attach-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    pointer-events: none;
  }

  .attach-btn:focus-visible {
    outline: 2px solid var(--md-accent);
    outline-offset: 1px;
  }

  .status-bar-count {
    margin-left: auto;
    white-space: nowrap;
  }

  .status-bar-count .warning {
    color: var(--md-color-warning);
  }

  .status-bar-count .error {
    color: var(--md-color-error);
  }

  .file-input {
    display: none;
  }

  /* ── Autocomplete dropdown ──────────────────────────────────────────── */
  /*
   * The dropdown is a direct child of :host (outside .editor) so it is not
   * clipped by .editor's overflow: hidden. :host has position: relative which
   * establishes the containing block for this absolute positioning.
   */
  .ac-dropdown {
    position: absolute;
    z-index: 100;
    left: 0.75rem;
    /* Align to bottom of the editor chrome; the editor fills 100% of :host height */
    bottom: calc(var(--md-status-bar-height, 2rem) + 4px);
    min-width: 16rem;
    max-width: 28rem;
    max-height: 16rem;
    overflow-y: auto;
    margin: 0;
    padding: 0.25rem 0;
    list-style: none;
    background: var(--md-bg);
    border: 1px solid var(--md-border);
    border-radius: var(--md-radius);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .ac-item {
    display: flex;
    flex-direction: column;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    transition: background 100ms ease;
  }

  .ac-item:hover,
  .ac-item[aria-selected='true'] {
    background: var(--md-bg-hover);
  }

  .ac-item-label {
    font-size: 0.875rem;
    color: var(--md-text);
    font-weight: 500;
  }

  .ac-item-subtitle {
    font-size: 0.75rem;
    color: var(--md-text-muted);
    margin-top: 1px;
  }

  /* ── Upload progress rows ───────────────────────────────────────────── */
  .upload-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .upload-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    border-top: 1px solid var(--md-border);
    background: var(--md-bg-toolbar);
    font-size: 0.75rem;
    color: var(--md-text-muted);
  }

  .upload-filename {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .upload-bar-track {
    width: 6rem;
    height: 3px;
    background: var(--md-border);
    border-radius: 2px;
    overflow: hidden;
    flex-shrink: 0;
  }

  .upload-bar {
    height: 100%;
    background: var(--md-upload-bar);
    border-radius: 2px;
    transition: width 150ms ease;
  }

  .upload-error-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    border-top: 1px solid var(--md-border);
    background: oklch(97% 0.02 25);
    color: var(--md-color-error);
    font-size: 0.75rem;
  }

  :host([dark]) .upload-error-row {
    background: oklch(20% 0.03 25);
  }

  .upload-error-msg {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ── Reduced motion: disable all transitions and animations ──────── */
  @media (prefers-reduced-motion: reduce) {
    .tab-btn,
    .attach-btn,
    .ac-item,
    .upload-bar {
      transition: none;
    }
  }
`;
