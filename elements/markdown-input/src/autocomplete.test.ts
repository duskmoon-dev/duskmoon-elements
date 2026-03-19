import { describe, test, expect } from 'bun:test';
import { detectTrigger, confirmSuggestion, renderDropdown } from './autocomplete.js';

describe('detectTrigger', () => {
  test('detects @ at start of string', () => {
    const result = detectTrigger('@ali', 4);
    expect(result).toEqual({ trigger: '@', query: 'ali', triggerPos: 0 });
  });

  test('detects # at start of string', () => {
    const result = detectTrigger('#bug', 4);
    expect(result).toEqual({ trigger: '#', query: 'bug', triggerPos: 0 });
  });

  test('detects @ after space', () => {
    const result = detectTrigger('Hello @ali', 10);
    expect(result).toEqual({ trigger: '@', query: 'ali', triggerPos: 6 });
  });

  test('returns empty query when cursor is directly on trigger', () => {
    const result = detectTrigger('@', 1);
    expect(result).toEqual({ trigger: '@', query: '', triggerPos: 0 });
  });

  test('returns null when no trigger found', () => {
    expect(detectTrigger('hello world', 11)).toBeNull();
  });

  test('returns null when whitespace is in query', () => {
    // "@ ali" — space after trigger, so cursor is in plain text
    expect(detectTrigger('@ ali', 5)).toBeNull();
  });

  test('returns null when trigger is mid-word (no space before)', () => {
    // "user@domain" — @ is not preceded by whitespace
    expect(detectTrigger('user@domain', 11)).toBeNull();
  });

  test('returns null when cursor is at position 0', () => {
    expect(detectTrigger('', 0)).toBeNull();
  });

  test('returns null when cursor is after a space (no trigger in range)', () => {
    expect(detectTrigger('foo bar ', 8)).toBeNull();
  });

  test('detects # after newline', () => {
    const text = 'line one\n#issue';
    const result = detectTrigger(text, text.length);
    expect(result).toEqual({ trigger: '#', query: 'issue', triggerPos: 9 });
  });

  test('handles partial query correctly', () => {
    const text = 'assign @jo';
    const result = detectTrigger(text, text.length);
    expect(result).toEqual({ trigger: '@', query: 'jo', triggerPos: 7 });
  });
});

describe('confirmSuggestion', () => {
  test('replaces @ query with suggestion id', () => {
    const { newValue, newCursorPos } = confirmSuggestion('@ali', 0, 4, '@', 'asmith');
    expect(newValue).toBe('@asmith');
    expect(newCursorPos).toBe(7);
  });

  test('replaces # query in mid-string', () => {
    const { newValue, newCursorPos } = confirmSuggestion('fix #bug here', 4, 8, '#', '42');
    expect(newValue).toBe('fix #42 here');
    expect(newCursorPos).toBe(7);
  });

  test('preserves text before and after trigger span', () => {
    const text = 'Hello @al world';
    const { newValue } = confirmSuggestion(text, 6, 9, '@', 'alice');
    expect(newValue).toBe('Hello @alice world');
  });

  test('handles trigger at end of string', () => {
    const { newValue, newCursorPos } = confirmSuggestion('ping @', 5, 6, '@', 'bob');
    expect(newValue).toBe('ping @bob');
    expect(newCursorPos).toBe(9);
  });

  test('handles empty replacement', () => {
    const { newValue } = confirmSuggestion('@query', 0, 6, '@', '');
    expect(newValue).toBe('@');
  });
});

describe('renderDropdown', () => {
  test('returns empty string for empty suggestions', () => {
    expect(renderDropdown([], -1)).toBe('');
  });

  test('renders a single suggestion', () => {
    const html = renderDropdown([{ id: 'alice', label: 'Alice Smith' }], -1);
    expect(html).toContain('Alice Smith');
    expect(html).toContain('aria-selected="false"');
    expect(html).toContain('data-ac-index="0"');
  });

  test('marks selected item with aria-selected="true"', () => {
    const html = renderDropdown(
      [
        { id: 'a', label: 'Alpha' },
        { id: 'b', label: 'Beta' },
      ],
      1,
    );
    expect(html).toContain('id="ac-item-1"');
    // The second item should be selected
    const lines = html.split('\n');
    const betaLine = lines.find((l) => l.includes('ac-item-1'));
    expect(betaLine).toContain('aria-selected="true"');
  });

  test('renders subtitle when provided', () => {
    const html = renderDropdown([{ id: 'x', label: 'Xavier', subtitle: 'Engineering' }], -1);
    expect(html).toContain('Engineering');
    expect(html).toContain('ac-item-subtitle');
  });

  test('omits subtitle span when not provided', () => {
    const html = renderDropdown([{ id: 'y', label: 'Yara' }], -1);
    expect(html).not.toContain('ac-item-subtitle');
  });

  test('escapes HTML special chars in label', () => {
    const html = renderDropdown([{ id: 'z', label: '<script>alert(1)</script>' }], -1);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  test('escapes HTML special chars in subtitle', () => {
    const html = renderDropdown([{ id: 'z', label: 'Name', subtitle: '&<>"' }], -1);
    expect(html).toContain('&amp;');
    expect(html).toContain('&lt;');
    expect(html).not.toContain('"&<>"');
  });
});
