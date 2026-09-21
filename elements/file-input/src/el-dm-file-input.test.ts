import { afterEach, describe, expect, test } from 'bun:test';
import { ElDmFileInput, register } from './index';
register();
afterEach(() => document.body.replaceChildren());
describe('ElDmFileInput', () => {
  test('maps picker constraints to the native file input', () => {
    const el = document.createElement('el-dm-file-input') as ElDmFileInput;
    el.accept = 'image/*';
    el.multiple = true;
    el.required = true;
    el.size = 'lg';
    document.body.append(el);
    expect(el.input?.type).toBe('file');
    expect(el.input?.accept).toBe('image/*');
    expect(el.input?.multiple).toBe(true);
    expect(el.input?.required).toBe(true);
    expect(el.input?.classList.contains('file-input-lg')).toBe(true);
  });
  test('escapes string attributes', () => {
    const el = document.createElement('el-dm-file-input') as ElDmFileInput;
    el.name = 'file" autofocus data-injected="yes';
    el.accept = 'image/*" data-accept-injected="yes';
    document.body.append(el);
    expect(el.input?.name).toBe(el.name);
    expect(el.input?.accept).toBe(el.accept);
    expect(el.input?.hasAttribute('data-injected')).toBe(false);
    expect(el.input?.hasAttribute('data-accept-injected')).toBe(false);
  });
});
