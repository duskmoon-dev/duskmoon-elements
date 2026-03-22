/**
 * File upload utilities for el-dm-markdown-input.
 *
 * Handles XHR-based multipart/form-data uploads, markdown snippet generation,
 * and accepted file type validation.
 */

/** Accepted MIME types and extensions (aligned with PRD). */
const ACCEPTED_MIME_PREFIXES = ['image/'];
const ACCEPTED_MIME_EXACT = ['application/pdf'];
const ACCEPTED_EXTENSIONS = ['.zip', '.txt', '.csv', '.json', '.md'];

/**
 * Returns true if the file's MIME type or name extension is accepted.
 */
export function isAcceptedType(file: File): boolean {
  const type = file.type.toLowerCase();
  if (ACCEPTED_MIME_PREFIXES.some((p) => type.startsWith(p))) return true;
  if (ACCEPTED_MIME_EXACT.includes(type)) return true;
  const name = file.name.toLowerCase();
  if (ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))) return true;
  return false;
}

/**
 * Generate the markdown insertion string for an uploaded file.
 * Images use `![name](url)`, all other files use `[name](url)`.
 *
 * Filenames and URLs are escaped to prevent markdown syntax injection:
 * - `[` and `]` in filenames are backslash-escaped
 * - `(` and `)` in URLs are percent-encoded
 *
 * Only `https:` and relative URLs are accepted. Dangerous schemes like
 * `javascript:` or `data:` from a compromised upload endpoint are rejected
 * and replaced with `#unsafe-url` so the markdown is never persisted with
 * an executable URL.
 */
export function fileToMarkdown(file: File, url: string): string {
  // Reject non-https absolute URLs (e.g. javascript:, data:, file:)
  const isSafeUrl = /^https:\/\//i.test(url) || /^\//.test(url) || /^\.\.?\//.test(url);
  const safeUrl = isSafeUrl
    ? url.replace(/\(/g, '%28').replace(/\)/g, '%29')
    : '#unsafe-url';

  const safeName = file.name.replace(/[[\]]/g, '\\$&');
  if (file.type.startsWith('image/')) {
    return `![${safeName}](${safeUrl})`;
  }
  return `[${safeName}](${safeUrl})`;
}

/**
 * Upload a single file to the given URL via XHR POST multipart/form-data.
 *
 * @param file         The file to upload
 * @param uploadUrl    POST endpoint — must return `{ url: string }` on 2xx
 * @param onProgress   Callback fired with progress 0–100 during upload
 * @returns            Resolves with the URL from the server response
 * @throws             Rejects with an Error on failure
 */
export function uploadFile(
  file: File,
  uploadUrl: string,
  onProgress: (pct: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const body = new FormData();
    body.append('file', file);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as { url?: string };
          if (data.url) {
            resolve(data.url);
          } else {
            reject(new Error('Upload response missing url field'));
          }
        } catch {
          reject(new Error('Upload response is not valid JSON'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

    xhr.open('POST', uploadUrl);
    xhr.send(body);
  });
}
