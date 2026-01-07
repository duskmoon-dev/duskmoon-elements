/**
 * DuskMoon Bottom Sheet Element
 *
 * A mobile bottom panel/sheet component for displaying content that slides up from the bottom.
 * Supports snap points, swipe gestures, and modal mode.
 *
 * @element el-dm-bottom-sheet
 *
 * @attr {boolean} open - Whether the bottom sheet is open
 * @attr {boolean} modal - Whether to show backdrop and trap focus
 * @attr {boolean} persistent - Prevent dismiss by outside click or swipe down
 * @attr {string} snap-points - Comma-separated list of snap point heights (e.g., "25%,50%,100%")
 *
 * @slot - Default slot for sheet content
 * @slot header - Header content above the drag handle
 *
 * @csspart sheet - The sheet container
 * @csspart backdrop - The backdrop overlay (modal mode)
 * @csspart handle - The drag handle
 * @csspart content - The content wrapper
 * @csspart header - The header section
 *
 * @fires open - Fired when sheet opens
 * @fires close - Fired when sheet closes
 * @fires snap - Fired when sheet snaps to a point, detail contains { height, index }
 */

import { BaseElement, css } from '@duskmoon-dev/el-core';

const styles = css`
  :host {
    display: contents;
  }

  :host([hidden]) {
    display: none !important;
  }

  .bottom-sheet-wrapper {
    position: fixed;
    inset: 0;
    z-index: 1000;
    pointer-events: none;
  }

  .bottom-sheet-wrapper.open {
    pointer-events: auto;
  }

  .bottom-sheet-backdrop {
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 300ms ease;
  }

  .bottom-sheet-wrapper.open .bottom-sheet-backdrop {
    opacity: 1;
  }

  .bottom-sheet {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    max-height: 100vh;
    max-height: 100dvh;
    background-color: var(--color-surface);
    border-radius: 1rem 1rem 0 0;
    box-shadow: 0 -4px 20px rgb(0 0 0 / 0.15);
    transform: translateY(100%);
    transition: transform 300ms cubic-bezier(0.32, 0.72, 0, 1);
    touch-action: none;
    will-change: transform;
    pointer-events: auto;
  }

  .bottom-sheet-wrapper.open .bottom-sheet {
    transform: translateY(0);
  }

  .bottom-sheet.dragging {
    transition: none;
  }

  .bottom-sheet-handle-area {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 0;
    cursor: grab;
    touch-action: none;
  }

  .bottom-sheet-handle-area:active {
    cursor: grabbing;
  }

  .bottom-sheet-handle {
    width: 2.5rem;
    height: 0.25rem;
    background-color: var(--color-outline);
    border-radius: 0.125rem;
    transition: background-color 150ms ease;
  }

  .bottom-sheet-handle-area:hover .bottom-sheet-handle {
    background-color: var(--color-outline-variant, var(--color-outline));
  }

  .bottom-sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1rem 0.75rem;
    border-bottom: 1px solid var(--color-outline);
  }

  .bottom-sheet-header:empty {
    display: none;
  }

  .bottom-sheet-content {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  /* Focus trap indicator for modal */
  .bottom-sheet:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
  }

  /* Safe area padding for notched devices */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    .bottom-sheet-content {
      padding-bottom: calc(1rem + env(safe-area-inset-bottom));
    }
  }
`;

interface SnapEvent {
  height: string;
  index: number;
}

export class ElDmBottomSheet extends BaseElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    modal: { type: Boolean, reflect: true },
    persistent: { type: Boolean, reflect: true },
    snapPoints: { type: String, reflect: true, attribute: 'snap-points' },
  };

  declare open: boolean;
  declare modal: boolean;
  declare persistent: boolean;
  declare snapPoints: string;

  private _startY = 0;
  private _currentY = 0;
  private _sheetHeight = 0;
  private _isDragging = false;
  private _parsedSnapPoints: number[] = [];
  private _currentSnapIndex = -1;
  private _focusableElements: HTMLElement[] = [];
  private _previouslyFocused: HTMLElement | null = null;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  connectedCallback(): void {
    super.connectedCallback?.();
    this._parseSnapPoints();
  }

  private _parseSnapPoints(): void {
    if (!this.snapPoints) {
      this._parsedSnapPoints = [100];
      return;
    }

    this._parsedSnapPoints = this.snapPoints
      .split(',')
      .map((point) => {
        const trimmed = point.trim();
        if (trimmed.endsWith('%')) {
          return parseFloat(trimmed);
        }
        return parseFloat(trimmed);
      })
      .filter((point) => !isNaN(point) && point > 0 && point <= 100)
      .sort((a, b) => a - b);

    if (this._parsedSnapPoints.length === 0) {
      this._parsedSnapPoints = [100];
    }
  }

  private _handleBackdropClick = (event: Event): void => {
    if (!this.persistent && event.target === event.currentTarget) {
      this.hide();
    }
  };

  private _handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && !this.persistent) {
      this.hide();
      return;
    }

    if (this.modal && event.key === 'Tab') {
      this._trapFocus(event);
    }
  };

  private _trapFocus(event: KeyboardEvent): void {
    const sheet = this.shadowRoot?.querySelector('.bottom-sheet') as HTMLElement;
    if (!sheet) return;

    this._focusableElements = Array.from(
      sheet.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );

    const slotContent = this.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    this._focusableElements.push(...Array.from(slotContent));

    if (this._focusableElements.length === 0) return;

    const firstFocusable = this._focusableElements[0];
    const lastFocusable = this._focusableElements[this._focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstFocusable) {
      event.preventDefault();
      lastFocusable.focus();
    } else if (!event.shiftKey && document.activeElement === lastFocusable) {
      event.preventDefault();
      firstFocusable.focus();
    }
  }

  private _handleTouchStart = (event: TouchEvent): void => {
    const touch = event.touches[0];
    this._startY = touch.clientY;
    this._isDragging = true;

    const sheet = this.shadowRoot?.querySelector('.bottom-sheet') as HTMLElement;
    if (sheet) {
      this._sheetHeight = sheet.getBoundingClientRect().height;
      sheet.classList.add('dragging');
    }
  };

  private _handleTouchMove = (event: TouchEvent): void => {
    if (!this._isDragging) return;

    const touch = event.touches[0];
    this._currentY = touch.clientY;
    const deltaY = this._currentY - this._startY;

    if (deltaY > 0) {
      event.preventDefault();
      const sheet = this.shadowRoot?.querySelector('.bottom-sheet') as HTMLElement;
      if (sheet) {
        sheet.style.transform = `translateY(${deltaY}px)`;
      }
    }
  };

  private _handleTouchEnd = (): void => {
    if (!this._isDragging) return;

    this._isDragging = false;
    const deltaY = this._currentY - this._startY;
    const sheet = this.shadowRoot?.querySelector('.bottom-sheet') as HTMLElement;

    if (sheet) {
      sheet.classList.remove('dragging');
      sheet.style.transform = '';
    }

    const threshold = this._sheetHeight * 0.25;

    if (!this.persistent && deltaY > threshold) {
      this.hide();
    } else if (this._parsedSnapPoints.length > 1) {
      this._snapToNearestPoint(deltaY);
    }

    this._startY = 0;
    this._currentY = 0;
  };

  private _handleMouseDown = (event: MouseEvent): void => {
    this._startY = event.clientY;
    this._isDragging = true;

    const sheet = this.shadowRoot?.querySelector('.bottom-sheet') as HTMLElement;
    if (sheet) {
      this._sheetHeight = sheet.getBoundingClientRect().height;
      sheet.classList.add('dragging');
    }

    document.addEventListener('mousemove', this._handleMouseMove);
    document.addEventListener('mouseup', this._handleMouseUp);
  };

  private _handleMouseMove = (event: MouseEvent): void => {
    if (!this._isDragging) return;

    this._currentY = event.clientY;
    const deltaY = this._currentY - this._startY;

    if (deltaY > 0) {
      const sheet = this.shadowRoot?.querySelector('.bottom-sheet') as HTMLElement;
      if (sheet) {
        sheet.style.transform = `translateY(${deltaY}px)`;
      }
    }
  };

  private _handleMouseUp = (): void => {
    if (!this._isDragging) return;

    this._isDragging = false;
    const deltaY = this._currentY - this._startY;
    const sheet = this.shadowRoot?.querySelector('.bottom-sheet') as HTMLElement;

    if (sheet) {
      sheet.classList.remove('dragging');
      sheet.style.transform = '';
    }

    document.removeEventListener('mousemove', this._handleMouseMove);
    document.removeEventListener('mouseup', this._handleMouseUp);

    const threshold = this._sheetHeight * 0.25;

    if (!this.persistent && deltaY > threshold) {
      this.hide();
    } else if (this._parsedSnapPoints.length > 1) {
      this._snapToNearestPoint(deltaY);
    }

    this._startY = 0;
    this._currentY = 0;
  };

  private _snapToNearestPoint(deltaY: number): void {
    const currentHeightPercent = ((this._sheetHeight - deltaY) / window.innerHeight) * 100;

    let nearestIndex = 0;
    let nearestDistance = Math.abs(this._parsedSnapPoints[0] - currentHeightPercent);

    for (let i = 1; i < this._parsedSnapPoints.length; i++) {
      const distance = Math.abs(this._parsedSnapPoints[i] - currentHeightPercent);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    if (nearestIndex !== this._currentSnapIndex) {
      this._currentSnapIndex = nearestIndex;
      const snapHeight = this._parsedSnapPoints[nearestIndex];

      const sheet = this.shadowRoot?.querySelector('.bottom-sheet') as HTMLElement;
      if (sheet) {
        sheet.style.height = `${snapHeight}vh`;
      }

      this.emit<SnapEvent>('snap', {
        height: `${snapHeight}%`,
        index: nearestIndex,
      });
    }
  }

  show(): void {
    this._parseSnapPoints();
    this._previouslyFocused = document.activeElement as HTMLElement;
    this.open = true;
    document.addEventListener('keydown', this._handleKeyDown);
    document.body.style.overflow = 'hidden';

    if (this._parsedSnapPoints.length > 0) {
      this._currentSnapIndex = this._parsedSnapPoints.length - 1;
      const sheet = this.shadowRoot?.querySelector('.bottom-sheet') as HTMLElement;
      if (sheet) {
        sheet.style.height = `${this._parsedSnapPoints[this._currentSnapIndex]}vh`;
      }
    }

    this.emit('open');

    if (this.modal) {
      requestAnimationFrame(() => {
        const sheet = this.shadowRoot?.querySelector('.bottom-sheet') as HTMLElement;
        sheet?.focus();
      });
    }
  }

  hide(): void {
    this.open = false;
    document.removeEventListener('keydown', this._handleKeyDown);
    document.body.style.overflow = '';

    this.emit('close');

    if (this._previouslyFocused) {
      this._previouslyFocused.focus();
      this._previouslyFocused = null;
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback?.();
    document.removeEventListener('keydown', this._handleKeyDown);
    document.removeEventListener('mousemove', this._handleMouseMove);
    document.removeEventListener('mouseup', this._handleMouseUp);
    document.body.style.overflow = '';
  }

  render(): string {
    return `
      <div class="bottom-sheet-wrapper ${this.open ? 'open' : ''}" part="wrapper">
        ${this.modal ? '<div class="bottom-sheet-backdrop" part="backdrop"></div>' : ''}
        <div
          class="bottom-sheet"
          role="dialog"
          aria-modal="${this.modal ? 'true' : 'false'}"
          tabindex="-1"
          part="sheet"
        >
          <div class="bottom-sheet-handle-area" part="handle-area">
            <div class="bottom-sheet-handle" part="handle"></div>
          </div>
          <div class="bottom-sheet-header" part="header">
            <slot name="header"></slot>
          </div>
          <div class="bottom-sheet-content" part="content">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  }

  update(): void {
    super.update();

    const backdrop = this.shadowRoot?.querySelector('.bottom-sheet-backdrop');
    backdrop?.addEventListener('click', this._handleBackdropClick);

    const handleArea = this.shadowRoot?.querySelector('.bottom-sheet-handle-area');
    handleArea?.addEventListener('touchstart', this._handleTouchStart as EventListener, {
      passive: false,
    });
    handleArea?.addEventListener('touchmove', this._handleTouchMove as EventListener, {
      passive: false,
    });
    handleArea?.addEventListener('touchend', this._handleTouchEnd);
    handleArea?.addEventListener('mousedown', this._handleMouseDown as EventListener);
  }
}
