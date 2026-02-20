/**
 * DuskMoon Popover Element
 *
 * A contextual overlay/popup component that appears relative to a trigger element.
 * Supports multiple trigger modes, placements, and auto-flip when near viewport edges.
 *
 * @element el-dm-popover
 *
 * @attr {boolean} open - Whether the popover is visible
 * @attr {string} trigger - Trigger mode: click, hover, focus, manual
 * @attr {string} placement - Popover position relative to trigger
 * @attr {number} offset - Distance from trigger element in pixels
 * @attr {boolean} arrow - Whether to show arrow pointing to trigger
 *
 * @slot trigger - The element that triggers the popover
 * @slot - Default slot for popover content
 *
 * @fires open - Fired when popover opens
 * @fires close - Fired when popover closes
 *
 * @csspart popover - The popover container
 * @csspart content - The popover content area
 * @csspart arrow - The popover arrow
 */

import { BaseElement, css, animationStyles } from '@duskmoon-dev/el-base';
import { css as popoverCSS } from '@duskmoon-dev/core/components/popover';

export type PopoverPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

export type PopoverTrigger = 'click' | 'hover' | 'focus' | 'manual';

// Strip @layer wrapper for Shadow DOM compatibility
const coreStyles = popoverCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: inline-block;
    position: relative;
  }

  :host([hidden]) {
    display: none !important;
  }

  /* Import core popover styles */
  ${coreStyles}

  .popover-trigger {
    display: inline-flex;
  }

  /* Override core's position: absolute for JS-based positioning */
  .popover-content {
    position: fixed;
    min-width: 8rem;
    pointer-events: none;
    font-family: inherit;
  }

  .popover-content.show {
    pointer-events: auto;
  }

  /* Arrow positioning based on popover placement (data-attribute based) */
  .popover-content[data-placement^='top'] .popover-arrow {
    bottom: -0.4375rem;
    border-top: none;
    border-left: none;
  }

  .popover-content[data-placement^='bottom'] .popover-arrow {
    top: -0.4375rem;
    border-bottom: none;
    border-right: none;
  }

  .popover-content[data-placement^='left'] .popover-arrow {
    right: -0.4375rem;
    border-top: none;
    border-left: none;
  }

  .popover-content[data-placement^='right'] .popover-arrow {
    left: -0.4375rem;
    border-bottom: none;
    border-right: none;
  }

  /* Center aligned arrows */
  .popover-content[data-placement='top'] .popover-arrow,
  .popover-content[data-placement='bottom'] .popover-arrow {
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
  }

  .popover-content[data-placement='left'] .popover-arrow,
  .popover-content[data-placement='right'] .popover-arrow {
    top: 50%;
    transform: translateY(-50%) rotate(45deg);
  }

  /* Start aligned arrows */
  .popover-content[data-placement='top-start'] .popover-arrow,
  .popover-content[data-placement='bottom-start'] .popover-arrow {
    left: 1rem;
  }

  .popover-content[data-placement='left-start'] .popover-arrow,
  .popover-content[data-placement='right-start'] .popover-arrow {
    top: 1rem;
  }

  /* End aligned arrows */
  .popover-content[data-placement='top-end'] .popover-arrow,
  .popover-content[data-placement='bottom-end'] .popover-arrow {
    right: 1rem;
    left: auto;
  }

  .popover-content[data-placement='left-end'] .popover-arrow,
  .popover-content[data-placement='right-end'] .popover-arrow {
    bottom: 1rem;
    top: auto;
  }
`;

export class ElDmPopover extends BaseElement {
  static properties = {
    open: { type: Boolean, reflect: true, default: false },
    trigger: { type: String, reflect: true, default: 'click' },
    placement: { type: String, reflect: true, default: 'bottom' },
    offset: { type: Number, reflect: true, default: 8 },
    arrow: { type: Boolean, reflect: true, default: true },
  };

  declare open: boolean;
  declare trigger: PopoverTrigger;
  declare placement: PopoverPlacement;
  declare offset: number;
  declare arrow: boolean;

  private _boundHandleClickOutside: (e: MouseEvent) => void;
  private _boundHandleKeyDown: (e: KeyboardEvent) => void;
  private _boundHandleScroll: () => void;
  private _boundUpdatePosition: () => void;
  private _hoverTimeout: number | null = null;
  private _currentPlacement: PopoverPlacement = 'bottom';

  constructor() {
    super();
    this.attachStyles([styles, animationStyles]);
    this._boundHandleClickOutside = this._handleClickOutside.bind(this);
    this._boundHandleKeyDown = this._handleKeyDown.bind(this);
    this._boundHandleScroll = this._handleScroll.bind(this);
    this._boundUpdatePosition = this._updatePosition.bind(this);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._setupTriggerListeners();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback?.();
    this._removeTriggerListeners();
    this._removeGlobalListeners();
  }

  /**
   * Show the popover
   */
  show(): void {
    if (this.open) return;
    this.open = true;
    this._currentPlacement = this.placement;
    this._addGlobalListeners();
    this._updatePosition();
    this._setVisible(true);
    this.emit('open');
  }

  /**
   * Hide the popover
   */
  hide(): void {
    if (!this.open) return;
    this.open = false;
    this._removeGlobalListeners();
    this._setVisible(false);
    this.emit('close');
  }

  /**
   * Toggle the popover visibility
   */
  toggle(): void {
    if (this.open) {
      this.hide();
    } else {
      this.show();
    }
  }

  private _setVisible(visible: boolean): void {
    const panel = this.shadowRoot?.querySelector('.popover-content');
    if (panel) {
      panel.classList.toggle('show', visible);
    }
  }

  private _setupTriggerListeners(): void {
    const triggerSlot = this.shadowRoot?.querySelector(
      'slot[name="trigger"]',
    ) as HTMLSlotElement | null;

    if (!triggerSlot) return;

    triggerSlot.addEventListener('slotchange', () => {
      this._attachTriggerEvents();
    });

    // Initial attachment
    this._attachTriggerEvents();
  }

  private _attachTriggerEvents(): void {
    const triggerEl = this._getTriggerElement();
    if (!triggerEl) return;

    // Remove any existing listeners first
    this._detachTriggerEvents(triggerEl);

    if (this.trigger === 'click') {
      triggerEl.addEventListener('click', this._handleTriggerClick);
    } else if (this.trigger === 'hover') {
      triggerEl.addEventListener('mouseenter', this._handleTriggerMouseEnter);
      triggerEl.addEventListener('mouseleave', this._handleTriggerMouseLeave);
      // Also track hover on the popover panel
      this.addEventListener('mouseenter', this._handlePopoverMouseEnter);
      this.addEventListener('mouseleave', this._handlePopoverMouseLeave);
    } else if (this.trigger === 'focus') {
      triggerEl.addEventListener('focusin', this._handleTriggerFocus);
      triggerEl.addEventListener('focusout', this._handleTriggerBlur);
    }
  }

  private _detachTriggerEvents(triggerEl: Element): void {
    triggerEl.removeEventListener('click', this._handleTriggerClick);
    triggerEl.removeEventListener('mouseenter', this._handleTriggerMouseEnter);
    triggerEl.removeEventListener('mouseleave', this._handleTriggerMouseLeave);
    triggerEl.removeEventListener('focusin', this._handleTriggerFocus);
    triggerEl.removeEventListener('focusout', this._handleTriggerBlur);
    this.removeEventListener('mouseenter', this._handlePopoverMouseEnter);
    this.removeEventListener('mouseleave', this._handlePopoverMouseLeave);
  }

  private _removeTriggerListeners(): void {
    const triggerEl = this._getTriggerElement();
    if (triggerEl) {
      this._detachTriggerEvents(triggerEl);
    }
  }

  private _getTriggerElement(): Element | null {
    const triggerSlot = this.shadowRoot?.querySelector(
      'slot[name="trigger"]',
    ) as HTMLSlotElement | null;
    if (!triggerSlot) return null;
    const assigned = triggerSlot.assignedElements();
    return assigned[0] || null;
  }

  private _handleTriggerClick = (): void => {
    this.toggle();
  };

  private _handleTriggerMouseEnter = (): void => {
    if (this._hoverTimeout) {
      clearTimeout(this._hoverTimeout);
      this._hoverTimeout = null;
    }
    this.show();
  };

  private _handleTriggerMouseLeave = (): void => {
    this._hoverTimeout = window.setTimeout(() => {
      this.hide();
    }, 100);
  };

  private _handlePopoverMouseEnter = (): void => {
    if (this._hoverTimeout) {
      clearTimeout(this._hoverTimeout);
      this._hoverTimeout = null;
    }
  };

  private _handlePopoverMouseLeave = (): void => {
    this._hoverTimeout = window.setTimeout(() => {
      this.hide();
    }, 100);
  };

  private _handleTriggerFocus = (): void => {
    this.show();
  };

  private _handleTriggerBlur = (): void => {
    // Delay to allow focus to move to popover content
    setTimeout(() => {
      if (!this.contains(document.activeElement)) {
        this.hide();
      }
    }, 0);
  };

  private _addGlobalListeners(): void {
    document.addEventListener('click', this._boundHandleClickOutside, true);
    document.addEventListener('keydown', this._boundHandleKeyDown);
    window.addEventListener('scroll', this._boundHandleScroll, true);
    window.addEventListener('resize', this._boundUpdatePosition);
  }

  private _removeGlobalListeners(): void {
    document.removeEventListener('click', this._boundHandleClickOutside, true);
    document.removeEventListener('keydown', this._boundHandleKeyDown);
    window.removeEventListener('scroll', this._boundHandleScroll, true);
    window.removeEventListener('resize', this._boundUpdatePosition);
  }

  private _handleClickOutside(e: MouseEvent): void {
    if (this.trigger !== 'click') return;

    const path = e.composedPath();
    if (!path.includes(this)) {
      this.hide();
    }
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this.hide();
      // Return focus to trigger element
      const triggerEl = this._getTriggerElement() as HTMLElement | null;
      triggerEl?.focus?.();
    }
  }

  private _handleScroll(): void {
    if (this.open) {
      this._updatePosition();
    }
  }

  private _updatePosition(): void {
    const triggerEl = this._getTriggerElement();
    const panel = this.shadowRoot?.querySelector('.popover-content') as HTMLElement | null;

    if (!triggerEl || !panel) return;

    const triggerRect = triggerEl.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Determine the best placement with auto-flip
    const effectivePlacement = this._getEffectivePlacement(
      triggerRect,
      panelRect,
      viewportWidth,
      viewportHeight,
    );

    this._currentPlacement = effectivePlacement;

    // Calculate position based on placement
    const position = this._calculatePosition(triggerRect, panelRect, effectivePlacement);

    // Apply position
    panel.style.left = `${position.x}px`;
    panel.style.top = `${position.y}px`;
    panel.setAttribute('data-placement', effectivePlacement);
  }

  private _getEffectivePlacement(
    triggerRect: DOMRect,
    panelRect: DOMRect,
    viewportWidth: number,
    viewportHeight: number,
  ): PopoverPlacement {
    const [mainAxis, alignment] = this.placement.split('-') as [
      'top' | 'bottom' | 'left' | 'right',
      'start' | 'end' | undefined,
    ];

    // Check if there's enough space in the preferred direction
    const spaceTop = triggerRect.top;
    const spaceBottom = viewportHeight - triggerRect.bottom;
    const spaceLeft = triggerRect.left;
    const spaceRight = viewportWidth - triggerRect.right;

    let effectiveMainAxis = mainAxis;

    // Flip main axis if needed
    if (mainAxis === 'top' && spaceTop < panelRect.height + this.offset) {
      if (spaceBottom >= panelRect.height + this.offset) {
        effectiveMainAxis = 'bottom';
      }
    } else if (mainAxis === 'bottom' && spaceBottom < panelRect.height + this.offset) {
      if (spaceTop >= panelRect.height + this.offset) {
        effectiveMainAxis = 'top';
      }
    } else if (mainAxis === 'left' && spaceLeft < panelRect.width + this.offset) {
      if (spaceRight >= panelRect.width + this.offset) {
        effectiveMainAxis = 'right';
      }
    } else if (mainAxis === 'right' && spaceRight < panelRect.width + this.offset) {
      if (spaceLeft >= panelRect.width + this.offset) {
        effectiveMainAxis = 'left';
      }
    }

    return alignment
      ? (`${effectiveMainAxis}-${alignment}` as PopoverPlacement)
      : effectiveMainAxis;
  }

  private _calculatePosition(
    triggerRect: DOMRect,
    panelRect: DOMRect,
    placement: PopoverPlacement,
  ): { x: number; y: number } {
    const [mainAxis, alignment] = placement.split('-') as [
      'top' | 'bottom' | 'left' | 'right',
      'start' | 'end' | undefined,
    ];

    let x = 0;
    let y = 0;

    // Calculate main axis position
    switch (mainAxis) {
      case 'top':
        y = triggerRect.top - panelRect.height - this.offset;
        break;
      case 'bottom':
        y = triggerRect.bottom + this.offset;
        break;
      case 'left':
        x = triggerRect.left - panelRect.width - this.offset;
        break;
      case 'right':
        x = triggerRect.right + this.offset;
        break;
    }

    // Calculate cross axis position based on alignment
    if (mainAxis === 'top' || mainAxis === 'bottom') {
      switch (alignment) {
        case 'start':
          x = triggerRect.left;
          break;
        case 'end':
          x = triggerRect.right - panelRect.width;
          break;
        default:
          x = triggerRect.left + (triggerRect.width - panelRect.width) / 2;
      }
    } else {
      switch (alignment) {
        case 'start':
          y = triggerRect.top;
          break;
        case 'end':
          y = triggerRect.bottom - panelRect.height;
          break;
        default:
          y = triggerRect.top + (triggerRect.height - panelRect.height) / 2;
      }
    }

    // Constrain to viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 8;

    x = Math.max(padding, Math.min(x, viewportWidth - panelRect.width - padding));
    y = Math.max(padding, Math.min(y, viewportHeight - panelRect.height - padding));

    return { x, y };
  }

  update(): void {
    super.update();
    if (this.open) {
      // Defer position update to allow DOM to render
      requestAnimationFrame(() => {
        this._updatePosition();
        this._setVisible(true);
      });
    }
  }

  render(): string {
    return `
      <div class="popover-trigger">
        <slot name="trigger"></slot>
      </div>
      <div
        class="popover-content"
        part="popover"
        role="dialog"
        aria-modal="false"
        data-placement="${this.placement}"
      >
        ${this.arrow ? '<div class="popover-arrow" part="arrow"></div>' : ''}
        <div class="popover-body" part="content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
