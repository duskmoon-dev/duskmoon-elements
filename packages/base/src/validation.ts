/**
 * Validation utilities for DuskMoon form elements
 *
 * Provides composable validator functions that can be used with
 * any form element supporting ValidationState and errorMessage props.
 *
 * @example
 * ```ts
 * import { validate, validators } from '@duskmoon-dev/el-base';
 *
 * const result = validate('hello@example.com', [
 *   validators.required('Email is required'),
 *   validators.email('Must be a valid email'),
 * ]);
 *
 * // result = { state: 'valid', message: undefined }
 *
 * inputEl.validationState = result.state;
 * inputEl.errorMessage = result.message ?? '';
 * ```
 */

import type { ValidationState } from './types.js';

/**
 * Result of a validation check
 */
export interface ValidationResult {
  state: NonNullable<ValidationState>;
  message: string | undefined;
}

/**
 * A validator function takes a value and returns an error message
 * if invalid, or undefined/null if valid.
 */
export type Validator<T = string> = (value: T) => string | undefined | null;

/**
 * Run a value through a list of validators, returning on the first failure.
 * Returns { state: 'valid' } if all pass, { state: 'invalid', message } on first failure.
 */
export function validate<T = string>(value: T, rules: Validator<T>[]): ValidationResult {
  for (const rule of rules) {
    const message = rule(value);
    if (message) {
      return { state: 'invalid', message };
    }
  }
  return { state: 'valid', message: undefined };
}

/**
 * Run a value through an async validator.
 * Sets state to 'pending' during execution.
 */
export async function validateAsync<T = string>(
  value: T,
  rules: Validator<T>[],
  asyncRule: (value: T) => Promise<string | undefined | null>,
): Promise<ValidationResult> {
  // Run sync rules first
  const syncResult = validate(value, rules);
  if (syncResult.state === 'invalid') {
    return syncResult;
  }

  // Run async rule
  const message = await asyncRule(value);
  if (message) {
    return { state: 'invalid', message };
  }
  return { state: 'valid', message: undefined };
}

/**
 * Built-in validators for common patterns
 */
export const validators = {
  /** Requires a non-empty value */
  required(message = 'This field is required'): Validator<string> {
    return (value) => (!value || value.trim().length === 0 ? message : undefined);
  },

  /** Requires a minimum string length */
  minLength(min: number, message?: string): Validator<string> {
    return (value) =>
      value && value.length < min ? (message ?? `Must be at least ${min} characters`) : undefined;
  },

  /** Requires a maximum string length */
  maxLength(max: number, message?: string): Validator<string> {
    return (value) =>
      value && value.length > max ? (message ?? `Must be at most ${max} characters`) : undefined;
  },

  /** Requires a value matching a regex pattern */
  pattern(regex: RegExp, message = 'Invalid format'): Validator<string> {
    return (value) => (value && !regex.test(value) ? message : undefined);
  },

  /** Requires a valid email address */
  email(message = 'Must be a valid email address'): Validator<string> {
    // Simple but practical email regex
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (value) => (value && !emailRe.test(value) ? message : undefined);
  },

  /** Requires a numeric value within a range */
  range(min: number, max: number, message?: string): Validator<string> {
    return (value) => {
      if (!value) return undefined;
      const num = Number(value);
      if (isNaN(num) || num < min || num > max) {
        return message ?? `Must be between ${min} and ${max}`;
      }
      return undefined;
    };
  },

  /** Custom validator from a predicate function */
  custom<T = string>(predicate: (value: T) => boolean, message: string): Validator<T> {
    return (value) => (!predicate(value) ? message : undefined);
  },
} as const;
