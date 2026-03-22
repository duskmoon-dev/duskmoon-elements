import { describe, test, expect } from 'bun:test';
import { handlePairKey, handleEnterKey, getLineContinuation } from './pairs.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeTextarea(value: string, start: number, end = start): HTMLTextAreaElement {
  const ta = document.createElement('textarea');
  ta.value = value;
  ta.setSelectionRange(start, end);
  return ta;
}

function makeKeyEvent(key: string): KeyboardEvent {
  // happy-dom test env does not expose KeyboardEvent on globalThis — use a mock.
  // handleEnterKey only reads e.key and calls e.preventDefault().
  let defaultPrevented = false;
  return {
    key,
    preventDefault: () => {
      defaultPrevented = true;
    },
    get defaultPrevented() {
      return defaultPrevented;
    },
  } as unknown as KeyboardEvent;
}

// ─── getLineContinuation ──────────────────────────────────────────────────────

describe('getLineContinuation', () => {
  test('returns null for plain text', () => {
    expect(getLineContinuation('hello world')).toBeNull();
  });

  test('returns null for empty string', () => {
    expect(getLineContinuation('')).toBeNull();
  });

  test('returns continuation prefix for bullet with content', () => {
    expect(getLineContinuation('* todo item')).toEqual({ prefix: '* ', eraseCurrentLine: false });
  });

  test('returns continuation prefix for bullet with single char content', () => {
    expect(getLineContinuation('* x')).toEqual({ prefix: '* ', eraseCurrentLine: false });
  });

  test('returns eraseCurrentLine for empty bullet "* "', () => {
    expect(getLineContinuation('* ')).toEqual({ eraseCurrentLine: true });
  });

  test('returns plain newline prefix for H1 heading with content', () => {
    expect(getLineContinuation('# Heading')).toEqual({ prefix: '', eraseCurrentLine: false });
  });

  test('returns plain newline prefix for H2 heading', () => {
    expect(getLineContinuation('## Section')).toEqual({ prefix: '', eraseCurrentLine: false });
  });

  test('returns plain newline prefix for H3 heading', () => {
    expect(getLineContinuation('### Subsection')).toEqual({ prefix: '', eraseCurrentLine: false });
  });

  test('returns plain newline prefix for H6 heading', () => {
    expect(getLineContinuation('###### Deep')).toEqual({ prefix: '', eraseCurrentLine: false });
  });

  test('returns null for heading marker without space (not a real heading)', () => {
    expect(getLineContinuation('#nospace')).toBeNull();
  });

  test('returns null for standalone asterisk (not a list item)', () => {
    expect(getLineContinuation('*')).toBeNull();
  });

  test('returns null for code fence', () => {
    expect(getLineContinuation('```javascript')).toBeNull();
  });

  test('returns null for numbered list (out of scope)', () => {
    expect(getLineContinuation('1. item')).toBeNull();
  });
});

// ─── handlePairKey ────────────────────────────────────────────────────────────

describe('handlePairKey', () => {
  test('returns false for non-backtick keys', () => {
    const ta = makeTextarea('hello', 3);
    expect(handlePairKey(ta, 'a')).toBe(false);
    expect(handlePairKey(ta, '"')).toBe(false);
    expect(handlePairKey(ta, "'")).toBe(false);
  });

  test('inserts closing backtick and positions cursor between them', () => {
    // cursor at 5 (after 'hello', before ' world') — space is preserved
    const ta = makeTextarea('hello world', 5);
    const handled = handlePairKey(ta, '`');
    expect(handled).toBe(true);
    expect(ta.value).toBe('hello`` world');
    expect(ta.selectionStart).toBe(6);
    expect(ta.selectionEnd).toBe(6);
  });

  test('inserts backtick at start of content', () => {
    const ta = makeTextarea('hello', 0);
    handlePairKey(ta, '`');
    expect(ta.value).toBe('``hello');
    expect(ta.selectionStart).toBe(1);
  });

  test('inserts backtick at end of content', () => {
    const ta = makeTextarea('hello', 5);
    handlePairKey(ta, '`');
    expect(ta.value).toBe('hello``');
    expect(ta.selectionStart).toBe(6);
  });

  test('wraps selected text in backticks', () => {
    const ta = makeTextarea('hello world', 6, 11);
    const handled = handlePairKey(ta, '`');
    expect(handled).toBe(true);
    expect(ta.value).toBe('hello `world`');
    expect(ta.selectionStart).toBe(7);
    expect(ta.selectionEnd).toBe(12);
  });

  test('creates fenced code block when two backticks precede cursor', () => {
    const ta = makeTextarea('``', 2);
    const handled = handlePairKey(ta, '`');
    expect(handled).toBe(true);
    // Result: ```\n\n```  (cursor on the blank line between fences)
    expect(ta.value).toBe('```\n\n```');
    expect(ta.selectionStart).toBe(4); // start+2 = 2+2 = 4
    expect(ta.selectionEnd).toBe(4);
  });

  test('does not create fenced block when only one backtick precedes cursor', () => {
    const ta = makeTextarea('`', 1);
    handlePairKey(ta, '`');
    expect(ta.value).toBe('``' + '`'); // inserts closing backtick
    // Not a fenced block, just a pair
  });

  test('fenced block created mid-text preserves trailing content', () => {
    const ta = makeTextarea('`` suffix', 2);
    handlePairKey(ta, '`');
    expect(ta.value).toBe('```\n\n``` suffix');
  });
});

// ─── handleEnterKey ───────────────────────────────────────────────────────────

describe('handleEnterKey', () => {
  test('returns false for non-Enter keys', () => {
    const ta = makeTextarea('* item\n', 6);
    const e = makeKeyEvent('a');
    expect(handleEnterKey(ta, e)).toBe(false);
  });

  test('returns false when cursor is in a selection (not collapsed)', () => {
    const ta = makeTextarea('* item', 2, 6);
    const e = makeKeyEvent('Enter');
    expect(handleEnterKey(ta, e)).toBe(false);
  });

  test('returns false for plain text lines', () => {
    const ta = makeTextarea('just text', 9);
    const e = makeKeyEvent('Enter');
    expect(handleEnterKey(ta, e)).toBe(false);
  });

  test('continues bullet list on Enter', () => {
    const ta = makeTextarea('* item', 6);
    const e = makeKeyEvent('Enter');
    const handled = handleEnterKey(ta, e);
    expect(handled).toBe(true);
    expect(ta.value).toBe('* item\n* ');
    expect(ta.selectionStart).toBe(9);
  });

  test('continues bullet mid-document', () => {
    // cursor at 6 (end of '* item'), value.slice(6) = '\nsuffix' — newline is preserved
    const ta = makeTextarea('* item\nsuffix', 6);
    const e = makeKeyEvent('Enter');
    handleEnterKey(ta, e);
    expect(ta.value).toBe('* item\n* \nsuffix');
  });

  test('breaks out of empty bullet on Enter', () => {
    const ta = makeTextarea('* ', 2);
    const e = makeKeyEvent('Enter');
    const handled = handleEnterKey(ta, e);
    expect(handled).toBe(true);
    // happy-dom normalizes a lone '\n' textarea value to ''; real browsers keep it.
    // Cursor is placed at 1 (or 0 if happy-dom clamps on empty string).
    expect(['', '\n']).toContain(ta.value);
    expect([0, 1]).toContain(ta.selectionStart);
  });

  test('heading: Enter inserts plain newline without heading prefix', () => {
    const ta = makeTextarea('## Title', 8);
    const e = makeKeyEvent('Enter');
    const handled = handleEnterKey(ta, e);
    expect(handled).toBe(true);
    expect(ta.value).toBe('## Title\n');
    expect(ta.selectionStart).toBe(9);
  });

  test('heading H1: Enter inserts plain newline', () => {
    const ta = makeTextarea('# Intro', 7);
    const e = makeKeyEvent('Enter');
    handleEnterKey(ta, e);
    expect(ta.value).toBe('# Intro\n');
  });

  test('Enter in middle of multiline document continues bullet on correct line', () => {
    const ta = makeTextarea('first line\n* item\n', 17);
    const e = makeKeyEvent('Enter');
    handleEnterKey(ta, e);
    expect(ta.value).toBe('first line\n* item\n* \n');
    expect(ta.selectionStart).toBe(20); // 17 + 1 (\n) + 2 ('* ') = 20
  });

  test('returns false for empty textarea', () => {
    const ta = makeTextarea('', 0);
    const e = makeKeyEvent('Enter');
    expect(handleEnterKey(ta, e)).toBe(false);
  });
});
