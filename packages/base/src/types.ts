/**
 * Common types and interfaces for DuskMoon Elements
 */

/**
 * Represents a CSS property value with support for CSS custom properties
 */
export type CSSValue = string | number;

/**
 * Size variants available for elements
 */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Color variants available for elements
 */
export type Variant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'outline';

/**
 * Validation state for form elements
 */
export type ValidationState = 'valid' | 'invalid' | 'pending' | undefined;

/**
 * Base props shared by all elements
 */
export interface BaseElementProps {
  /** Whether the element is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  class?: string;
}

/**
 * Props for elements with size variants
 */
export interface SizableProps {
  /** Size variant */
  size?: Size;
}

/**
 * Props for elements with color variants
 */
export interface VariantProps {
  /** Color variant */
  variant?: Variant;
}

/**
 * Props for form elements
 */
export interface FormElementProps extends BaseElementProps {
  /** Name attribute for form submission */
  name?: string;
  /** Current value */
  value?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is readonly */
  readonly?: boolean;
}

/**
 * Props for validatable form elements
 */
export interface ValidatableProps {
  /** Current validation state */
  validationState?: ValidationState;
  /** Error message to display */
  errorMessage?: string;
}

/**
 * Event detail for value change events
 */
export interface ValueChangeEventDetail<T = string> {
  /** The new value */
  value: T;
  /** The previous value */
  previousValue?: T;
}

/**
 * Type for attribute converters
 */
export interface AttributeConverter<T> {
  /** Convert from attribute string to property value */
  fromAttribute: (value: string | null) => T;
  /** Convert from property value to attribute string */
  toAttribute: (value: T) => string | null;
}
