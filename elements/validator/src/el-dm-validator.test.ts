import { afterEach, describe, expect, test } from 'bun:test';
import { ElDmValidator, register } from './index';
register();
afterEach(() => document.body.replaceChildren());
describe('ElDmValidator', () => {
  test('preserves control semantics and maps explicit application error state', () => {
    const el = document.createElement('el-dm-validator') as ElDmValidator;
    el.state = 'error';
    const input = document.createElement('input');
    input.required = true;
    input.setAttribute('aria-invalid', 'true');
    el.append(input);
    document.body.append(el);
    expect(el.querySelector('input')).toBe(input);
    expect(input.required).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(el.shadowRoot.querySelector('.form-group')?.classList.contains('form-group-error')).toBe(
      true,
    );
  });
});
