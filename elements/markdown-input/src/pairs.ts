/**
 * Smart pair insertion and list/heading continuation for the markdown editor.
 *
 * Three behaviors:
 *  1. Backtick pairing   — ` → `|`  or wraps selection; ``` → fenced block
 *  2. Tab indent          — Tab inserts 2 spaces; Shift+Tab de-indents
 *  3. Enter continuation — carries list bullets (*) or breaks out of headings
 *
 * All text mutations go through `replaceRange()` which uses
 * `document.execCommand('insertText')` so that every edit participates in
 * the browser's native Ctrl+Z / Cmd+Z undo stack.
 */

// ─── Undo-safe text replacement ─────────────────────────────────────────────

/**
 * Replace a range in the textarea and position the cursor, preserving the
 * browser's native undo history.
 *
 * Uses `document.execCommand('insertText')` which, despite being deprecated,
 * is the only cross-browser mechanism for programmatic edits that integrate
 * with the undo stack. Falls back to direct `ta.value` assignment (which
 * resets undo) in environments where execCommand is unavailable (e.g. tests).
 */
function replaceRange(
  ta: HTMLTextAreaElement,
  from: number,
  to: number,
  text: string,
  cursorStart: number,
  cursorEnd?: number,
): void {
  ta.setSelectionRange(from, to);
  // execCommand is unavailable in some environments (e.g. happy-dom in tests)
  const execOk =
    typeof document.execCommand === 'function' && document.execCommand('insertText', false, text);
  if (!execOk) {
    // Fallback: direct assignment (works but resets undo history)
    ta.value = ta.value.slice(0, from) + text + ta.value.slice(to);
  }
  ta.setSelectionRange(cursorStart, cursorEnd ?? cursorStart);
}

// ─── Backtick pairing ────────────────────────────────────────────────────────

/**
 * Handle a keypress that may trigger smart pair insertion.
 * Currently only `` ` `` is paired; returns false for all other keys.
 *
 * @returns true if the event was handled (caller should preventDefault)
 */
export function handlePairKey(ta: HTMLTextAreaElement, key: string): boolean {
  if (key !== '`') return false;

  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const value = ta.value;

  // Selection: wrap the selected text in backticks
  if (start !== end) {
    const selected = value.slice(start, end);
    replaceRange(ta, start, end, '`' + selected + '`', start + 1, end + 1);
    return true;
  }

  // Triple-backtick: two `` already before cursor → create fenced code block
  if (start >= 2 && value.slice(start - 2, start) === '``') {
    // Consume any auto-closed backticks sitting after the cursor so they
    // don't end up appended after the closing fence.
    let consumeEnd = end;
    while (consumeEnd < value.length && value[consumeEnd] === '`') consumeEnd++;
    // Result: ```\n<cursor>\n```
    replaceRange(ta, start, consumeEnd, '`\n\n```', start + 2);
    return true;
  }

  // Default: insert a closing backtick and leave cursor between them
  replaceRange(ta, start, end, '``', start + 1);
  return true;
}

// ─── Tab indent ───────────────────────────────────────────────────────────────

const INDENT = '  '; // 2 spaces — standard markdown soft-tab

/**
 * Handle Tab / Shift+Tab for indent and de-indent.
 *
 * - Tab (no selection):    insert 2 spaces at cursor
 * - Tab (with selection):  add 2 spaces to every selected line
 * - Shift+Tab:             remove up to 2 leading spaces from every selected line
 *
 * @returns true if the event was handled (caller should preventDefault)
 */
export function handleTabKey(ta: HTMLTextAreaElement, e: KeyboardEvent): boolean {
  if (e.key !== 'Tab') return false;
  e.preventDefault();

  const { selectionStart: start, selectionEnd: end, value } = ta;

  // Single cursor, no shift: plain indent at cursor position
  if (start === end && !e.shiftKey) {
    replaceRange(ta, start, end, INDENT, start + INDENT.length);
    return true;
  }

  // Block indent/de-indent: operate on all lines touched by the selection
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const block = value.slice(lineStart, end);

  const transformed = e.shiftKey
    ? block.replace(/^ {1,2}/gm, '') // remove up to 2 leading spaces per line
    : block.replace(/^/gm, INDENT); // prepend 2 spaces to every line

  const delta = transformed.length - block.length;
  const firstLineLeading = block.split('\n')[0].match(/^ */)?.[0].length ?? 0;
  const firstLineDelta = e.shiftKey ? -Math.min(2, firstLineLeading) : INDENT.length;

  replaceRange(
    ta,
    lineStart,
    end,
    transformed,
    Math.max(lineStart, start + firstLineDelta),
    end + delta,
  );
  return true;
}

// ─── Enter continuation ───────────────────────────────────────────────────────

/**
 * Handle the Enter key with smart list/heading continuation.
 *
 * @returns true if the event was handled (caller should preventDefault)
 */
export function handleEnterKey(ta: HTMLTextAreaElement, e: KeyboardEvent): boolean {
  if (e.key !== 'Enter') return false;

  const pos = ta.selectionStart;
  const value = ta.value;

  // Only act on collapsed cursor (no selection)
  if (ta.selectionEnd !== pos) return false;

  // Determine the content of the current line up to the cursor
  const lineStart = value.lastIndexOf('\n', pos - 1) + 1;
  const currentLine = value.slice(lineStart, pos);

  const result = getLineContinuation(currentLine);
  if (result === null) return false;

  e.preventDefault();

  if (result.eraseCurrentLine) {
    // Remove the current line's prefix
    replaceRange(ta, lineStart, pos, '', lineStart);
  } else {
    // Insert newline + continuation prefix
    const insert = '\n' + result.prefix;
    replaceRange(ta, pos, pos, insert, pos + insert.length);
  }

  return true;
}

// ─── Continuation policy ─────────────────────────────────────────────────────

type ContinuationResult = { prefix: string; eraseCurrentLine: false } | { eraseCurrentLine: true };

/**
 * Given the text of the current line (from line-start to cursor), decide what
 * to insert when the user presses Enter.
 *
 * Return value:
 *  - null                        → do nothing (fall through to native Enter)
 *  - { prefix, eraseCurrentLine: false } → insert "\n" + prefix
 *  - { eraseCurrentLine: true }  → erase the current line's bullet prefix (no "\n" inserted)
 *
 * Rules to implement:
 *  - `* text`  → continue with `* ` on the next line
 *  - `* `      → empty bullet: erase the `* ` and break out of the list
 *  - `# text`, `## text`, `### text` (heading with content) → plain newline (no heading prefix)
 *  - anything else → null (native Enter)
 *
 * Constraints:
 *  - Ordered lists (`1. `, `2. `) are out of scope for now.
 *  - Blockquote (`> `) continuation is a bonus if you want it.
 */
export function getLineContinuation(line: string): ContinuationResult | null {
  // Empty unordered bullet → break out of list
  if (line === '* ') return { eraseCurrentLine: true };

  // Unordered list with content → continue bullet on next line
  if (/^\* ./.test(line)) return { prefix: '* ', eraseCurrentLine: false };

  // ATX heading (any level) → plain newline, no heading continuation
  if (/^#{1,6} ./.test(line)) return { prefix: '', eraseCurrentLine: false };

  return null;
}
