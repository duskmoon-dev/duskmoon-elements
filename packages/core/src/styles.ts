/**
 * CSS-in-JS utilities for constructable stylesheets
 */

/**
 * Cache for constructed stylesheets
 */
const styleSheetCache = new WeakMap<TemplateStringsArray, CSSStyleSheet>();

/**
 * Creates a CSSStyleSheet from a template literal
 * Results are cached for performance
 *
 * @example
 * ```ts
 * const styles = css`
 *   :host {
 *     display: block;
 *   }
 * `;
 * ```
 *
 * @param strings - Template literal strings
 * @param values - Interpolated values
 * @returns A CSSStyleSheet instance
 */
export function css(strings: TemplateStringsArray, ...values: (string | number)[]): CSSStyleSheet {
  // Check cache first
  const cached = styleSheetCache.get(strings);
  if (cached && values.length === 0) {
    return cached;
  }

  // Construct the CSS string
  let cssText = strings[0];
  for (let i = 0; i < values.length; i++) {
    cssText += String(values[i]) + strings[i + 1];
  }

  // Create and cache the stylesheet
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(cssText);

  // Only cache if there are no dynamic values
  if (values.length === 0) {
    styleSheetCache.set(strings, sheet);
  }

  return sheet;
}

/**
 * Combines multiple CSSStyleSheet instances into an array
 * Useful for composing styles from multiple sources
 *
 * @param sheets - Stylesheets to combine
 * @returns Array of stylesheets
 */
export function combineStyles(...sheets: CSSStyleSheet[]): CSSStyleSheet[] {
  return sheets;
}

/**
 * Creates CSS custom property declarations from an object
 *
 * @example
 * ```ts
 * const vars = cssVars({
 *   'color-primary': 'oklch(60% 0.15 250)',
 *   'spacing-md': '1rem'
 * });
 * // Returns: '--color-primary: oklch(60% 0.15 250); --spacing-md: 1rem;'
 * ```
 *
 * @param vars - Object of variable names to values
 * @returns CSS custom property declarations string
 */
export function cssVars(vars: Record<string, string | number>): string {
  return Object.entries(vars)
    .map(([key, value]) => `--${key}: ${value}`)
    .join('; ');
}

/**
 * Default theme CSS custom properties
 * Uses --color-* naming to be compatible with @duskmoon-dev/core
 *
 * Note: Color variables are NOT set here to allow inheritance from document.
 * Document should provide these via :root or [data-theme] selectors.
 * Only non-color design tokens are set as defaults.
 */
export const defaultTheme = css`
  :host {
    /* Typography - safe to set defaults */
    --font-family: system-ui, -apple-system, sans-serif;
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-md: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;

    /* Spacing - safe to set defaults */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;

    /* Border Radius - safe to set defaults */
    --radius-sm: 0.25rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
    --radius-full: 9999px;

    /* Transitions - safe to set defaults */
    --transition-fast: 150ms ease;
    --transition-normal: 200ms ease;
    --transition-slow: 300ms ease;
  }
`;

/**
 * Light theme color defaults
 * Apply this to :root or document for light theme
 */
export const lightThemeColors = `
  /* Primary colors */
  --color-primary: oklch(60% 0.15 250);
  --color-primary-content: white;
  --color-on-primary: white;

  /* Secondary colors */
  --color-secondary: oklch(55% 0.1 250);
  --color-secondary-content: white;
  --color-on-secondary: white;

  /* Tertiary colors */
  --color-tertiary: oklch(50% 0.12 300);
  --color-tertiary-content: white;
  --color-on-tertiary: white;

  /* Surface colors */
  --color-surface: white;
  --color-surface-container: oklch(97% 0.01 250);
  --color-surface-container-low: oklch(98% 0.005 250);
  --color-surface-container-high: oklch(94% 0.01 250);
  --color-on-surface: oklch(25% 0.02 250);
  --color-on-surface-variant: oklch(45% 0.02 250);

  /* Outline colors */
  --color-outline: oklch(75% 0.02 250);
  --color-outline-variant: oklch(85% 0.01 250);

  /* Semantic colors */
  --color-success: oklch(60% 0.15 145);
  --color-warning: oklch(75% 0.15 85);
  --color-error: oklch(55% 0.2 25);
  --color-info: oklch(60% 0.15 250);

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

  /* Focus */
  --focus-ring: 0 0 0 2px var(--color-primary);
  --focus-ring-offset: 0 0 0 2px white, 0 0 0 4px var(--color-primary);
`;

/**
 * Reset styles for Shadow DOM elements
 */
export const resetStyles = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    font-family: var(--font-family, system-ui, -apple-system, sans-serif);
  }

  :host([hidden]) {
    display: none !important;
  }
`;
