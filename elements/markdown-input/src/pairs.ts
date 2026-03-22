/**
 * Smart pair insertion and list/heading continuation for the markdown editor.
 *
 * Two behaviors:
 *  1. Backtick pairing   — ` → `|`  or wraps selection; ``` → fenced block
 *  2. Enter continuation — carries list bullets (*) or breaks out of headings
 */

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
    ta.value = value.slice(0, start) + '`' + selected + '`' + value.slice(end);
    ta.setSelectionRange(start + 1, end + 1);
    return true;
  }

  // Triple-backtick: two `` already before cursor → create fenced code block
  if (start >= 2 && value.slice(start - 2, start) === '``') {
    // Result: ```\n<cursor>\n```
    ta.value = value.slice(0, start) + '`\n\n```' + value.slice(end);
    ta.setSelectionRange(start + 2, start + 2);
    return true;
  }

  // Default: insert a closing backtick and leave cursor between them
  ta.value = value.slice(0, start) + '``' + value.slice(end);
  ta.setSelectionRange(start + 1, start + 1);
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
    // Remove the current line's prefix — don't add '\n'; value.slice(pos)
    // already starts with it (if content follows) or the line is at EOF.
    const newValue = value.slice(0, lineStart) + value.slice(pos);
    ta.value = newValue;
    ta.setSelectionRange(lineStart, lineStart);
  } else {
    // Insert newline + continuation prefix
    const newValue = value.slice(0, pos) + '\n' + result.prefix + value.slice(ta.selectionEnd);
    const newPos = pos + 1 + result.prefix.length;
    ta.value = newValue;
    ta.setSelectionRange(newPos, newPos);
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
 *  - { eraseCurrentLine: true }  → erase current line's content and insert "\n"
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
