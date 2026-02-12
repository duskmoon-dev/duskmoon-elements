/**
 * Theme presets for DuskMoon Elements
 *
 * Each theme provides a complete set of CSS custom properties
 * that can be applied to :root or any container element.
 *
 * Usage:
 * ```html
 * <style>
 *   :root { ${sunshineTheme} }
 *   [data-theme="moonlight"] { ${moonlightTheme} }
 *   [data-theme="ocean"] { ${oceanTheme} }
 * </style>
 * ```
 */

/**
 * Sunshine theme (light) — warm, friendly, high contrast
 * Default light theme with blue primary
 */
export const sunshineTheme = `
  /* Primary */
  --color-primary: oklch(60% 0.15 250);
  --color-primary-content: white;
  --color-on-primary: white;

  /* Secondary */
  --color-secondary: oklch(55% 0.1 250);
  --color-secondary-content: white;
  --color-on-secondary: white;

  /* Tertiary */
  --color-tertiary: oklch(50% 0.12 300);
  --color-tertiary-content: white;
  --color-on-tertiary: white;

  /* Surface */
  --color-surface: white;
  --color-surface-container: oklch(97% 0.01 250);
  --color-surface-container-low: oklch(98% 0.005 250);
  --color-surface-container-high: oklch(94% 0.01 250);
  --color-surface-variant: oklch(92% 0.01 250);
  --color-on-surface: oklch(25% 0.02 250);
  --color-on-surface-variant: oklch(45% 0.02 250);
  --color-inverse-surface: oklch(25% 0.02 250);
  --color-inverse-on-surface: oklch(95% 0.01 250);

  /* Outline */
  --color-outline: oklch(75% 0.02 250);
  --color-outline-variant: oklch(85% 0.01 250);

  /* Semantic */
  --color-success: oklch(60% 0.15 145);
  --color-on-success: white;
  --color-warning: oklch(75% 0.15 85);
  --color-on-warning: oklch(25% 0.05 85);
  --color-error: oklch(55% 0.2 25);
  --color-on-error: white;
  --color-info: oklch(60% 0.15 250);
  --color-on-info: white;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

  /* Focus */
  --focus-ring: 0 0 0 2px var(--color-primary);
  --focus-ring-offset: 0 0 0 2px white, 0 0 0 4px var(--color-primary);
`;

/**
 * Moonlight theme (dark) — elegant, modern dark mode
 */
export const moonlightTheme = `
  /* Primary */
  --color-primary: oklch(72% 0.15 250);
  --color-primary-content: oklch(20% 0.05 250);
  --color-on-primary: oklch(20% 0.05 250);

  /* Secondary */
  --color-secondary: oklch(68% 0.1 250);
  --color-secondary-content: oklch(20% 0.05 250);
  --color-on-secondary: oklch(20% 0.05 250);

  /* Tertiary */
  --color-tertiary: oklch(70% 0.12 300);
  --color-tertiary-content: oklch(20% 0.05 300);
  --color-on-tertiary: oklch(20% 0.05 300);

  /* Surface */
  --color-surface: oklch(18% 0.02 250);
  --color-surface-container: oklch(22% 0.02 250);
  --color-surface-container-low: oklch(20% 0.02 250);
  --color-surface-container-high: oklch(26% 0.02 250);
  --color-surface-variant: oklch(30% 0.02 250);
  --color-on-surface: oklch(92% 0.01 250);
  --color-on-surface-variant: oklch(75% 0.02 250);
  --color-inverse-surface: oklch(92% 0.01 250);
  --color-inverse-on-surface: oklch(25% 0.02 250);

  /* Outline */
  --color-outline: oklch(45% 0.02 250);
  --color-outline-variant: oklch(35% 0.02 250);

  /* Semantic */
  --color-success: oklch(70% 0.15 145);
  --color-on-success: oklch(20% 0.05 145);
  --color-warning: oklch(80% 0.12 85);
  --color-on-warning: oklch(20% 0.05 85);
  --color-error: oklch(65% 0.2 25);
  --color-on-error: oklch(20% 0.05 25);
  --color-info: oklch(70% 0.15 250);
  --color-on-info: oklch(20% 0.05 250);

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.4);

  /* Focus */
  --focus-ring: 0 0 0 2px var(--color-primary);
  --focus-ring-offset: 0 0 0 2px oklch(18% 0.02 250), 0 0 0 4px var(--color-primary);
`;

/**
 * Ocean theme — deep blue/teal palette, calm and professional
 */
export const oceanTheme = `
  /* Primary */
  --color-primary: oklch(58% 0.12 210);
  --color-primary-content: white;
  --color-on-primary: white;

  /* Secondary */
  --color-secondary: oklch(55% 0.08 185);
  --color-secondary-content: white;
  --color-on-secondary: white;

  /* Tertiary */
  --color-tertiary: oklch(60% 0.1 170);
  --color-tertiary-content: white;
  --color-on-tertiary: white;

  /* Surface */
  --color-surface: oklch(98% 0.005 210);
  --color-surface-container: oklch(96% 0.01 210);
  --color-surface-container-low: oklch(97% 0.005 210);
  --color-surface-container-high: oklch(93% 0.01 210);
  --color-surface-variant: oklch(91% 0.01 210);
  --color-on-surface: oklch(22% 0.02 210);
  --color-on-surface-variant: oklch(40% 0.02 210);
  --color-inverse-surface: oklch(22% 0.02 210);
  --color-inverse-on-surface: oklch(95% 0.01 210);

  /* Outline */
  --color-outline: oklch(72% 0.02 210);
  --color-outline-variant: oklch(82% 0.01 210);

  /* Semantic */
  --color-success: oklch(62% 0.14 155);
  --color-on-success: white;
  --color-warning: oklch(76% 0.14 80);
  --color-on-warning: oklch(25% 0.05 80);
  --color-error: oklch(56% 0.18 20);
  --color-on-error: white;
  --color-info: oklch(58% 0.12 210);
  --color-on-info: white;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.06);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.08);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

  /* Focus */
  --focus-ring: 0 0 0 2px var(--color-primary);
  --focus-ring-offset: 0 0 0 2px oklch(98% 0.005 210), 0 0 0 4px var(--color-primary);
`;

/**
 * Forest theme — earthy greens and warm browns, natural feel
 */
export const forestTheme = `
  /* Primary */
  --color-primary: oklch(52% 0.12 155);
  --color-primary-content: white;
  --color-on-primary: white;

  /* Secondary */
  --color-secondary: oklch(50% 0.08 70);
  --color-secondary-content: white;
  --color-on-secondary: white;

  /* Tertiary */
  --color-tertiary: oklch(55% 0.1 120);
  --color-tertiary-content: white;
  --color-on-tertiary: white;

  /* Surface */
  --color-surface: oklch(97% 0.005 90);
  --color-surface-container: oklch(95% 0.01 90);
  --color-surface-container-low: oklch(96% 0.005 90);
  --color-surface-container-high: oklch(92% 0.01 90);
  --color-surface-variant: oklch(90% 0.01 90);
  --color-on-surface: oklch(22% 0.03 90);
  --color-on-surface-variant: oklch(40% 0.03 90);
  --color-inverse-surface: oklch(22% 0.03 90);
  --color-inverse-on-surface: oklch(95% 0.01 90);

  /* Outline */
  --color-outline: oklch(70% 0.03 90);
  --color-outline-variant: oklch(82% 0.01 90);

  /* Semantic */
  --color-success: oklch(58% 0.14 145);
  --color-on-success: white;
  --color-warning: oklch(74% 0.14 85);
  --color-on-warning: oklch(25% 0.05 85);
  --color-error: oklch(54% 0.18 25);
  --color-on-error: white;
  --color-info: oklch(55% 0.12 230);
  --color-on-info: white;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.08);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

  /* Focus */
  --focus-ring: 0 0 0 2px var(--color-primary);
  --focus-ring-offset: 0 0 0 2px oklch(97% 0.005 90), 0 0 0 4px var(--color-primary);
`;

/**
 * Rosé theme — soft pinks and warm tones, elegant and modern
 */
export const roseTheme = `
  /* Primary */
  --color-primary: oklch(60% 0.16 350);
  --color-primary-content: white;
  --color-on-primary: white;

  /* Secondary */
  --color-secondary: oklch(55% 0.1 330);
  --color-secondary-content: white;
  --color-on-secondary: white;

  /* Tertiary */
  --color-tertiary: oklch(58% 0.12 15);
  --color-tertiary-content: white;
  --color-on-tertiary: white;

  /* Surface */
  --color-surface: oklch(98% 0.005 350);
  --color-surface-container: oklch(96% 0.01 350);
  --color-surface-container-low: oklch(97% 0.005 350);
  --color-surface-container-high: oklch(93% 0.01 350);
  --color-surface-variant: oklch(91% 0.01 350);
  --color-on-surface: oklch(22% 0.02 350);
  --color-on-surface-variant: oklch(42% 0.02 350);
  --color-inverse-surface: oklch(22% 0.02 350);
  --color-inverse-on-surface: oklch(95% 0.005 350);

  /* Outline */
  --color-outline: oklch(72% 0.02 350);
  --color-outline-variant: oklch(84% 0.01 350);

  /* Semantic */
  --color-success: oklch(62% 0.14 148);
  --color-on-success: white;
  --color-warning: oklch(76% 0.14 82);
  --color-on-warning: oklch(25% 0.05 82);
  --color-error: oklch(55% 0.2 22);
  --color-on-error: white;
  --color-info: oklch(58% 0.14 245);
  --color-on-info: white;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.07);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

  /* Focus */
  --focus-ring: 0 0 0 2px var(--color-primary);
  --focus-ring-offset: 0 0 0 2px oklch(98% 0.005 350), 0 0 0 4px var(--color-primary);
`;

/**
 * Map of all available theme presets
 */
export const themes = {
  sunshine: sunshineTheme,
  moonlight: moonlightTheme,
  ocean: oceanTheme,
  forest: forestTheme,
  rose: roseTheme,
} as const;

export type ThemeName = keyof typeof themes;

/**
 * Apply a theme to an element by setting CSS custom properties
 *
 * @param element - The element to apply the theme to (usually document.documentElement)
 * @param theme - Theme name or custom CSS properties string
 */
export function applyTheme(element: HTMLElement, theme: ThemeName | string): void {
  const css = typeof theme === 'string' && theme in themes ? themes[theme as ThemeName] : theme;

  // Parse CSS custom properties from the theme string
  const props = css.match(/--[\w-]+:\s*[^;]+/g);
  if (props) {
    for (const prop of props) {
      const [name, ...valueParts] = prop.split(':');
      const value = valueParts.join(':').trim();
      element.style.setProperty(name.trim(), value);
    }
  }
}
