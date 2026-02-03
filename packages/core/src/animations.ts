/**
 * Animation utilities for DuskMoon custom elements
 *
 * Provides reusable CSS keyframe animations and transition presets
 * that respect prefers-reduced-motion.
 */

import { css } from './styles.js';

/**
 * Duration presets matching the design token system
 */
export const durations = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
} as const;

export type AnimationDuration = keyof typeof durations;

/**
 * Easing presets for consistent motion curves
 */
export const easings = {
  ease: 'ease',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

export type AnimationEasing = keyof typeof easings;

/**
 * Core animation keyframes stylesheet.
 * Attach this to elements that need entrance/exit animations.
 */
export const animationStyles = css`
  @keyframes dm-fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes dm-fade-out {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes dm-scale-in {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes dm-scale-out {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.95);
    }
  }

  @keyframes dm-slide-in-up {
    from {
      opacity: 0;
      transform: translateY(0.5rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes dm-slide-in-down {
    from {
      opacity: 0;
      transform: translateY(-0.5rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes dm-slide-in-left {
    from {
      opacity: 0;
      transform: translateX(0.5rem);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes dm-slide-in-right {
    from {
      opacity: 0;
      transform: translateX(-0.5rem);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes dm-shake {
    0%,
    100% {
      transform: translateX(0);
    }
    10%,
    30%,
    50%,
    70%,
    90% {
      transform: translateX(-0.25rem);
    }
    20%,
    40%,
    60%,
    80% {
      transform: translateX(0.25rem);
    }
  }

  @keyframes dm-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes dm-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* Reduced motion: disable all animations */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

/**
 * Generate a CSS animation shorthand value
 *
 * @example
 * ```ts
 * const fadeIn = animation('dm-fade-in', 'normal', 'easeOut');
 * // Returns: "dm-fade-in 200ms cubic-bezier(0, 0, 0.2, 1) both"
 * ```
 */
export function animation(
  name: string,
  duration: AnimationDuration = 'normal',
  easing: AnimationEasing = 'easeOut',
  fillMode: 'none' | 'forwards' | 'backwards' | 'both' = 'both',
): string {
  return `${name} ${durations[duration]} ${easings[easing]} ${fillMode}`;
}

/**
 * Generate a CSS transition shorthand for common properties
 *
 * @example
 * ```ts
 * const hoverTransition = transition(['opacity', 'transform'], 'fast');
 * // Returns: "opacity 150ms ease, transform 150ms ease"
 * ```
 */
export function transition(
  properties: string[],
  duration: AnimationDuration = 'normal',
  easing: AnimationEasing = 'ease',
): string {
  return properties.map((prop) => `${prop} ${durations[duration]} ${easings[easing]}`).join(', ');
}
