import { describe, it, expect } from 'bun:test';
import { FindBar } from '../../src/core/find-bar.js';
import type { Row, ColumnDef } from '../../src/types.js';

const columns: ColumnDef[] = [
  { field: 'name', header: 'Name' },
  { field: 'city', header: 'City' },
  { field: 'hidden', header: 'Hidden', hidden: true },
];

const rows: Row[] = [
  { name: 'Alice', city: 'New York', hidden: 'secret' },
  { name: 'Bob', city: 'San Francisco', hidden: 'secret' },
  { name: 'Charlie', city: 'New Delhi', hidden: 'secret' },
  { name: 'Diana', city: 'New Orleans', hidden: 'secret' },
];

describe('FindBar', () => {
  it('starts closed', () => {
    const fb = new FindBar();
    expect(fb.isOpen).toBe(false);
    expect(fb.matchCount).toBe(0);
  });

  it('opens and closes', () => {
    const fb = new FindBar();
    fb.open();
    expect(fb.isOpen).toBe(true);

    fb.close();
    expect(fb.isOpen).toBe(false);
    expect(fb.searchText).toBe('');
    expect(fb.matchCount).toBe(0);
  });

  describe('search', () => {
    it('finds matches across visible columns', () => {
      const fb = new FindBar();
      const matches = fb.search('New', rows, columns);

      expect(matches.length).toBe(3); // New York, New Delhi, New Orleans
    });

    it('does not search hidden columns', () => {
      const fb = new FindBar();
      const matches = fb.search('secret', rows, columns);
      expect(matches.length).toBe(0);
    });

    it('is case-insensitive by default', () => {
      const fb = new FindBar();
      const matches = fb.search('alice', rows, columns);
      expect(matches.length).toBe(1);
      expect(matches[0].field).toBe('name');
      expect(matches[0].rowIndex).toBe(0);
    });

    it('respects case-sensitive flag', () => {
      const fb = new FindBar();
      fb.caseSensitive = true;
      const matches = fb.search('alice', rows, columns);
      expect(matches.length).toBe(0);
    });

    it('finds multiple matches in same cell', () => {
      const fb = new FindBar();
      const testRows: Row[] = [{ name: 'abab' }];
      const testCols: ColumnDef[] = [{ field: 'name', header: 'Name' }];

      const matches = fb.search('ab', testRows, testCols);
      expect(matches.length).toBe(2);
      expect(matches[0].startIndex).toBe(0);
      expect(matches[1].startIndex).toBe(2);
    });

    it('returns empty for empty search text', () => {
      const fb = new FindBar();
      const matches = fb.search('', rows, columns);
      expect(matches.length).toBe(0);
    });

    it('handles null values gracefully', () => {
      const fb = new FindBar();
      const nullRows: Row[] = [{ name: null, city: undefined }];
      const matches = fb.search('test', nullRows, columns);
      expect(matches.length).toBe(0);
    });

    it('sets currentMatchIndex to 0 when matches found', () => {
      const fb = new FindBar();
      fb.search('New', rows, columns);
      expect(fb.currentMatchIndex).toBe(0);
    });

    it('keeps currentMatchIndex at -1 when no matches', () => {
      const fb = new FindBar();
      fb.search('xyz', rows, columns);
      expect(fb.currentMatchIndex).toBe(-1);
    });
  });

  describe('navigation', () => {
    it('nextMatch cycles through matches', () => {
      const fb = new FindBar();
      fb.search('New', rows, columns); // 3 matches

      expect(fb.currentMatchIndex).toBe(0);

      fb.nextMatch();
      expect(fb.currentMatchIndex).toBe(1);

      fb.nextMatch();
      expect(fb.currentMatchIndex).toBe(2);

      fb.nextMatch(); // wraps around
      expect(fb.currentMatchIndex).toBe(0);
    });

    it('previousMatch cycles backward', () => {
      const fb = new FindBar();
      fb.search('New', rows, columns);

      fb.previousMatch(); // wraps to last
      expect(fb.currentMatchIndex).toBe(2);

      fb.previousMatch();
      expect(fb.currentMatchIndex).toBe(1);
    });

    it('nextMatch returns null when no matches', () => {
      const fb = new FindBar();
      expect(fb.nextMatch()).toBeNull();
    });

    it('previousMatch returns null when no matches', () => {
      const fb = new FindBar();
      expect(fb.previousMatch()).toBeNull();
    });

    it('currentMatch returns the match object', () => {
      const fb = new FindBar();
      fb.search('Alice', rows, columns);

      const match = fb.currentMatch;
      expect(match).not.toBeNull();
      expect(match!.rowIndex).toBe(0);
      expect(match!.field).toBe('name');
      expect(match!.startIndex).toBe(0);
      expect(match!.endIndex).toBe(5);
    });
  });

  describe('cell query helpers', () => {
    it('hasMatch returns true for cells with matches', () => {
      const fb = new FindBar();
      fb.search('Alice', rows, columns);
      expect(fb.hasMatch(0, 'name')).toBe(true);
      expect(fb.hasMatch(1, 'name')).toBe(false);
    });

    it('isCurrentMatch checks current match position', () => {
      const fb = new FindBar();
      fb.search('New', rows, columns);
      expect(fb.isCurrentMatch(0, 'city')).toBe(true);
      expect(fb.isCurrentMatch(2, 'city')).toBe(false);
    });

    it('getMatchesInCell returns matches for a specific cell', () => {
      const fb = new FindBar();
      const testRows: Row[] = [{ name: 'banana' }];
      const testCols: ColumnDef[] = [{ field: 'name', header: 'Name' }];
      fb.search('an', testRows, testCols);

      const cellMatches = fb.getMatchesInCell(0, 'name');
      expect(cellMatches.length).toBe(2);
    });
  });

  describe('state', () => {
    it('returns complete state', () => {
      const fb = new FindBar();
      fb.open();
      fb.search('New', rows, columns);

      const state = fb.state;
      expect(state.open).toBe(true);
      expect(state.searchText).toBe('New');
      expect(state.caseSensitive).toBe(false);
      expect(state.matches.length).toBe(3);
      expect(state.currentMatchIndex).toBe(0);
    });
  });

  describe('render', () => {
    it('returns empty when closed', () => {
      const fb = new FindBar();
      expect(fb.render()).toBe('');
    });

    it('renders find bar HTML when open', () => {
      const fb = new FindBar();
      fb.open();
      fb.search('New', rows, columns);

      const html = fb.render();
      expect(html).toContain('grid-find-bar');
      expect(html).toContain('find-bar-input');
      expect(html).toContain('1 of 3');
    });

    it('shows "No matches" when search has no results', () => {
      const fb = new FindBar();
      fb.open();
      fb.search('xyz', rows, columns);

      const html = fb.render();
      expect(html).toContain('No matches');
    });

    it('escapes special characters in search text attribute', () => {
      const fb = new FindBar();
      fb.open();
      const testRows: Row[] = [{ name: 'test' }];
      const testCols: ColumnDef[] = [{ field: 'name', header: 'Name' }];
      fb.search('"<script>&amp;', testRows, testCols);

      const html = fb.render();
      // Must not contain raw " inside value attribute
      expect(html).not.toContain('value=""<script>');
      // Must escape & before other entities
      expect(html).toContain('&amp;amp;');
      expect(html).toContain('&quot;');
      expect(html).toContain('&lt;script&gt;');
    });
  });
});
