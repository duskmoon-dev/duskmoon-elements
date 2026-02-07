import { describe, it, expect } from 'bun:test';
import { Sparkline } from '../../src/core/sparkline.js';

describe('Sparkline', () => {
  const spark = new Sparkline();

  describe('line sparkline', () => {
    it('renders SVG with path', () => {
      const svg = spark.render({
        data: [10, 20, 15, 25],
        def: { type: 'line' },
      });

      expect(svg).toContain('<svg');
      expect(svg).toContain('grid-sparkline');
      expect(svg).toContain('<path');
      expect(svg).toContain('fill="none"');
    });

    it('uses custom stroke color', () => {
      const svg = spark.render({
        data: [1, 2, 3],
        def: { type: 'line', stroke: 'red' },
      });

      expect(svg).toContain('stroke="red"');
    });

    it('uses custom stroke width', () => {
      const svg = spark.render({
        data: [1, 2, 3],
        def: { type: 'line', strokeWidth: 3 },
      });

      expect(svg).toContain('stroke-width="3"');
    });
  });

  describe('bar sparkline', () => {
    it('renders SVG with rect elements', () => {
      const svg = spark.render({
        data: [10, 20, 30],
        def: { type: 'bar' },
      });

      expect(svg).toContain('<svg');
      expect(svg).toContain('<rect');
    });

    it('uses custom fill color', () => {
      const svg = spark.render({
        data: [1, 2, 3],
        def: { type: 'bar', fill: 'green' },
      });

      expect(svg).toContain('fill="green"');
    });
  });

  describe('area sparkline', () => {
    it('renders SVG with filled area and line', () => {
      const svg = spark.render({
        data: [5, 10, 15, 10],
        def: { type: 'area' },
      });

      expect(svg).toContain('<svg');
      // Area has two paths: one filled, one stroked
      const pathCount = (svg.match(/<path/g) || []).length;
      expect(pathCount).toBe(2);
    });

    it('uses fill-opacity for area', () => {
      const svg = spark.render({
        data: [1, 2, 3],
        def: { type: 'area' },
      });

      expect(svg).toContain('fill-opacity="0.2"');
    });
  });

  describe('custom dimensions', () => {
    it('uses specified width and height', () => {
      const svg = spark.render({
        data: [1, 2, 3],
        def: { type: 'line' },
        width: 200,
        height: 40,
      });

      expect(svg).toContain('width="200"');
      expect(svg).toContain('height="40"');
    });

    it('defaults to 100x24', () => {
      const svg = spark.render({
        data: [1, 2, 3],
        def: { type: 'line' },
      });

      expect(svg).toContain('width="100"');
      expect(svg).toContain('height="24"');
    });
  });

  describe('edge cases', () => {
    it('renders empty SVG for empty data', () => {
      const svg = spark.render({
        data: [],
        def: { type: 'line' },
      });

      expect(svg).toContain('<svg');
      expect(svg).not.toContain('<path');
    });

    it('handles single data point', () => {
      const svg = spark.render({
        data: [42],
        def: { type: 'line' },
      });

      expect(svg).toContain('<svg');
      expect(svg).toContain('M'); // At least one point
    });

    it('uses custom min/max bounds', () => {
      const svg = spark.render({
        data: [50],
        def: { type: 'bar', min: 0, max: 100 },
      });

      // With min=0, max=100, a value of 50 should produce half-height bar
      expect(svg).toContain('<rect');
    });

    it('handles custom padding', () => {
      const svg = spark.render({
        data: [1, 2, 3],
        def: { type: 'line', padding: { top: 5, right: 5, bottom: 5, left: 5 } },
      });

      expect(svg).toContain('<svg');
    });

    it('returns empty for unknown type', () => {
      const svg = spark.render({
        data: [1, 2],
        def: { type: 'unknown' as 'line' },
      });

      expect(svg).toBe('');
    });
  });
});
