import { describe, it, expect } from 'bun:test';
import { Pagination } from '../../src/core/pagination.js';
import type { Row } from '../../src/types.js';

describe('Pagination', () => {
  const makeRows = (n: number): Row[] =>
    Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Row ${i + 1}` }));

  it('initializes with defaults', () => {
    const p = new Pagination(10);
    expect(p.currentPage).toBe(1);
    expect(p.pageSize).toBe(10);
    expect(p.totalRows).toBe(0);
    expect(p.totalPages).toBe(0);
  });

  it('calculates total pages', () => {
    const p = new Pagination(10);
    p.totalRows = 95;
    expect(p.totalPages).toBe(10); // ceil(95/10)
  });

  it('calculates start and end rows', () => {
    const p = new Pagination(10);
    p.totalRows = 50;
    p.currentPage = 3;
    expect(p.startRow).toBe(20);
    expect(p.endRow).toBe(30);
  });

  it('endRow is clamped to totalRows on last page', () => {
    const p = new Pagination(10);
    p.totalRows = 25;
    p.currentPage = 3;
    expect(p.endRow).toBe(25); // not 30
  });

  it('getPageRows slices correctly', () => {
    const p = new Pagination(3);
    const rows = makeRows(10);
    p.totalRows = 10;
    p.currentPage = 2;
    const page = p.getPageRows(rows);
    expect(page.length).toBe(3);
    expect(page[0].id).toBe(4);
    expect(page[2].id).toBe(6);
  });

  it('navigates forward and back', () => {
    const p = new Pagination(10);
    p.totalRows = 50;

    p.nextPage();
    expect(p.currentPage).toBe(2);

    p.nextPage();
    expect(p.currentPage).toBe(3);

    p.prevPage();
    expect(p.currentPage).toBe(2);
  });

  it('does not go below page 1', () => {
    const p = new Pagination(10);
    p.totalRows = 50;
    p.prevPage();
    expect(p.currentPage).toBe(1);
  });

  it('does not go beyond last page', () => {
    const p = new Pagination(10);
    p.totalRows = 50;
    p.lastPage();
    expect(p.currentPage).toBe(5);
    p.nextPage();
    expect(p.currentPage).toBe(5);
  });

  it('firstPage and lastPage work', () => {
    const p = new Pagination(10);
    p.totalRows = 50;
    p.lastPage();
    expect(p.currentPage).toBe(5);
    p.firstPage();
    expect(p.currentPage).toBe(1);
  });

  it('isFirstPage and isLastPage', () => {
    const p = new Pagination(10);
    p.totalRows = 50;
    expect(p.isFirstPage).toBe(true);
    expect(p.isLastPage).toBe(false);

    p.lastPage();
    expect(p.isFirstPage).toBe(false);
    expect(p.isLastPage).toBe(true);
  });

  it('clamps page on totalRows change', () => {
    const p = new Pagination(10);
    p.totalRows = 100;
    p.currentPage = 10;
    p.totalRows = 30;
    expect(p.currentPage).toBe(3);
  });

  it('clamps page on pageSize change', () => {
    const p = new Pagination(10);
    p.totalRows = 100;
    p.currentPage = 10;
    p.pageSize = 50;
    expect(p.currentPage).toBe(2);
  });

  it('getState returns snapshot', () => {
    const p = new Pagination(25);
    p.totalRows = 100;
    p.currentPage = 3;
    const state = p.getState();
    expect(state).toEqual({
      currentPage: 3,
      pageSize: 25,
      totalRows: 100,
      totalPages: 4,
    });
  });

  describe('getPageNumbers', () => {
    it('returns all pages when few', () => {
      const p = new Pagination(10);
      p.totalRows = 50;
      expect(p.getPageNumbers()).toEqual([1, 2, 3, 4, 5]);
    });

    it('adds ellipsis for many pages', () => {
      const p = new Pagination(10);
      p.totalRows = 200;
      p.currentPage = 10;
      const pages = p.getPageNumbers();
      expect(pages[0]).toBe(1);
      expect(pages.includes(-1)).toBe(true); // ellipsis
      expect(pages[pages.length - 1]).toBe(20);
    });

    it('shows start ellipsis when on late page', () => {
      const p = new Pagination(10);
      p.totalRows = 200;
      p.currentPage = 18;
      const pages = p.getPageNumbers();
      expect(pages[0]).toBe(1);
      expect(pages[1]).toBe(-1);
      expect(pages[pages.length - 1]).toBe(20);
    });
  });

  it('goToPage works', () => {
    const p = new Pagination(10);
    p.totalRows = 50;
    p.goToPage(3);
    expect(p.currentPage).toBe(3);
  });

  it('goToPage clamps to valid range', () => {
    const p = new Pagination(10);
    p.totalRows = 50;
    p.goToPage(999);
    expect(p.currentPage).toBe(5);
    p.goToPage(-5);
    expect(p.currentPage).toBe(1);
  });
});
