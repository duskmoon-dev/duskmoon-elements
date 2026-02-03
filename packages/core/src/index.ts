/**
 * @duskmoon-dev/el-core
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
export {
  animationStyles,
  animation,
  transition,
  durations,
  easings,
} from './animations.js';
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
