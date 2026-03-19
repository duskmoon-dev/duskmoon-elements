import { describe, test, expect } from 'bun:test';
import { isAcceptedType, fileToMarkdown } from './upload.js';

function makeFile(name: string, type: string): File {
  return new File([''], name, { type });
}

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
    expect(fileToMarkdown(file, '/uploads/notes.txt')).toBe(
      '[notes.txt](/uploads/notes.txt)',
    );
  });
});
