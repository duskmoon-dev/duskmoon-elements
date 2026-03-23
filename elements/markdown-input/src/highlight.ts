/**
 * Prism.js CDN loader + backdrop highlight utilities.
 *
 * Prism is loaded lazily as a UMD script from cdnjs. A module-level Promise
 * caches the load so multiple elements on the same page share one request.
 * If the CDN is unavailable the element degrades gracefully — text entry and
 * form submission continue to work, just without syntax colouring.
 */

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Prism?: any;
  }
}

const PRISM_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0';
const PRISM_CORE_URL = `${PRISM_BASE}/prism.min.js`;
const PRISM_AUTOLOADER_URL = `${PRISM_BASE}/plugins/autoloader/prism-autoloader.min.js`;

// Subresource Integrity hashes for Prism 1.29.0 from cdnjs.
// Update these whenever the CDN URL or version changes.
const PRISM_SRI: Record<string, string> = {
  [PRISM_CORE_URL]:
    'sha512-7Z9J3l1+EYfeaPKcGXu3MS/7T+w19WtKQY/n+xzmw4hZhJ9tyYmcUS+4QqAlzhicE5LAfMQSF3iFTK9bQdTxXg==',
  [PRISM_AUTOLOADER_URL]:
    'sha512-SkmBfuA2hqjzEVpmnMt/LINrjop3GKWqsuLSSB3e7iBmYK7JuWw4ldmmxwD9mdm2IRTTi0OxSAfEGvgEi0i2Kw==',
};
const PRISM_THEME_DARK_URL = `${PRISM_BASE}/themes/prism-tomorrow.min.css`;
const PRISM_THEME_LIGHT_URL = `${PRISM_BASE}/themes/prism-coy.min.css`;

/** Cached load promise — shared across all instances on the page. */
let _prismReady: Promise<void> | null = null;

/** Inject a script tag into document.head and resolve when loaded. */
function _loadScript(src: string): Promise<void> {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    // Apply Subresource Integrity if available, to guard against CDN compromise.
    const integrity = PRISM_SRI[src];
    if (integrity) {
      script.integrity = integrity;
      script.crossOrigin = 'anonymous';
    }
    script.onload = () => resolve();
    script.onerror = () => resolve(); // resolve even on error (graceful degrade)
    document.head.appendChild(script);
  });
}

/**
 * Ensure Prism is loaded and ready. Returns a cached Promise after the first call.
 * Safe to call multiple times — only one network request is ever made.
 * If loading fails (e.g. network error), the cache is cleared so the next call retries.
 */
export function ensurePrism(): Promise<void> {
  if (window.Prism) return Promise.resolve();
  if (_prismReady) return _prismReady;

  _prismReady = _loadScript(PRISM_CORE_URL).then(() => {
    if (!window.Prism) {
      // Script failed to load — clear cache so next call retries
      _prismReady = null;
      return;
    }
    // Configure autoloader before loading it
    window.Prism.manual = true;
    return _loadScript(PRISM_AUTOLOADER_URL).then(() => {
      if (window.Prism?.plugins?.autoloader) {
        // Security note: individual language grammar scripts (e.g. prism-python.min.js)
        // loaded by the autoloader are fetched from the same cdnjs base URL but without
        // per-file SRI hashes. A compromised CDN could serve malicious grammar scripts.
        // Acceptable trade-off for syntax highlighting; mitigated by SRI on core + autoloader.
        // TODO: consider bundling commonly-used grammars statically to remove this gap.
        window.Prism.plugins.autoloader.languages_path = `${PRISM_BASE}/components/`;
      }
    });
  });

  return _prismReady;
}

/**
 * Escape HTML special characters in the given text.
 * Escapes & first to prevent double-escaping.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Highlight markdown text using Prism and return an HTML string.
 * If Prism is not available, returns the HTML-escaped text unchanged.
 *
 * Appends a non-breaking space to prevent the backdrop div from collapsing
 * when the textarea value ends with a newline.
 */
export function highlightMarkdown(text: string): string {
  const escaped = escapeHtml(text);

  if (!window.Prism?.languages?.markdown) {
    // Prism not ready yet — return escaped plain text
    return escaped + '\u00a0';
  }

  try {
    const highlighted = window.Prism.highlight(text, window.Prism.languages.markdown, 'markdown');
    return highlighted + '\u00a0';
  } catch {
    return escaped + '\u00a0';
  }
}

/**
 * Inject or update a Prism syntax theme inside the given shadow root.
 * Uses a <style id="prism-theme"> element with an @import so the browser
 * caches the CDN stylesheet normally.
 */
export function applyPrismTheme(shadowRoot: ShadowRoot, dark: boolean): void {
  const themeUrl = dark ? PRISM_THEME_DARK_URL : PRISM_THEME_LIGHT_URL;
  let styleEl = shadowRoot.getElementById('prism-theme') as HTMLStyleElement | null;

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'prism-theme';
    shadowRoot.appendChild(styleEl);
  }

  const expected = `@import url("${themeUrl}");`;
  if (styleEl.textContent !== expected) {
    styleEl.textContent = expected;
  }
}
