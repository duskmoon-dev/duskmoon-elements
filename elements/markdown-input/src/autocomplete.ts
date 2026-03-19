/**
 * Autocomplete utilities for @mention and #reference detection.
 */

import type { Suggestion } from './types.js';

/**
 * Scan backward from cursorPos through value to detect an active @word or #word trigger.
 *
 * Rules:
 * - Scan character by character backward from cursor
 * - If a whitespace or newline is encountered before a trigger char → no trigger
 * - If @ or # is found → extract the query (text between trigger and cursor)
 * - The query must not contain any whitespace
 *
 * @returns Trigger info or null if no active trigger
 */
export function detectTrigger(
  value: string,
  cursorPos: number,
): { trigger: '@' | '#'; query: string; triggerPos: number } | null {
  let i = cursorPos - 1;

  while (i >= 0) {
    const ch = value[i];

    if (ch === '@' || ch === '#') {
      const query = value.slice(i + 1, cursorPos);
      // Only activate if there's no whitespace in the query
      if (!/\s/.test(query)) {
        // Make sure the char before the trigger is whitespace, start-of-string, or trigger is at position 0
        const before = i > 0 ? value[i - 1] : null;
        if (before === null || /\s/.test(before)) {
          return { trigger: ch as '@' | '#', query, triggerPos: i };
        }
      }
      return null;
    }

    if (/\s/.test(ch)) {
      // Hit whitespace before finding a trigger
      return null;
    }

    i--;
  }

  return null;
}

/**
 * Replace the trigger+query span in value with the confirmed replacement.
 *
 * For a mention: `@ali` → `@asmith` (trigger is preserved in replacement)
 * The replacement value should NOT include the trigger prefix — we add it.
 *
 * @param value       Full textarea value
 * @param triggerPos  Index of the @ or # character
 * @param cursorPos   Current cursor position (end of query)
 * @param trigger     The trigger character used
 * @param replacement The id from the selected suggestion
 * @returns           New value and new cursor position
 */
export function confirmSuggestion(
  value: string,
  triggerPos: number,
  cursorPos: number,
  trigger: '@' | '#',
  replacement: string,
): { newValue: string; newCursorPos: number } {
  const before = value.slice(0, triggerPos);
  const after = value.slice(cursorPos);
  const inserted = `${trigger}${replacement}`;
  // Add a trailing space so the user can continue typing immediately,
  // unless the next character is already a space or we're at end of line
  const needsSpace = after.length === 0 || (after[0] !== ' ' && after[0] !== '\n');
  const suffix = needsSpace ? ' ' : '';
  const newValue = before + inserted + suffix + after;
  const newCursorPos = triggerPos + inserted.length + suffix.length;
  return { newValue, newCursorPos };
}

/**
 * Render the HTML for the autocomplete dropdown list.
 *
 * @param suggestions    Current suggestion list
 * @param selectedIndex  0-based highlighted item (-1 = none)
 */
export function renderDropdown(suggestions: Suggestion[], selectedIndex: number): string {
  if (suggestions.length === 0) return '';

  const items = suggestions
    .map((s, i) => {
      const selected = i === selectedIndex ? ' aria-selected="true"' : ' aria-selected="false"';
      const subtitle = s.subtitle
        ? `<span class="ac-item-subtitle">${escapeHtml(s.subtitle)}</span>`
        : '';
      return `<li id="ac-item-${i}" class="ac-item" role="option" data-ac-index="${i}"${selected}>
        <span class="ac-item-label">${escapeHtml(s.label)}</span>${subtitle}
      </li>`;
    })
    .join('');

  return items;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
