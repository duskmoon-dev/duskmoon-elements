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
