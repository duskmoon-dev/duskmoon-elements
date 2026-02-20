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
 * @csspart handle - The drag handle bar
 * @csspart handle-area - The drag handle touch area
 * @csspart content - The content wrapper
 * @csspart header - The header section
 *
 * @fires open - Fired when sheet opens
 * @fires close - Fired when sheet closes
 * @fires snap - Fired when sheet snaps to a point, detail contains { height, index }
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as bottomsheetCSS } from '@duskmoon-dev/core/components/bottomsheet';

// Strip @layer wrapper for Shadow DOM compatibility
const coreStyles = bottomsheetCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: contents;
  }

  :host([hidden]) {
    display: none !important;
  }

  /* Import core bottomsheet styles */
  ${coreStyles}

  /* Wrapper for fixed overlay with pointer-events control */
  .bottomsheet-wrapper {
    position: fixed;
    inset: 0;
    z-index: 1000;
    pointer-events: none;
  }

  .bottomsheet-wrapper.open {
    pointer-events: auto;
  }

  /* Override core's fixed positioning since sheet is inside a fixed wrapper */
  .bottomsheet {
    position: absolute;
    z-index: auto;
    pointer-events: auto;
  }

  /* Override core's fixed positioning on backdrop */
  .bottomsheet-backdrop {
    position: absolute;
  }

  .bottomsheet.dragging {
    transition: none;
  }

  /* We render an explicit handle bar div; hide core's ::before pseudo-element */
  .bottomsheet-handle::before {
    display: none;
  }

  .bottomsheet-bar {
    width: 2.5rem;
    height: 0.25rem;
    background-color: var(--color-outline);
    border-radius: 0.125rem;
    transition: background-color 150ms ease;
  }

  .bottomsheet-handle:hover .bottomsheet-bar {
    background-color: var(--color-outline-variant, var(--color-outline));
  }

  .bottomsheet-header {
    border-bottom: 1px solid var(--color-outline);
  }

  .bottomsheet-header:empty {
    display: none;
  }

  .bottomsheet-content {
    padding: 1rem;
  }

  /* Focus trap indicator for modal */
  .bottomsheet:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
  }

  /* Safe area padding for notched devices */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    .bottomsheet-content {
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
    const sheet = this.shadowRoot?.querySelector('.bottomsheet') as HTMLElement;
    if (!sheet) return;

    this._focusableElements = Array.from(
      sheet.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    );

    const slotContent = this.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
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

    const sheet = this.shadowRoot?.querySelector('.bottomsheet') as HTMLElement;
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
      const sheet = this.shadowRoot?.querySelector('.bottomsheet') as HTMLElement;
      if (sheet) {
        sheet.style.transform = `translateY(${deltaY}px)`;
      }
    }
  };

  private _handleTouchEnd = (): void => {
    if (!this._isDragging) return;

    this._isDragging = false;
    const deltaY = this._currentY - this._startY;
    const sheet = this.shadowRoot?.querySelector('.bottomsheet') as HTMLElement;

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

    const sheet = this.shadowRoot?.querySelector('.bottomsheet') as HTMLElement;
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
      const sheet = this.shadowRoot?.querySelector('.bottomsheet') as HTMLElement;
      if (sheet) {
        sheet.style.transform = `translateY(${deltaY}px)`;
      }
    }
  };

  private _handleMouseUp = (): void => {
    if (!this._isDragging) return;

    this._isDragging = false;
    const deltaY = this._currentY - this._startY;
    const sheet = this.shadowRoot?.querySelector('.bottomsheet') as HTMLElement;

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

      const sheet = this.shadowRoot?.querySelector('.bottomsheet') as HTMLElement;
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
      const sheet = this.shadowRoot?.querySelector('.bottomsheet') as HTMLElement;
      if (sheet) {
        sheet.style.height = `${this._parsedSnapPoints[this._currentSnapIndex]}vh`;
      }
    }

    this.emit('open');

    if (this.modal) {
      requestAnimationFrame(() => {
        const sheet = this.shadowRoot?.querySelector('.bottomsheet') as HTMLElement;
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
      <div class="bottomsheet-wrapper ${this.open ? 'open' : ''}" part="wrapper">
        ${this.modal ? `<div class="bottomsheet-backdrop ${this.open ? 'show' : ''}" part="backdrop"></div>` : ''}
        <div
          class="bottomsheet ${this.open ? 'show' : ''}"
          role="dialog"
          aria-modal="${this.modal ? 'true' : 'false'}"
          tabindex="-1"
          part="sheet"
        >
          <div class="bottomsheet-handle" part="handle-area">
            <div class="bottomsheet-bar" part="handle"></div>
          </div>
          <div class="bottomsheet-header" part="header">
            <slot name="header"></slot>
          </div>
          <div class="bottomsheet-content" part="content">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  }

  update(): void {
    super.update();

    const backdrop = this.shadowRoot?.querySelector('.bottomsheet-backdrop');
    backdrop?.addEventListener('click', this._handleBackdropClick);

    const handleArea = this.shadowRoot?.querySelector('.bottomsheet-handle');
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
