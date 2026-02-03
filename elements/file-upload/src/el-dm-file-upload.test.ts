import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmFileUpload, register } from './index';

register();

describe('ElDmFileUpload', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-file-upload')).toBe(ElDmFileUpload);
  });

  test('creates a shadow root with file upload', () => {
    const el = document.createElement('el-dm-file-upload') as ElDmFileUpload;
    container.appendChild(el);

    const upload = el.shadowRoot?.querySelector('.file-upload');
    expect(upload).toBeDefined();
  });

  test('has dropzone', () => {
    const el = document.createElement('el-dm-file-upload') as ElDmFileUpload;
    container.appendChild(el);

    const dropzone = el.shadowRoot?.querySelector('.file-upload-dropzone');
    expect(dropzone).toBeDefined();
  });

  test('has hidden file input', () => {
    const el = document.createElement('el-dm-file-upload') as ElDmFileUpload;
    container.appendChild(el);

    const input = el.shadowRoot?.querySelector('.file-upload-input');
    expect(input).toBeDefined();
  });

  test('reflects disabled attribute', () => {
    const el = document.createElement('el-dm-file-upload') as ElDmFileUpload;
    el.disabled = true;
    container.appendChild(el);

    expect(el.hasAttribute('disabled')).toBe(true);
  });

  test('reflects multiple attribute', () => {
    const el = document.createElement('el-dm-file-upload') as ElDmFileUpload;
    el.multiple = true;
    container.appendChild(el);

    expect(el.hasAttribute('multiple')).toBe(true);
  });

  test('applies accept to file input', () => {
    const el = document.createElement('el-dm-file-upload') as ElDmFileUpload;
    el.accept = 'image/*';
    container.appendChild(el);

    const input = el.shadowRoot?.querySelector('.file-upload-input') as HTMLInputElement;
    expect(input?.getAttribute('accept')).toBe('image/*');
  });

  test('applies compact class', () => {
    const el = document.createElement('el-dm-file-upload') as ElDmFileUpload;
    el.compact = true;
    container.appendChild(el);

    const upload = el.shadowRoot?.querySelector('.file-upload');
    expect(upload?.classList.contains('file-upload-compact')).toBe(true);
  });

  test('has public clear method', () => {
    const el = document.createElement('el-dm-file-upload') as ElDmFileUpload;
    container.appendChild(el);

    expect(typeof el.clear).toBe('function');
  });
});
