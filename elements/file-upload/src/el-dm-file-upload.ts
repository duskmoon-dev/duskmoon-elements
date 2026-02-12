/**
 * DuskMoon File Upload Element
 *
 * A drag-and-drop file upload component with file list and preview support.
 * Uses styles from @duskmoon-dev/core for consistent theming.
 *
 * @element el-dm-file-upload
 *
 * @attr {string} accept - File type filter (e.g., "image/*,.pdf")
 * @attr {boolean} multiple - Allow multiple files
 * @attr {boolean} disabled - Whether the upload is disabled
 * @attr {number} max-size - Maximum file size in bytes
 * @attr {number} max-files - Maximum number of files
 * @attr {boolean} show-preview - Show image previews
 * @attr {boolean} compact - Use compact layout
 * @attr {string} size - Size: sm, md, lg
 *
 * @slot - Default slot for custom dropzone content
 *
 * @csspart dropzone - The dropzone area
 * @csspart file-list - The file list container
 *
 * @fires change - Fired when files are selected
 * @fires remove - Fired when a file is removed
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as fileUploadCSS } from '@duskmoon-dev/core/components/file-upload';

export type FileUploadSize = 'sm' | 'md' | 'lg';

export interface UploadedFile {
  file: File;
  id: string;
  preview?: string;
}

const SIZE_CLASSES: Record<string, string> = {
  sm: 'file-upload-sm',
  md: '',
  lg: 'file-upload-lg',
};

// Strip @layer wrapper for Shadow DOM compatibility
const coreStyles = fileUploadCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: block;
  }

  :host([hidden]) {
    display: none !important;
  }

  ${coreStyles}

  /* Web component specific adjustments */
  .file-upload {
    font-family: inherit;
  }

  .file-upload-dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 150px;
    padding: 2rem;
    border: 2px dashed var(--color-outline, #ccc);
    border-radius: 0.5rem;
    background-color: var(--color-surface-container, #f5f5f5);
    cursor: pointer;
    transition:
      border-color 0.2s,
      background-color 0.2s;
  }

  .file-upload-dropzone:hover {
    border-color: var(--color-primary);
    background-color: var(--color-surface-container-high, #e8e8e8);
  }

  .file-upload-dropzone.dragging {
    border-color: var(--color-primary);
    background-color: var(--color-primary);
    background-color: rgba(var(--color-primary-rgb, 98, 0, 238), 0.1);
  }

  .file-upload-input {
    display: none;
  }

  .file-upload-icon {
    font-size: 2.5rem;
    color: var(--color-on-surface);
    opacity: 0.5;
  }

  .file-upload-text {
    text-align: center;
  }

  .file-upload-title {
    font-size: 1rem;
    font-weight: 500;
    color: var(--color-on-surface);
  }

  .file-upload-subtitle {
    font-size: 0.875rem;
    color: var(--color-on-surface);
    opacity: 0.7;
  }

  .file-upload-browse {
    color: var(--color-primary);
    text-decoration: underline;
    cursor: pointer;
  }

  /* File list */
  .file-upload-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .file-upload-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background-color: var(--color-surface-container, #f5f5f5);
    border-radius: 0.375rem;
  }

  .file-upload-item-icon {
    font-size: 1.5rem;
    color: var(--color-on-surface);
    opacity: 0.7;
  }

  .file-upload-item-info {
    flex: 1;
    min-width: 0;
  }

  .file-upload-item-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-on-surface);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-upload-item-size {
    font-size: 0.75rem;
    color: var(--color-on-surface);
    opacity: 0.7;
  }

  .file-upload-item-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    border: none;
    border-radius: 50%;
    background-color: transparent;
    color: var(--color-on-surface);
    opacity: 0.5;
    cursor: pointer;
    transition:
      opacity 0.2s,
      background-color 0.2s;
  }

  .file-upload-item-remove:hover {
    opacity: 1;
    background-color: var(--color-error);
    color: var(--color-on-error, white);
  }

  /* Preview grid */
  .file-upload-preview {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .file-upload-preview-item {
    position: relative;
    aspect-ratio: 1;
    border-radius: 0.375rem;
    overflow: hidden;
    background-color: var(--color-surface-container, #f5f5f5);
  }

  .file-upload-preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .file-upload-preview-remove {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    border: none;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .file-upload-preview-item:hover .file-upload-preview-remove {
    opacity: 1;
  }

  /* Size variants */
  .file-upload-sm .file-upload-dropzone {
    min-height: 100px;
    padding: 1rem;
  }

  .file-upload-lg .file-upload-dropzone {
    min-height: 200px;
    padding: 3rem;
  }

  /* Compact variant */
  .file-upload-compact .file-upload-dropzone {
    flex-direction: row;
    min-height: auto;
    padding: 1rem;
  }

  /* Disabled state */
  :host([disabled]) .file-upload-dropzone {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

export class ElDmFileUpload extends BaseElement {
  static properties = {
    accept: { type: String, reflect: true },
    multiple: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    maxSize: { type: Number, reflect: true, attribute: 'max-size' },
    maxFiles: { type: Number, reflect: true, attribute: 'max-files' },
    showPreview: { type: Boolean, reflect: true, attribute: 'show-preview' },
    compact: { type: Boolean, reflect: true },
    size: { type: String, reflect: true },
  };

  declare accept: string;
  declare multiple: boolean;
  declare disabled: boolean;
  declare maxSize: number;
  declare maxFiles: number;
  declare showPreview: boolean;
  declare compact: boolean;
  declare size: FileUploadSize;

  private _files: UploadedFile[] = [];

  constructor() {
    super();
    this.attachStyles(styles);
  }

  get files(): UploadedFile[] {
    return this._files;
  }

  private _getClasses(): string {
    const classes = ['file-upload'];

    if (this.size && SIZE_CLASSES[this.size]) {
      classes.push(SIZE_CLASSES[this.size]);
    }

    if (this.compact) {
      classes.push('file-upload-compact');
    }

    return classes.join(' ');
  }

  private _formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private _generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  private _handleDragOver(e: DragEvent): void {
    e.preventDefault();
    if (this.disabled) return;
    const dropzone = this.shadowRoot?.querySelector('.file-upload-dropzone');
    dropzone?.classList.add('dragging');
  }

  private _handleDragLeave(e: DragEvent): void {
    e.preventDefault();
    const dropzone = this.shadowRoot?.querySelector('.file-upload-dropzone');
    dropzone?.classList.remove('dragging');
  }

  private _handleDrop(e: DragEvent): void {
    e.preventDefault();
    if (this.disabled) return;

    const dropzone = this.shadowRoot?.querySelector('.file-upload-dropzone');
    dropzone?.classList.remove('dragging');

    const files = e.dataTransfer?.files;
    if (files) {
      this._processFiles(files);
    }
  }

  private _handleClick(): void {
    if (this.disabled) return;
    const input = this.shadowRoot?.querySelector('.file-upload-input') as HTMLInputElement;
    input?.click();
  }

  private _handleInputChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      this._processFiles(input.files);
    }
    // Reset input so the same file can be selected again
    input.value = '';
  }

  private _processFiles(fileList: FileList): void {
    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      // Check max files
      if (this.maxFiles && this._files.length + newFiles.length >= this.maxFiles) {
        break;
      }

      // Check file size
      if (this.maxSize && file.size > this.maxSize) {
        continue;
      }

      const uploadedFile: UploadedFile = {
        file,
        id: this._generateId(),
      };

      // Generate preview for images
      if (this.showPreview && file.type.startsWith('image/')) {
        uploadedFile.preview = URL.createObjectURL(file);
      }

      newFiles.push(uploadedFile);
    }

    if (this.multiple) {
      this._files = [...this._files, ...newFiles];
    } else {
      // Clean up old previews
      this._files.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      this._files = newFiles.slice(0, 1);
    }

    this._updateFileList();
    this.emit('change', { files: this._files.map((f) => f.file) });
  }

  private _removeFile(id: string): void {
    const file = this._files.find((f) => f.id === id);
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }

    this._files = this._files.filter((f) => f.id !== id);
    this._updateFileList();
    this.emit('remove', { files: this._files.map((f) => f.file) });
    this.emit('change', { files: this._files.map((f) => f.file) });
  }

  private _updateFileList(): void {
    const listContainer = this.shadowRoot?.querySelector('.file-upload-list');
    const previewContainer = this.shadowRoot?.querySelector('.file-upload-preview');

    if (this.showPreview && previewContainer) {
      previewContainer.innerHTML = this._files
        .map(
          (f) => `
          <div class="file-upload-preview-item" data-id="${f.id}">
            ${f.preview ? `<img class="file-upload-preview-image" src="${f.preview}" alt="${f.file.name}">` : ''}
            <button class="file-upload-preview-remove" type="button" aria-label="Remove file">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        `,
        )
        .join('');

      previewContainer.querySelectorAll('.file-upload-preview-remove').forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this._removeFile(this._files[index].id);
        });
      });
    } else if (listContainer) {
      listContainer.innerHTML = this._files
        .map(
          (f) => `
          <div class="file-upload-item" data-id="${f.id}">
            <span class="file-upload-item-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </span>
            <div class="file-upload-item-info">
              <div class="file-upload-item-name">${f.file.name}</div>
              <div class="file-upload-item-size">${this._formatFileSize(f.file.size)}</div>
            </div>
            <button class="file-upload-item-remove" type="button" aria-label="Remove file">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        `,
        )
        .join('');

      listContainer.querySelectorAll('.file-upload-item-remove').forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this._removeFile(this._files[index].id);
        });
      });
    }
  }

  /**
   * Clear all files
   */
  clear(): void {
    this._files.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    this._files = [];
    this._updateFileList();
    this.emit('change', { files: [] });
  }

  render(): string {
    const classes = this._getClasses();

    return `
      <div class="${classes}" part="file-upload">
        <input
          type="file"
          class="file-upload-input"
          ${this.accept ? `accept="${this.accept}"` : ''}
          ${this.multiple ? 'multiple' : ''}
          ${this.disabled ? 'disabled' : ''}
        >
        <div class="file-upload-dropzone" part="dropzone">
          <span class="file-upload-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </span>
          <div class="file-upload-text">
            <div class="file-upload-title">
              Drag & drop files here or <span class="file-upload-browse">browse</span>
            </div>
            <div class="file-upload-subtitle">
              ${this.accept ? `Accepted: ${this.accept}` : 'All file types accepted'}
              ${this.maxSize ? ` • Max ${this._formatFileSize(this.maxSize)}` : ''}
            </div>
          </div>
        </div>
        ${this.showPreview ? '<div class="file-upload-preview" part="preview"></div>' : '<div class="file-upload-list" part="file-list"></div>'}
      </div>
    `;
  }

  update(): void {
    super.update();

    const dropzone = this.shadowRoot?.querySelector('.file-upload-dropzone');
    const input = this.shadowRoot?.querySelector('.file-upload-input');

    dropzone?.addEventListener('dragover', ((e: DragEvent) =>
      this._handleDragOver(e)) as EventListener);
    dropzone?.addEventListener('dragleave', ((e: DragEvent) =>
      this._handleDragLeave(e)) as EventListener);
    dropzone?.addEventListener('drop', ((e: DragEvent) => this._handleDrop(e)) as EventListener);
    dropzone?.addEventListener('click', () => this._handleClick());
    input?.addEventListener('change', ((e: Event) => this._handleInputChange(e)) as EventListener);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback?.();
    // Clean up object URLs
    this._files.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
  }
}
