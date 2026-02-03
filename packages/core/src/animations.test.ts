import { expect, test, describe } from 'bun:test';
import {
  animation,
  transition,
  durations,
  easings,
  animationStyles,
} from './animations';

describe('Animation utilities', () => {
  describe('durations', () => {
    test('has expected duration values', () => {
      expect(durations.fast).toBe('150ms');
      expect(durations.normal).toBe('200ms');
      expect(durations.slow).toBe('300ms');
      expect(durations.slower).toBe('500ms');
    });
  });

  describe('easings', () => {
    test('has expected easing values', () => {
      expect(easings.ease).toBe('ease');
      expect(easings.easeIn).toContain('cubic-bezier');
      expect(easings.easeOut).toContain('cubic-bezier');
      expect(easings.easeInOut).toContain('cubic-bezier');
      expect(easings.spring).toContain('cubic-bezier');
    });
  });

  describe('animation()', () => {
    test('generates animation shorthand with defaults', () => {
      const result = animation('dm-fade-in');
      expect(result).toContain('dm-fade-in');
      expect(result).toContain('200ms');
      expect(result).toContain('both');
    });

    test('accepts custom duration', () => {
      const result = animation('dm-fade-in', 'fast');
      expect(result).toContain('150ms');
    });

    test('accepts custom easing', () => {
      const result = animation('dm-fade-in', 'normal', 'spring');
      expect(result).toContain('cubic-bezier(0.175');
    });

    test('accepts custom fill mode', () => {
      const result = animation('dm-fade-in', 'normal', 'easeOut', 'forwards');
      expect(result).toContain('forwards');
    });
  });

  describe('transition()', () => {
    test('generates transition for single property', () => {
      const result = transition(['opacity']);
      expect(result).toBe('opacity 200ms ease');
    });

    test('generates transition for multiple properties', () => {
      const result = transition(['opacity', 'transform']);
      expect(result).toContain('opacity 200ms ease');
      expect(result).toContain('transform 200ms ease');
      expect(result.split(',').length).toBe(2);
    });

    test('accepts custom duration', () => {
      const result = transition(['opacity'], 'fast');
      expect(result).toContain('150ms');
    });

    test('accepts custom easing', () => {
      const result = transition(['opacity'], 'normal', 'easeInOut');
      expect(result).toContain('cubic-bezier(0.4, 0, 0.2, 1)');
    });
  });

  describe('animationStyles', () => {
    test('is a CSSStyleSheet instance', () => {
      expect(animationStyles).toBeInstanceOf(CSSStyleSheet);
    });
  });
});
