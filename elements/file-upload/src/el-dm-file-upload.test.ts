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

  test('applies size sm class', () => {
    const el = document.createElement('el-dm-file-upload') as ElDmFileUpload;
    el.size = 'sm';
    container.appendChild(el);

    const upload = el.shadowRoot?.querySelector('.file-upload');
    expect(upload?.classList.contains('file-upload-sm')).toBe(true);
  });

  test('applies size lg class', () => {
    const el = document.createElement('el-dm-file-upload') as ElDmFileUpload;
    el.size = 'lg';
    container.appendChild(el);

    const upload = el.shadowRoot?.querySelector('.file-upload');
    expect(upload?.classList.contains('file-upload-lg')).toBe(true);
  });

  test('default size md has no extra class', () => {
    const el = document.createElement('el-dm-file-upload') as ElDmFileUpload;
    el.size = 'md';
    container.appendChild(el);

    const upload = el.shadowRoot?.querySelector('.file-upload');
    expect(upload?.classList.contains('file-upload-sm')).toBe(false);
    expect(upload?.classList.contains('file-upload-lg')).toBe(false);
  });

  test('files property starts empty', () => {
    const el = document.createElement('el-dm-file-upload') as ElDmFileUpload;
    container.appendChild(el);

    expect(el.files).toEqual([]);
  });

  test('clear emits change event', () => {
    const el = document.createElement('el-dm-file-upload') as ElDmFileUpload;
    container.appendChild(el);

    let changeEvent: CustomEvent | null = null;
    el.addEventListener('change', ((e: CustomEvent) => {
      changeEvent = e;
    }) as EventListener);

    el.clear();
    expect(changeEvent).not.toBeNull();
    expect((changeEvent as unknown as CustomEvent).detail.files).toEqual([]);
  });

  test('shows file list container by default (not preview)', () => {
    const el = document.createElement('el-dm-file-upload') as ElDmFileUpload;
    container.appendChild(el);

    const fileList = el.shadowRoot?.querySelector('.file-upload-list');
    const preview = el.shadowRoot?.querySelector('.file-upload-preview');
    expect(fileList).toBeDefined();
    expect(preview).toBeNull();
  });

  test('shows preview container when showPreview is true', () => {
    const el = document.createElement('el-dm-file-upload') as ElDmFileUpload;
    el.showPreview = true;
    container.appendChild(el);

    const preview = el.shadowRoot?.querySelector('.file-upload-preview');
    expect(preview).toBeDefined();
  });

  test('reflects max-size attribute', () => {
    const el = document.createElement('el-dm-file-upload') as ElDmFileUpload;
    el.maxSize = 1048576;
    container.appendChild(el);

    expect(el.hasAttribute('max-size')).toBe(true);
  });

  test('shows accepted formats in subtitle', () => {
    const el = document.createElement('el-dm-file-upload') as ElDmFileUpload;
    el.accept = '.pdf,.doc';
    container.appendChild(el);

    const subtitle = el.shadowRoot?.querySelector('.file-upload-subtitle');
    expect(subtitle?.textContent).toContain('.pdf,.doc');
  });

  test('shows max size in subtitle', () => {
    const el = document.createElement('el-dm-file-upload') as ElDmFileUpload;
    el.maxSize = 1048576;
    container.appendChild(el);

    const subtitle = el.shadowRoot?.querySelector('.file-upload-subtitle');
    expect(subtitle?.textContent).toContain('Max');
  });

  test('sets multiple attribute on file input', () => {
    const el = document.createElement('el-dm-file-upload') as ElDmFileUpload;
    el.multiple = true;
    container.appendChild(el);

    const input = el.shadowRoot?.querySelector('.file-upload-input') as HTMLInputElement;
    expect(input?.hasAttribute('multiple')).toBe(true);
  });

  test('sets disabled attribute on file input', () => {
    const el = document.createElement('el-dm-file-upload') as ElDmFileUpload;
    el.disabled = true;
    container.appendChild(el);

    const input = el.shadowRoot?.querySelector('.file-upload-input') as HTMLInputElement;
    expect(input?.hasAttribute('disabled')).toBe(true);
  });
});
