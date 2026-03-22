import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { isAcceptedType, fileToMarkdown, uploadFile } from './upload.js';

function makeFile(name: string, type: string): File {
  return new File([''], name, { type });
}

// ── Minimal XHR mock for uploadFile tests ─────────────────────────────
type XHRHandler = (e?: { lengthComputable: boolean; loaded: number; total: number }) => void;

class MockXHR {
  status = 200;
  responseText = '';
  upload = { addEventListener: mock((_: string, __: XHRHandler) => {}) };
  open = mock((_method: string, _url: string) => {});
  send = mock((_body: FormData) => {});

  #listeners: Record<string, XHRHandler> = {};

  addEventListener(event: string, handler: XHRHandler) {
    this.#listeners[event] = handler;
  }

  // Test helpers to trigger XHR events
  _fireLoad() {
    this.#listeners['load']?.();
  }
  _fireError() {
    this.#listeners['error']?.();
  }
  _fireAbort() {
    this.#listeners['abort']?.();
  }
  _fireProgress(loaded: number, total: number) {
    const handler = this.upload.addEventListener.mock.calls.find(
      (c: [string, XHRHandler]) => c[0] === 'progress',
    )?.[1] as XHRHandler | undefined;
    handler?.({ lengthComputable: true, loaded, total });
  }
  _fireProgressNonComputable() {
    const handler = this.upload.addEventListener.mock.calls.find(
      (c: [string, XHRHandler]) => c[0] === 'progress',
    )?.[1] as XHRHandler | undefined;
    handler?.({ lengthComputable: false, loaded: 0, total: 0 });
  }
}

let mockXhr: MockXHR;

describe('isAcceptedType', () => {
  test('accepts image/png', () => {
    expect(isAcceptedType(makeFile('photo.png', 'image/png'))).toBe(true);
  });

  test('accepts image/jpeg', () => {
    expect(isAcceptedType(makeFile('photo.jpg', 'image/jpeg'))).toBe(true);
  });

  test('accepts image/gif', () => {
    expect(isAcceptedType(makeFile('anim.gif', 'image/gif'))).toBe(true);
  });

  test('accepts image/webp', () => {
    expect(isAcceptedType(makeFile('img.webp', 'image/webp'))).toBe(true);
  });

  test('accepts application/pdf by MIME', () => {
    expect(isAcceptedType(makeFile('doc.pdf', 'application/pdf'))).toBe(true);
  });

  test('accepts .zip by extension', () => {
    expect(isAcceptedType(makeFile('archive.zip', 'application/octet-stream'))).toBe(true);
  });

  test('accepts .txt by extension', () => {
    expect(isAcceptedType(makeFile('readme.txt', 'text/plain'))).toBe(true);
  });

  test('accepts .csv by extension', () => {
    expect(isAcceptedType(makeFile('data.csv', 'text/csv'))).toBe(true);
  });

  test('accepts .json by extension', () => {
    expect(isAcceptedType(makeFile('config.json', 'application/json'))).toBe(true);
  });

  test('accepts .md by extension', () => {
    expect(isAcceptedType(makeFile('notes.md', ''))).toBe(true);
  });

  test('rejects .exe', () => {
    expect(isAcceptedType(makeFile('virus.exe', 'application/x-msdownload'))).toBe(false);
  });

  test('rejects application/javascript', () => {
    expect(isAcceptedType(makeFile('script.js', 'application/javascript'))).toBe(false);
  });

  test('rejects unknown type with no matching extension', () => {
    expect(isAcceptedType(makeFile('file.xyz', 'application/octet-stream'))).toBe(false);
  });

  test('is case-insensitive for extension', () => {
    expect(isAcceptedType(makeFile('NOTES.MD', ''))).toBe(true);
  });

  test('is case-insensitive for MIME type', () => {
    expect(isAcceptedType(makeFile('photo.png', 'IMAGE/PNG'))).toBe(true);
  });
});

describe('fileToMarkdown', () => {
  test('generates image markdown for image/png', () => {
    const file = makeFile('screenshot.png', 'image/png');
    expect(fileToMarkdown(file, 'https://example.com/img.png')).toBe(
      '![screenshot.png](https://example.com/img.png)',
    );
  });

  test('generates image markdown for image/jpeg', () => {
    const file = makeFile('photo.jpg', 'image/jpeg');
    expect(fileToMarkdown(file, 'https://cdn.example.com/photo.jpg')).toBe(
      '![photo.jpg](https://cdn.example.com/photo.jpg)',
    );
  });

  test('generates link markdown for pdf', () => {
    const file = makeFile('report.pdf', 'application/pdf');
    expect(fileToMarkdown(file, 'https://example.com/report.pdf')).toBe(
      '[report.pdf](https://example.com/report.pdf)',
    );
  });

  test('generates link markdown for zip', () => {
    const file = makeFile('archive.zip', 'application/zip');
    expect(fileToMarkdown(file, 'https://example.com/archive.zip')).toBe(
      '[archive.zip](https://example.com/archive.zip)',
    );
  });

  test('generates link markdown for txt', () => {
    const file = makeFile('notes.txt', 'text/plain');
    expect(fileToMarkdown(file, '/uploads/notes.txt')).toBe('[notes.txt](/uploads/notes.txt)');
  });

  test('generates image markdown for svg', () => {
    const file = makeFile('logo.svg', 'image/svg+xml');
    expect(fileToMarkdown(file, '/uploads/logo.svg')).toBe('![logo.svg](/uploads/logo.svg)');
  });

  test('escapes brackets in filename to prevent markdown injection', () => {
    const file = makeFile('file[1].png', 'image/png');
    expect(fileToMarkdown(file, '/u/file.png')).toBe('![file\\[1\\].png](/u/file.png)');
  });

  test('percent-encodes parentheses in URL to prevent markdown injection', () => {
    const file = makeFile('doc.pdf', 'application/pdf');
    expect(fileToMarkdown(file, '/u/doc%20(1).pdf')).toBe('[doc.pdf](/u/doc%20%281%29.pdf)');
  });

  test('escapes both brackets in filename and parens in URL', () => {
    const file = makeFile('report[final].png', 'image/png');
    expect(fileToMarkdown(file, '/u/report(2).png')).toBe(
      '![report\\[final\\].png](/u/report%282%29.png)',
    );
  });

  test('handles filename with ] that could close markdown link text', () => {
    const file = makeFile('evil](http://evil.com)[x', 'application/pdf');
    expect(fileToMarkdown(file, '/safe.pdf')).toBe('[evil\\](http://evil.com)\\[x](/safe.pdf)');
  });

  test('replaces javascript: URL with #unsafe-url', () => {
    const file = makeFile('script.js', 'text/javascript');
    expect(fileToMarkdown(file, 'javascript:alert(1)')).toBe('[script.js](#unsafe-url)');
  });

  test('replaces data: URL with #unsafe-url', () => {
    const file = makeFile('img.png', 'image/png');
    expect(fileToMarkdown(file, 'data:image/png;base64,abc')).toBe('![img.png](#unsafe-url)');
  });

  test('replaces file: URL with #unsafe-url', () => {
    const file = makeFile('doc.txt', 'text/plain');
    expect(fileToMarkdown(file, 'file:///etc/passwd')).toBe('[doc.txt](#unsafe-url)');
  });

  test('replaces http: URL with #unsafe-url (only https allowed)', () => {
    const file = makeFile('img.png', 'image/png');
    expect(fileToMarkdown(file, 'http://cdn.example.com/img.png')).toBe('![img.png](#unsafe-url)');
  });

  test('accepts relative path starting with /', () => {
    const file = makeFile('img.png', 'image/png');
    expect(fileToMarkdown(file, '/uploads/img.png')).toBe('![img.png](/uploads/img.png)');
  });

  test('accepts relative path starting with ./', () => {
    const file = makeFile('doc.pdf', 'application/pdf');
    expect(fileToMarkdown(file, './files/doc.pdf')).toBe('[doc.pdf](./files/doc.pdf)');
  });

  test('accepts relative path starting with ../', () => {
    const file = makeFile('doc.pdf', 'application/pdf');
    expect(fileToMarkdown(file, '../files/doc.pdf')).toBe('[doc.pdf](../files/doc.pdf)');
  });
});

// ════════════════════════════════════════════════════════════════════════
// uploadFile — XHR mock tests
// ════════════════════════════════════════════════════════════════════════

describe('uploadFile', () => {
  beforeEach(() => {
    mockXhr = new MockXHR();
    (globalThis as Record<string, unknown>).XMLHttpRequest = class {
      constructor() {
        return mockXhr as unknown as XMLHttpRequest;
      }
    };
  });

  // Restore real XHR after all upload tests
  // (bun:test doesn't have afterAll for describe, but we restore per-test via beforeEach)

  test('resolves with URL on successful 200 JSON response', async () => {
    const file = makeFile('photo.png', 'image/png');
    const progressCalls: number[] = [];
    const promise = uploadFile(file, '/api/upload', (pct) => progressCalls.push(pct));

    // Verify XHR was opened and sent
    expect(mockXhr.open).toHaveBeenCalledWith('POST', '/api/upload');
    expect(mockXhr.send).toHaveBeenCalled();

    // Simulate successful response
    mockXhr.status = 200;
    mockXhr.responseText = JSON.stringify({ url: 'https://cdn.example.com/photo.png' });
    mockXhr._fireLoad();

    const result = await promise;
    expect(result).toBe('https://cdn.example.com/photo.png');
  });

  test('resolves on 201 status', async () => {
    const file = makeFile('doc.pdf', 'application/pdf');
    const promise = uploadFile(file, '/upload', () => {});

    mockXhr.status = 201;
    mockXhr.responseText = JSON.stringify({ url: '/files/doc.pdf' });
    mockXhr._fireLoad();

    expect(await promise).toBe('/files/doc.pdf');
  });

  test('rejects when response JSON is missing url field', async () => {
    const file = makeFile('file.txt', 'text/plain');
    const promise = uploadFile(file, '/upload', () => {});

    mockXhr.status = 200;
    mockXhr.responseText = JSON.stringify({ path: '/files/file.txt' });
    mockXhr._fireLoad();

    await expect(promise).rejects.toThrow('Upload response missing url field');
  });

  test('rejects when response is not valid JSON', async () => {
    const file = makeFile('file.txt', 'text/plain');
    const promise = uploadFile(file, '/upload', () => {});

    mockXhr.status = 200;
    mockXhr.responseText = '<html>OK</html>';
    mockXhr._fireLoad();

    await expect(promise).rejects.toThrow('Upload response is not valid JSON');
  });

  test('rejects on non-2xx status', async () => {
    const file = makeFile('file.txt', 'text/plain');
    const promise = uploadFile(file, '/upload', () => {});

    mockXhr.status = 413;
    mockXhr._fireLoad();

    await expect(promise).rejects.toThrow('Upload failed with status 413');
  });

  test('rejects on 500 server error', async () => {
    const file = makeFile('file.txt', 'text/plain');
    const promise = uploadFile(file, '/upload', () => {});

    mockXhr.status = 500;
    mockXhr._fireLoad();

    await expect(promise).rejects.toThrow('Upload failed with status 500');
  });

  test('rejects on network error', async () => {
    const file = makeFile('file.txt', 'text/plain');
    const promise = uploadFile(file, '/upload', () => {});

    mockXhr._fireError();

    await expect(promise).rejects.toThrow('Network error during upload');
  });

  test('rejects on abort', async () => {
    const file = makeFile('file.txt', 'text/plain');
    const promise = uploadFile(file, '/upload', () => {});

    mockXhr._fireAbort();

    await expect(promise).rejects.toThrow('Upload aborted');
  });

  test('reports progress via callback', async () => {
    const file = makeFile('big.zip', 'application/zip');
    const progress: number[] = [];
    const promise = uploadFile(file, '/upload', (pct) => progress.push(pct));

    mockXhr._fireProgress(50, 100);
    mockXhr._fireProgress(100, 100);

    mockXhr.status = 200;
    mockXhr.responseText = JSON.stringify({ url: '/files/big.zip' });
    mockXhr._fireLoad();

    await promise;
    expect(progress).toEqual([50, 100]);
  });

  test('does not call progress when lengthComputable is false', async () => {
    const file = makeFile('file.txt', 'text/plain');
    const progress: number[] = [];
    const promise = uploadFile(file, '/upload', (pct) => progress.push(pct));

    mockXhr._fireProgressNonComputable();

    mockXhr.status = 200;
    mockXhr.responseText = JSON.stringify({ url: '/f.txt' });
    mockXhr._fireLoad();

    await promise;
    expect(progress).toEqual([]);
  });
});
