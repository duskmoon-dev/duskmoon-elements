import { BaseElement, css as cssTag } from '@duskmoon-dev/el-base';
import { css } from '@duskmoon-dev/core/components/datepicker';

// Strip @layer components wrapper for Shadow DOM
const strippedCss = css
  .replace(/@layer\s+components\s*\{/, '')
  .replace(/\}[\s]*$/, '');

const styles = cssTag`
  ${strippedCss}

  :host {
    display: block;
  }

  :host([hidden]) {
    display: none;
  }

  .datepicker {
    width: 100%;
  }

  /* Popover API styles for dropdown - fixed width for 7-column calendar */
  .datepicker-dropdown {
    position: fixed;
    margin: 0;
    border: none;
    padding: 0;
    inset: unset;
    overflow: hidden;
    background: var(--color-surface, white);
    border-radius: var(--radius-lg, 0.75rem);
    box-shadow: var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1));
    /* 7 days × 2.5rem = 17.5rem + 1rem padding = 18.5rem ≈ 296px */
    width: 296px;
  }

  .datepicker-dropdown:popover-open {
    display: block;
  }

  /* Calendar container - stack weekdays and days vertically */
  .datepicker-dropdown .datepicker-calendar {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 0.5rem;
    box-sizing: border-box;
  }

  /* Override grid to use fixed sizes instead of 1fr */
  .datepicker-dropdown .datepicker-weekdays,
  .datepicker-dropdown .datepicker-days {
    display: grid !important;
    grid-template-columns: repeat(7, 2.5rem) !important;
    gap: 0 !important;
    width: fit-content;
    margin: 0 auto;
  }

  .datepicker-dropdown .datepicker-day {
    width: 2.5rem !important;
    height: 2.5rem !important;
    padding: 0;
  }

  .datepicker-dropdown .datepicker-weekday {
    width: 2.5rem;
    height: 2rem;
  }

  .datepicker-dropdown .datepicker-months,
  .datepicker-dropdown .datepicker-years {
    display: grid !important;
    grid-template-columns: repeat(3, 5.5rem) !important;
    gap: 0.5rem !important;
    width: fit-content;
    margin: 0 auto;
    padding: 0.5rem;
  }
`;

export type DatepickerSize = 'sm' | 'md' | 'lg';
type ViewMode = 'days' | 'months' | 'years';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export class ElDmDatepicker extends BaseElement {
  static properties = {
    value: { type: String, reflect: true, default: '' },
    disabled: { type: Boolean, reflect: true, default: false },
    placeholder: { type: String, reflect: true, default: 'Select date' },
    format: { type: String, reflect: true, default: 'YYYY-MM-DD' },
    minDate: { type: String, reflect: true, default: '' },
    maxDate: { type: String, reflect: true, default: '' },
    range: { type: Boolean, reflect: true, default: false },
    showTime: { type: Boolean, reflect: true, default: false },
    size: { type: String, reflect: true, default: 'md' },
  };

  declare value: string;
  declare disabled: boolean;
  declare placeholder: string;
  declare format: string;
  declare minDate: string;
  declare maxDate: string;
  declare range: boolean;
  declare showTime: boolean;
  declare size: DatepickerSize;

  private _isOpen = false;
  private _viewMode: ViewMode = 'days';
  private _viewDate = new Date();
  private _selectedDate: Date | null = null;
  private _rangeStart: Date | null = null;
  private _rangeEnd: Date | null = null;
  private _hours = 12;
  private _minutes = 0;
  private _period: 'AM' | 'PM' = 'AM';

  constructor() {
    super();
    this.attachStyles(styles);
  }

  private _delegatedClickHandler: ((e: Event) => void) | null = null;
  private _delegatedChangeHandler: ((e: Event) => void) | null = null;
  private _scrollHandler: (() => void) | null = null;

  connectedCallback() {
    super.connectedCallback();
    this._parseValue();
    document.addEventListener('click', this._handleOutsideClick);
    this._setupEventDelegation();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._handleOutsideClick);
    this._removeEventDelegation();
    // Clean up scroll/resize handlers
    if (this._scrollHandler) {
      window.removeEventListener('scroll', this._scrollHandler, true);
      window.removeEventListener('resize', this._scrollHandler);
      this._scrollHandler = null;
    }
  }

  private _setupEventDelegation() {
    // Click handler for all interactive elements
    this._delegatedClickHandler = (e: Event) => {
      const target = e.target as HTMLElement;

      // Input click - toggle dropdown
      if (target.closest('.datepicker-input')) {
        e.stopPropagation();
        this._toggle();
        return;
      }

      // Navigation buttons
      if (target.closest('[data-nav="prev"]')) {
        e.stopPropagation();
        this._handlePrev();
        return;
      }
      if (target.closest('[data-nav="next"]')) {
        e.stopPropagation();
        this._handleNext();
        return;
      }

      // Title toggle view
      if (target.closest('[data-action="toggle-view"]')) {
        e.stopPropagation();
        this._handleToggleView();
        return;
      }

      // Day selection
      const dayBtn = target.closest('.datepicker-day') as HTMLElement;
      if (dayBtn && dayBtn.dataset.date) {
        e.stopPropagation();
        this._selectDate(new Date(dayBtn.dataset.date));
        return;
      }

      // Month selection
      const monthBtn = target.closest('.datepicker-month') as HTMLElement;
      if (monthBtn && monthBtn.dataset.month !== undefined) {
        e.stopPropagation();
        this._selectMonth(parseInt(monthBtn.dataset.month, 10));
        return;
      }

      // Year selection
      const yearBtn = target.closest('.datepicker-year') as HTMLElement;
      if (yearBtn && yearBtn.dataset.year !== undefined) {
        e.stopPropagation();
        this._selectYear(parseInt(yearBtn.dataset.year, 10));
        return;
      }

      // Period buttons (AM/PM)
      const periodBtn = target.closest('.datepicker-time-period-btn') as HTMLElement;
      if (periodBtn && periodBtn.dataset.period) {
        e.stopPropagation();
        this._period = periodBtn.dataset.period as 'AM' | 'PM';
        this._updateValue();
        this.update();
        return;
      }
    };

    // Change handler for time inputs
    this._delegatedChangeHandler = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.classList.contains('datepicker-time-input')) {
        const type = target.dataset.time;
        const value = parseInt(target.value, 10);

        if (type === 'hours') {
          this._hours = Math.max(1, Math.min(12, value || 12));
        } else if (type === 'minutes') {
          this._minutes = Math.max(0, Math.min(59, value || 0));
        }

        this._updateValue();
        this.update();
      }
    };

    this.shadowRoot?.addEventListener('click', this._delegatedClickHandler);
    this.shadowRoot?.addEventListener('change', this._delegatedChangeHandler);
  }

  private _removeEventDelegation() {
    if (this._delegatedClickHandler) {
      this.shadowRoot?.removeEventListener('click', this._delegatedClickHandler);
    }
    if (this._delegatedChangeHandler) {
      this.shadowRoot?.removeEventListener('change', this._delegatedChangeHandler);
    }
  }

  private _handleOutsideClick = (e: MouseEvent) => {
    if (!this.contains(e.target as Node)) {
      this._close();
    }
  };

  private _parseValue() {
    if (!this.value) return;

    if (this.range) {
      const [start, end] = this.value.split(' - ');
      if (start) this._rangeStart = new Date(start);
      if (end) this._rangeEnd = new Date(end);
      if (this._rangeStart) {
        this._viewDate = new Date(this._rangeStart);
      }
    } else {
      const date = new Date(this.value);
      if (!isNaN(date.getTime())) {
        this._selectedDate = date;
        this._viewDate = new Date(date);

        if (this.showTime) {
          this._hours = date.getHours() % 12 || 12;
          this._minutes = date.getMinutes();
          this._period = date.getHours() >= 12 ? 'PM' : 'AM';
        }
      }
    }
  }

  private _open() {
    if (this.disabled) return;
    this._isOpen = true;
    this._viewMode = 'days';
    this.emit('open');
    this.update();

    // Show popover and position it
    const dropdown = this.shadowRoot?.querySelector('.datepicker-dropdown') as HTMLElement;
    const trigger = this.shadowRoot?.querySelector('.datepicker-input') as HTMLElement;
    if (dropdown && trigger) {
      try {
        dropdown.showPopover();
        this._positionDropdown(dropdown, trigger);
      } catch {
        // Ignore if already shown
      }

      // Add scroll listener to reposition dropdown
      this._scrollHandler = () => {
        this._positionDropdown(dropdown, trigger);
      };
      window.addEventListener('scroll', this._scrollHandler, true);
      window.addEventListener('resize', this._scrollHandler);
    }
  }

  private _close() {
    if (!this._isOpen) return;
    this._isOpen = false;
    this.emit('close');

    // Remove scroll/resize listeners
    if (this._scrollHandler) {
      window.removeEventListener('scroll', this._scrollHandler, true);
      window.removeEventListener('resize', this._scrollHandler);
      this._scrollHandler = null;
    }

    // Hide popover
    const dropdown = this.shadowRoot?.querySelector('.datepicker-dropdown') as HTMLElement;
    if (dropdown) {
      try {
        dropdown.hidePopover();
      } catch {
        // Ignore if already hidden
      }
    }

    this.update();
  }

  private _toggle() {
    if (this._isOpen) {
      this._close();
    } else {
      this._open();
    }
  }

  private _positionDropdown(dropdown: HTMLElement, trigger: HTMLElement) {
    const triggerRect = trigger.getBoundingClientRect();
    const dropdownRect = dropdown.getBoundingClientRect();

    // Position below the trigger
    let top = triggerRect.bottom + 4;
    let left = triggerRect.left;

    // Check if dropdown would go off the bottom of the screen
    if (top + dropdownRect.height > window.innerHeight) {
      // Position above the trigger
      top = triggerRect.top - dropdownRect.height - 4;
    }

    // Check if dropdown would go off the right of the screen
    if (left + dropdownRect.width > window.innerWidth) {
      left = window.innerWidth - dropdownRect.width - 8;
    }

    // Ensure it doesn't go off the left
    if (left < 8) {
      left = 8;
    }

    dropdown.style.top = `${top}px`;
    dropdown.style.left = `${left}px`;
  }

  private _formatDate(date: Date | null): string {
    if (!date) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    let formatted = this.format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day);

    if (this.showTime) {
      const hours = String(this._hours).padStart(2, '0');
      const minutes = String(this._minutes).padStart(2, '0');
      formatted += ` ${hours}:${minutes} ${this._period}`;
    }

    return formatted;
  }

  private _getDisplayValue(): string {
    if (this.range) {
      if (this._rangeStart && this._rangeEnd) {
        return `${this._formatDate(this._rangeStart)} - ${this._formatDate(this._rangeEnd)}`;
      } else if (this._rangeStart) {
        return this._formatDate(this._rangeStart);
      }
      return '';
    }

    return this._formatDate(this._selectedDate);
  }

  private _prevMonth() {
    this._viewDate.setMonth(this._viewDate.getMonth() - 1);
    this.update();
  }

  private _nextMonth() {
    this._viewDate.setMonth(this._viewDate.getMonth() + 1);
    this.update();
  }

  private _prevYear() {
    this._viewDate.setFullYear(this._viewDate.getFullYear() - 1);
    this.update();
  }

  private _nextYear() {
    this._viewDate.setFullYear(this._viewDate.getFullYear() + 1);
    this.update();
  }

  private _setViewMode(mode: ViewMode) {
    this._viewMode = mode;
    this.update();
  }

  private _selectMonth(month: number) {
    this._viewDate.setMonth(month);
    this._viewMode = 'days';
    this.update();
  }

  private _selectYear(year: number) {
    this._viewDate.setFullYear(year);
    this._viewMode = 'months';
    this.update();
  }

  private _isDateDisabled(date: Date): boolean {
    if (this.minDate) {
      const min = new Date(this.minDate);
      if (date < min) return true;
    }
    if (this.maxDate) {
      const max = new Date(this.maxDate);
      if (date > max) return true;
    }
    return false;
  }

  private _isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  private _isSelected(date: Date): boolean {
    if (this.range) {
      if (this._rangeStart) {
        if (this._isSameDay(date, this._rangeStart)) return true;
      }
      if (this._rangeEnd) {
        if (this._isSameDay(date, this._rangeEnd)) return true;
      }
      return false;
    }

    return this._selectedDate ? this._isSameDay(date, this._selectedDate) : false;
  }

  private _isInRange(date: Date): boolean {
    if (!this.range || !this._rangeStart || !this._rangeEnd) return false;
    return date > this._rangeStart && date < this._rangeEnd;
  }

  private _isRangeStart(date: Date): boolean {
    return this._rangeStart ? this._isSameDay(date, this._rangeStart) : false;
  }

  private _isRangeEnd(date: Date): boolean {
    return this._rangeEnd ? this._isSameDay(date, this._rangeEnd) : false;
  }

  private _isSameDay(a: Date, b: Date): boolean {
    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    );
  }

  private _selectDate(date: Date) {
    if (this._isDateDisabled(date)) return;

    if (this.range) {
      if (!this._rangeStart || (this._rangeStart && this._rangeEnd)) {
        this._rangeStart = date;
        this._rangeEnd = null;
      } else {
        if (date < this._rangeStart) {
          this._rangeEnd = this._rangeStart;
          this._rangeStart = date;
        } else {
          this._rangeEnd = date;
        }

        this._updateValue();
        if (!this.showTime) {
          this._close();
        }
      }
    } else {
      this._selectedDate = date;
      this._updateValue();
      if (!this.showTime) {
        this._close();
      }
    }

    this.update();
  }

  private _updateValue() {
    if (this.range) {
      if (this._rangeStart && this._rangeEnd) {
        this.value = `${this._formatDate(this._rangeStart)} - ${this._formatDate(this._rangeEnd)}`;
      } else if (this._rangeStart) {
        this.value = this._formatDate(this._rangeStart);
      }
    } else if (this._selectedDate) {
      if (this.showTime) {
        const hours24 =
          this._period === 'PM'
            ? this._hours === 12
              ? 12
              : this._hours + 12
            : this._hours === 12
              ? 0
              : this._hours;
        this._selectedDate.setHours(hours24, this._minutes);
      }
      this.value = this._selectedDate.toISOString();
    }

    this.emit('change', {
      value: this.value,
      date: this._selectedDate,
      rangeStart: this._rangeStart,
      rangeEnd: this._rangeEnd,
    });
  }

  private _getCalendarDays(): Array<{ date: Date; isOtherMonth: boolean }> {
    const year = this._viewDate.getFullYear();
    const month = this._viewDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: Array<{ date: Date; isOtherMonth: boolean }> = [];

    // Previous month days
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isOtherMonth: true });
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({ date, isOtherMonth: false });
    }

    // Next month days (fill to complete 6 rows)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isOtherMonth: true });
    }

    return days;
  }

  private _renderDays(): string {
    const days = this._getCalendarDays();

    return `
      <div class="datepicker-weekdays">
        ${WEEKDAYS.map((d) => `<div class="datepicker-weekday">${d}</div>`).join('')}
      </div>
      <div class="datepicker-days">
        ${days
          .map(({ date, isOtherMonth }) => {
            const classes = [
              'datepicker-day',
              isOtherMonth ? 'datepicker-day-other-month' : '',
              this._isToday(date) ? 'datepicker-day-today' : '',
              this._isSelected(date) ? 'datepicker-day-selected' : '',
              this._isInRange(date) ? 'datepicker-day-in-range' : '',
              this._isRangeStart(date) ? 'datepicker-day-range-start' : '',
              this._isRangeEnd(date) ? 'datepicker-day-range-end' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return `
            <button
              type="button"
              class="${classes}"
              data-date="${date.toISOString()}"
              ${this._isDateDisabled(date) ? 'disabled' : ''}
            >
              ${date.getDate()}
            </button>
          `;
          })
          .join('')}
      </div>
    `;
  }

  private _renderMonths(): string {
    const currentMonth = this._viewDate.getMonth();

    return `
      <div class="datepicker-months">
        ${MONTHS.map(
          (name, i) => `
          <button
            type="button"
            class="datepicker-month ${i === currentMonth ? 'selected' : ''}"
            data-month="${i}"
          >
            ${name.slice(0, 3)}
          </button>
        `
        ).join('')}
      </div>
    `;
  }

  private _renderYears(): string {
    const currentYear = this._viewDate.getFullYear();
    const startYear = currentYear - 5;

    return `
      <div class="datepicker-years">
        ${Array.from(
          { length: 12 },
          (_, i) => `
          <button
            type="button"
            class="datepicker-year ${i + startYear === currentYear ? 'selected' : ''}"
            data-year="${i + startYear}"
          >
            ${i + startYear}
          </button>
        `
        ).join('')}
      </div>
    `;
  }

  private _renderTime(): string {
    if (!this.showTime) return '';

    return `
      <div class="datepicker-time">
        <input
          type="text"
          class="datepicker-time-input"
          value="${String(this._hours).padStart(2, '0')}"
          data-time="hours"
          maxlength="2"
        />
        <span class="datepicker-time-separator">:</span>
        <input
          type="text"
          class="datepicker-time-input"
          value="${String(this._minutes).padStart(2, '0')}"
          data-time="minutes"
          maxlength="2"
        />
        <div class="datepicker-time-period">
          <button
            type="button"
            class="datepicker-time-period-btn ${this._period === 'AM' ? 'active' : ''}"
            data-period="AM"
          >AM</button>
          <button
            type="button"
            class="datepicker-time-period-btn ${this._period === 'PM' ? 'active' : ''}"
            data-period="PM"
          >PM</button>
        </div>
      </div>
    `;
  }

  private _renderHeader(): string {
    const title =
      this._viewMode === 'days'
        ? `${MONTHS[this._viewDate.getMonth()]} ${this._viewDate.getFullYear()}`
        : this._viewMode === 'months'
          ? String(this._viewDate.getFullYear())
          : `${this._viewDate.getFullYear() - 5} - ${this._viewDate.getFullYear() + 6}`;

    return `
      <div class="datepicker-header">
        <div class="datepicker-nav">
          <button type="button" class="datepicker-nav-btn" data-nav="prev">&lt;</button>
        </div>
        <button type="button" class="datepicker-title" data-action="toggle-view">
          ${title}
        </button>
        <div class="datepicker-nav">
          <button type="button" class="datepicker-nav-btn" data-nav="next">&gt;</button>
        </div>
      </div>
    `;
  }

  render() {
    const sizeClass = this.size !== 'md' ? `datepicker-${this.size}` : '';
    const openClass = this._isOpen ? 'datepicker-open' : '';

    let calendarContent = '';
    switch (this._viewMode) {
      case 'days':
        calendarContent = this._renderDays();
        break;
      case 'months':
        calendarContent = this._renderMonths();
        break;
      case 'years':
        calendarContent = this._renderYears();
        break;
    }

    return `
      <div class="datepicker ${sizeClass} ${openClass}">
        <input
          type="text"
          class="datepicker-input"
          placeholder="${this.placeholder}"
          value="${this._getDisplayValue()}"
          ${this.disabled ? 'disabled' : ''}
          readonly
        />
        <div class="datepicker-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div class="datepicker-dropdown" popover="manual">
          ${this._renderHeader()}
          <div class="datepicker-calendar">
            ${calendarContent}
          </div>
          ${this._renderTime()}
        </div>
      </div>
    `;
  }

  protected update(): void {
    super.update();
    // Event delegation is set up once in connectedCallback

    // If dropdown is open, re-show the popover after DOM update
    if (this._isOpen) {
      const dropdown = this.shadowRoot?.querySelector('.datepicker-dropdown') as HTMLElement;
      const trigger = this.shadowRoot?.querySelector('.datepicker-input') as HTMLElement;
      if (dropdown && trigger) {
        try {
          dropdown.showPopover();
          this._positionDropdown(dropdown, trigger);
        } catch {
          // Ignore if already shown or other errors
        }
      }
    }
  }

  private _handlePrev = () => {
    if (this._viewMode === 'days') {
      this._prevMonth();
    } else if (this._viewMode === 'months') {
      this._prevYear();
    } else {
      this._viewDate.setFullYear(this._viewDate.getFullYear() - 12);
      this.update();
    }
  };

  private _handleNext = () => {
    if (this._viewMode === 'days') {
      this._nextMonth();
    } else if (this._viewMode === 'months') {
      this._nextYear();
    } else {
      this._viewDate.setFullYear(this._viewDate.getFullYear() + 12);
      this.update();
    }
  };

  private _handleToggleView = () => {
    if (this._viewMode === 'days') {
      this._setViewMode('months');
    } else if (this._viewMode === 'months') {
      this._setViewMode('years');
    } else {
      this._setViewMode('days');
    }
  };
}
