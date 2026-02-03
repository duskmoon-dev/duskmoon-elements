import { expect, test, describe } from 'bun:test';
import { validate, validateAsync, validators } from './validation';
import type { ValidationResult, Validator } from './validation';

describe('Validation utilities', () => {
  describe('validate()', () => {
    test('returns valid when no rules', () => {
      const result = validate('anything', []);
      expect(result).toEqual({ state: 'valid', message: undefined });
    });

    test('returns valid when all rules pass', () => {
      const result = validate('hello', [validators.required(), validators.minLength(3)]);
      expect(result).toEqual({ state: 'valid', message: undefined });
    });

    test('returns invalid on first failure', () => {
      const result = validate('', [validators.required('Required'), validators.minLength(3, 'Too short')]);
      expect(result).toEqual({ state: 'invalid', message: 'Required' });
    });

    test('stops at first failing rule', () => {
      let secondCalled = false;
      const secondRule: Validator = () => {
        secondCalled = true;
        return 'second error';
      };
      validate('', [validators.required('first'), secondRule]);
      expect(secondCalled).toBe(false);
    });
  });

  describe('validateAsync()', () => {
    test('returns sync failure before async check', async () => {
      let asyncCalled = false;
      const result = await validateAsync('', [validators.required('Required')], async () => {
        asyncCalled = true;
        return 'async error';
      });
      expect(result).toEqual({ state: 'invalid', message: 'Required' });
      expect(asyncCalled).toBe(false);
    });

    test('runs async rule when sync rules pass', async () => {
      const result = await validateAsync('test', [], async (value) => {
        return value === 'taken' ? 'Already taken' : undefined;
      });
      expect(result).toEqual({ state: 'valid', message: undefined });
    });

    test('returns async failure', async () => {
      const result = await validateAsync('taken', [], async (value) => {
        return value === 'taken' ? 'Already taken' : undefined;
      });
      expect(result).toEqual({ state: 'invalid', message: 'Already taken' });
    });
  });

  describe('validators.required()', () => {
    const rule = validators.required();

    test('fails on empty string', () => {
      expect(rule('')).toBe('This field is required');
    });

    test('fails on whitespace-only', () => {
      expect(rule('   ')).toBe('This field is required');
    });

    test('passes on non-empty string', () => {
      expect(rule('hello')).toBeUndefined();
    });

    test('accepts custom message', () => {
      const custom = validators.required('Please fill this in');
      expect(custom('')).toBe('Please fill this in');
    });
  });

  describe('validators.minLength()', () => {
    const rule = validators.minLength(3);

    test('fails when too short', () => {
      expect(rule('ab')).toBe('Must be at least 3 characters');
    });

    test('passes at exact length', () => {
      expect(rule('abc')).toBeUndefined();
    });

    test('passes when longer', () => {
      expect(rule('abcd')).toBeUndefined();
    });

    test('passes on empty (use required for that)', () => {
      expect(rule('')).toBeUndefined();
    });

    test('accepts custom message', () => {
      const custom = validators.minLength(5, 'Too short!');
      expect(custom('ab')).toBe('Too short!');
    });
  });

  describe('validators.maxLength()', () => {
    const rule = validators.maxLength(5);

    test('fails when too long', () => {
      expect(rule('abcdef')).toBe('Must be at most 5 characters');
    });

    test('passes at exact length', () => {
      expect(rule('abcde')).toBeUndefined();
    });

    test('passes when shorter', () => {
      expect(rule('abc')).toBeUndefined();
    });

    test('accepts custom message', () => {
      const custom = validators.maxLength(3, 'Too long!');
      expect(custom('abcd')).toBe('Too long!');
    });
  });

  describe('validators.pattern()', () => {
    const rule = validators.pattern(/^\d+$/);

    test('fails on non-matching', () => {
      expect(rule('abc')).toBe('Invalid format');
    });

    test('passes on matching', () => {
      expect(rule('123')).toBeUndefined();
    });

    test('passes on empty (use required for that)', () => {
      expect(rule('')).toBeUndefined();
    });

    test('accepts custom message', () => {
      const custom = validators.pattern(/^\d+$/, 'Numbers only');
      expect(custom('abc')).toBe('Numbers only');
    });
  });

  describe('validators.email()', () => {
    const rule = validators.email();

    test('fails on invalid email', () => {
      expect(rule('not-an-email')).toBe('Must be a valid email address');
      expect(rule('missing@domain')).toBe('Must be a valid email address');
      expect(rule('@no-local.com')).toBe('Must be a valid email address');
    });

    test('passes on valid email', () => {
      expect(rule('user@example.com')).toBeUndefined();
      expect(rule('test.user@sub.domain.co')).toBeUndefined();
    });

    test('passes on empty (use required for that)', () => {
      expect(rule('')).toBeUndefined();
    });

    test('accepts custom message', () => {
      const custom = validators.email('Bad email');
      expect(custom('bad')).toBe('Bad email');
    });
  });

  describe('validators.range()', () => {
    const rule = validators.range(1, 10);

    test('fails below range', () => {
      expect(rule('0')).toBe('Must be between 1 and 10');
    });

    test('fails above range', () => {
      expect(rule('11')).toBe('Must be between 1 and 10');
    });

    test('fails on non-numeric', () => {
      expect(rule('abc')).toBe('Must be between 1 and 10');
    });

    test('passes within range', () => {
      expect(rule('5')).toBeUndefined();
    });

    test('passes at boundaries', () => {
      expect(rule('1')).toBeUndefined();
      expect(rule('10')).toBeUndefined();
    });

    test('passes on empty (use required for that)', () => {
      expect(rule('')).toBeUndefined();
    });

    test('accepts custom message', () => {
      const custom = validators.range(0, 100, 'Out of range');
      expect(custom('200')).toBe('Out of range');
    });
  });

  describe('validators.custom()', () => {
    test('fails when predicate returns false', () => {
      const rule = validators.custom((v: string) => v.startsWith('A'), 'Must start with A');
      expect(rule('Banana')).toBe('Must start with A');
    });

    test('passes when predicate returns true', () => {
      const rule = validators.custom((v: string) => v.startsWith('A'), 'Must start with A');
      expect(rule('Apple')).toBeUndefined();
    });

    test('works with non-string types', () => {
      const rule = validators.custom<number>((v) => v > 0, 'Must be positive');
      expect(rule(-1)).toBe('Must be positive');
      expect(rule(5)).toBeUndefined();
    });
  });

  describe('type compatibility', () => {
    test('ValidationResult has correct shape', () => {
      const valid: ValidationResult = { state: 'valid', message: undefined };
      const invalid: ValidationResult = { state: 'invalid', message: 'error' };
      const pending: ValidationResult = { state: 'pending', message: undefined };
      expect(valid.state).toBe('valid');
      expect(invalid.state).toBe('invalid');
      expect(pending.state).toBe('pending');
    });
  });
});
