/**
 * Status bar utilities: word/character counting and colour thresholds.
 */

/**
 * Count words in a string using the algorithm specified in the PRD:
 * trim, split on whitespace, filter empty strings.
 */
export function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Determine the CSS colour class for the word count display.
 *
 * @param wordCount  Current word count
 * @param maxWords   The configured maximum, or null if uncapped
 * @returns 'normal' | 'warning' | 'error'
 */
export function countColour(
  wordCount: number,
  maxWords: number | null,
): 'normal' | 'warning' | 'error' {
  if (!maxWords) return 'normal';
  const pct = (wordCount / maxWords) * 100;
  if (pct >= 100) return 'error';
  if (pct >= 90) return 'warning';
  return 'normal';
}

/**
 * Render the HTML content for the .status-bar-count span.
 *
 * @param wordCount  Current word count
 * @param charCount  Current character count
 * @param maxWords   Configured cap, or null/undefined if uncapped
 */
export function renderStatusCount(
  wordCount: number,
  charCount: number,
  maxWords: number | null | undefined,
): string {
  const cap = maxWords ?? null;
  const colour = countColour(wordCount, cap);
  const colourClass = colour !== 'normal' ? ` class="${colour}"` : '';

  if (cap) {
    return `<span${colourClass}>${wordCount} / ${cap} words · ${charCount} chars</span>`;
  }
  return `<span>${wordCount} words · ${charCount} chars</span>`;
}
