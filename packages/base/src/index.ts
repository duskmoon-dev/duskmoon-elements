/**
 * @duskmoon-dev/el-base
 *
 * Core utilities and base classes for DuskMoon custom elements
 */

// Base element class
export { BaseElement } from './base-element.js';
export type { PropertyDefinition, PropertyDefinitions } from './base-element.js';

// Style utilities
export {
  css,
  combineStyles,
  cssVars,
  defaultTheme,
  resetStyles,
  lightThemeColors,
} from './styles.js';

// Animation utilities
export { animationStyles, animation, transition, durations, easings } from './animations.js';
export type { AnimationDuration, AnimationEasing } from './animations.js';

// Theme presets
export {
  sunshineTheme,
  moonlightTheme,
  oceanTheme,
  forestTheme,
  roseTheme,
  themes,
  applyTheme,
} from './themes.js';
export type { ThemeName } from './themes.js';

// Composition mixins
export { FocusableMixin, FormMixin, EventListenerMixin, SlotObserverMixin } from './mixins.js';

// Validation utilities
export { validate, validateAsync, validators } from './validation.js';
export type { ValidationResult, Validator } from './validation.js';

// Performance utilities
export { debounce, throttle, scheduleIdle } from './performance.js';

// Types
export type {
  CSSValue,
  Size,
  Variant,
  ValidationState,
  BaseElementProps,
  SizableProps,
  VariantProps,
  FormElementProps,
  ValidatableProps,
  ValueChangeEventDetail,
  AttributeConverter,
} from './types.js';
