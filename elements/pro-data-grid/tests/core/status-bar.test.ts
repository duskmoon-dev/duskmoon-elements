import { describe, it, expect } from 'bun:test';
import { StatusBar } from '../../src/core/status-bar.js';

describe('StatusBar', () => {
  it('starts disabled', () => {
    const bar = new StatusBar();
    expect(bar.enabled).toBe(false);
  });

  describe('buildPanels', () => {
    it('builds total rows panel', () => {
      const bar = new StatusBar();
      bar.enabled = true;

      const panels = bar.buildPanels({
        totalRows: 100,
        filteredRows: 100,
        selectedRows: 0,
      });

      const totalPanel = panels.find((p) => p.id === 'totalRows');
      expect(totalPanel).toBeDefined();
      expect(totalPanel!.value).toBe(100);
      expect(totalPanel!.position).toBe('left');
    });

    it('shows filtered count when different from total', () => {
      const bar = new StatusBar();
      bar.enabled = true;

      const panels = bar.buildPanels({
        totalRows: 100,
        filteredRows: 50,
        selectedRows: 0,
      });

      const filteredPanel = panels.find((p) => p.id === 'filteredRows');
      expect(filteredPanel).toBeDefined();
      expect(filteredPanel!.value).toBe(50);
    });

    it('hides filtered count when same as total', () => {
      const bar = new StatusBar();
      bar.enabled = true;

      const panels = bar.buildPanels({
        totalRows: 100,
        filteredRows: 100,
        selectedRows: 0,
      });

      const filteredPanel = panels.find((p) => p.id === 'filteredRows');
      expect(filteredPanel).toBeUndefined();
    });

    it('shows selected count when > 0', () => {
      const bar = new StatusBar();
      bar.enabled = true;

      const panels = bar.buildPanels({
        totalRows: 100,
        filteredRows: 100,
        selectedRows: 5,
      });

      const selectedPanel = panels.find((p) => p.id === 'selectedRows');
      expect(selectedPanel).toBeDefined();
      expect(selectedPanel!.value).toBe(5);
      expect(selectedPanel!.position).toBe('center');
    });

    it('hides selected count when 0', () => {
      const bar = new StatusBar();
      bar.enabled = true;

      const panels = bar.buildPanels({
        totalRows: 100,
        filteredRows: 100,
        selectedRows: 0,
      });

      const selectedPanel = panels.find((p) => p.id === 'selectedRows');
      expect(selectedPanel).toBeUndefined();
    });

    it('shows aggregation panels when provided', () => {
      const bar = new StatusBar();
      bar.enabled = true;

      const panels = bar.buildPanels({
        totalRows: 100,
        filteredRows: 100,
        selectedRows: 3,
        aggregation: { sum: 150, count: 3, avg: 50, min: 30, max: 70 },
      });

      expect(panels.find((p) => p.id === 'aggSum')).toBeDefined();
      expect(panels.find((p) => p.id === 'aggAvg')).toBeDefined();
      expect(panels.find((p) => p.id === 'aggCount')).toBeDefined();
      expect(panels.find((p) => p.id === 'aggMin')).toBeDefined();
      expect(panels.find((p) => p.id === 'aggMax')).toBeDefined();
    });

    it('hides aggregation when count is 0', () => {
      const bar = new StatusBar();
      bar.enabled = true;

      const panels = bar.buildPanels({
        totalRows: 100,
        filteredRows: 100,
        selectedRows: 0,
        aggregation: { sum: 0, count: 0, avg: 0, min: 0, max: 0 },
      });

      expect(panels.find((p) => p.id === 'aggSum')).toBeUndefined();
    });

    it('includes custom panels', () => {
      const bar = new StatusBar();
      bar.enabled = true;
      bar.configure({
        panels: [{ id: 'custom', label: 'Custom', value: 'hello', position: 'right' }],
      });

      const panels = bar.buildPanels({ totalRows: 10, filteredRows: 10, selectedRows: 0 });
      const custom = panels.find((p) => p.id === 'custom');
      expect(custom).toBeDefined();
      expect(custom!.value).toBe('hello');
    });

    it('hides total rows when configured off', () => {
      const bar = new StatusBar();
      bar.enabled = true;
      bar.configure({ showTotalRows: false });

      const panels = bar.buildPanels({ totalRows: 100, filteredRows: 100, selectedRows: 0 });
      expect(panels.find((p) => p.id === 'totalRows')).toBeUndefined();
    });
  });

  describe('render', () => {
    it('returns empty when disabled', () => {
      const bar = new StatusBar();
      expect(bar.render([])).toBe('');
    });

    it('returns empty when no panels', () => {
      const bar = new StatusBar();
      bar.enabled = true;
      expect(bar.render([])).toBe('');
    });

    it('renders status bar HTML', () => {
      const bar = new StatusBar();
      bar.enabled = true;

      const panels = bar.buildPanels({ totalRows: 50, filteredRows: 50, selectedRows: 0 });
      const html = bar.render(panels);

      expect(html).toContain('grid-status-bar');
      expect(html).toContain('Total Rows');
      expect(html).toContain('50');
    });

    it('formats decimal numbers', () => {
      const bar = new StatusBar();
      bar.enabled = true;

      const panels = bar.buildPanels({
        totalRows: 10,
        filteredRows: 10,
        selectedRows: 2,
        aggregation: { sum: 10.5, count: 2, avg: 5.25, min: 3.5, max: 7 },
      });

      const avgPanel = panels.find((p) => p.id === 'aggAvg');
      expect(avgPanel!.value).toBe('5.25');
    });
  });
});
