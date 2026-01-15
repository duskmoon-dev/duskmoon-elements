/**
 * @duskmoon-dev/el-cascader
 *
 * A multi-panel cascading selection component following Ant Design patterns.
 */

import { BaseElement, css } from '@duskmoon-dev/el-core';
import type { Size, ValidationState } from '@duskmoon-dev/el-core';

// Icons with explicit dimensions for proper rendering
const chevronDownIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;
const chevronRightIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`;
const checkIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
const closeIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
const searchIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`;
const loadingIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;

/**
 * Cascader option structure
 */
export interface CascaderOption {
  value: string;
  label: string;
  disabled?: boolean;
  children?: CascaderOption[];
  leaf?: boolean;
  loading?: boolean;
}

/**
 * Load data function type for async loading
 */
export type LoadDataFn = (option: CascaderOption) => Promise<CascaderOption[]>;

/**
 * Event details
 */
export interface CascaderChangeEventDetail {
  value: string;
  selectedOptions: CascaderOption[];
  path: string[];
}

export interface CascaderExpandEventDetail {
  option: CascaderOption;
  level: number;
}

export interface CascaderSearchEventDetail {
  searchValue: string;
}

/**
 * Search result with full path
 */
interface SearchResult {
  path: CascaderOption[];
  pathLabels: string[];
  pathValues: string[];
}

// Styles
const styles = css`
  :host {
    display: inline-block;
    width: 100%;
  }

  .cascader {
    position: relative;
    width: 100%;
  }

  /* Trigger Button */
  .cascader-trigger {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    min-height: 2.75rem;
    padding: 0.5rem 0.75rem;
    font-size: var(--font-size-md, 1rem);
    line-height: 1.5;
    color: var(--color-on-surface);
    background-color: var(--color-surface);
    border: 1px solid var(--color-outline);
    border-radius: var(--radius-md, 0.5rem);
    cursor: pointer;
    transition: border-color 150ms ease, box-shadow 150ms ease;
  }

  .cascader-trigger:hover:not(:disabled) {
    border-color: var(--color-on-surface-variant);
  }

  .cascader-trigger:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px color-mix(in oklch, var(--color-primary) 15%, transparent);
  }

  .cascader-trigger:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    background-color: var(--color-surface-container);
  }

  /* Value Display */
  .cascader-value {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
  }

  .cascader-placeholder {
    color: var(--color-on-surface-variant);
    opacity: 0.7;
  }

  /* Tags Container (for multiple mode) */
  .cascader-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    flex: 1;
    min-width: 0;
  }

  .cascader-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    max-width: 100%;
    padding: 0.125rem 0.25rem 0.125rem 0.5rem;
    font-size: var(--font-size-sm, 0.875rem);
    line-height: 1.25rem;
    background-color: var(--color-surface-container-high, #e8e8e8);
    color: var(--color-on-surface);
    border-radius: 1rem;
  }

  .cascader-tag-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cascader-tag-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    padding: 0;
    color: inherit;
    background-color: transparent;
    border-radius: 50%;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 150ms ease, background-color 150ms ease;
  }

  .cascader-tag-remove svg {
    width: 10px;
    height: 10px;
    display: block;
  }

  .cascader-tag-remove:hover {
    opacity: 1;
    background-color: color-mix(in oklch, currentColor 15%, transparent);
  }

  .cascader-tag-overflow {
    padding: 0.125rem 0.5rem;
    background-color: var(--color-surface-container);
    color: var(--color-on-surface-variant);
  }

  /* Icons */
  .cascader-arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    color: var(--color-on-surface-variant);
    transition: transform 150ms ease;
  }

  .cascader-arrow svg {
    width: 16px;
    height: 16px;
    display: block;
  }

  .cascader.open .cascader-arrow {
    transform: rotate(180deg);
  }

  .cascader-clear {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 0;
    color: var(--color-on-surface-variant);
    background-color: transparent;
    border-radius: 50%;
    cursor: pointer;
    flex-shrink: 0;
    transition: background-color 150ms ease;
  }

  .cascader-clear svg {
    width: 14px;
    height: 14px;
    display: block;
  }

  .cascader-clear:hover {
    background-color: var(--color-surface-container-high);
  }

  /* Dropdown - uses Popover API (top-layer requires position: fixed) */
  .cascader-dropdown {
    position: fixed;
    margin: 0;
    padding: 0;
    border: 1px solid var(--color-outline-variant);
    border-radius: var(--radius-md, 0.5rem);
    background-color: var(--color-surface);
    box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
    overflow: hidden;
    display: none;
    flex-direction: column;
    z-index: 1000;
  }

  .cascader-dropdown:popover-open {
    display: flex;
  }

  /* Search */
  .cascader-search {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-bottom: 1px solid var(--color-outline-variant);
  }

  .cascader-search-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    color: var(--color-on-surface-variant);
    flex-shrink: 0;
  }

  .cascader-search-icon svg {
    width: 14px;
    height: 14px;
    display: block;
  }

  .cascader-search-input {
    flex: 1;
    padding: 0.375rem 0.5rem;
    font-size: var(--font-size-sm, 0.875rem);
    color: var(--color-on-surface);
    background-color: var(--color-surface-container);
    border: none;
    border-radius: var(--radius-sm, 0.25rem);
    outline: none;
  }

  .cascader-search-input:focus {
    background-color: var(--color-surface-container-high);
  }

  .cascader-search-input::placeholder {
    color: var(--color-on-surface-variant);
    opacity: 0.7;
  }

  /* Panels Container */
  .cascader-panels {
    display: flex;
    max-height: 18rem;
  }

  /* Panel */
  .cascader-panel {
    display: flex;
    flex-direction: column;
    min-width: 10rem;
    max-width: 14rem;
    max-height: 18rem;
    overflow-y: auto;
    border-right: 1px solid var(--color-outline-variant);
  }

  .cascader-panel:last-child {
    border-right: none;
  }

  .cascader-panel-options {
    padding: 0.25rem;
  }

  /* Option */
  .cascader-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
    font-size: var(--font-size-sm, 0.875rem);
    color: var(--color-on-surface);
    background-color: transparent;
    border: none;
    border-radius: var(--radius-sm, 0.25rem);
    cursor: pointer;
    text-align: left;
    transition: background-color 150ms ease;
  }

  .cascader-option:hover:not(.disabled) {
    background-color: var(--color-surface-container);
  }

  .cascader-option.active {
    background-color: var(--color-surface-container-high);
  }

  .cascader-option.selected {
    background-color: var(--color-primary-container, #e8def8);
    color: var(--color-on-primary-container, #1d1b20);
  }

  .cascader-option.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cascader-option-checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    background-color: transparent;
    border: 2px solid var(--color-on-surface-variant);
    border-radius: 0.125rem;
    flex-shrink: 0;
  }

  .cascader-option.selected .cascader-option-checkbox {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--color-on-primary, white);
  }

  .cascader-option-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cascader-option-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-on-surface-variant);
    flex-shrink: 0;
  }

  .cascader-option-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .cascader-option-loading .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* Search Results */
  .cascader-search-results {
    padding: 0.25rem;
    max-height: 18rem;
    overflow-y: auto;
  }

  .cascader-search-result {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
    font-size: var(--font-size-sm, 0.875rem);
    color: var(--color-on-surface);
    background-color: transparent;
    border: none;
    border-radius: var(--radius-sm, 0.25rem);
    cursor: pointer;
    text-align: left;
    transition: background-color 150ms ease;
  }

  .cascader-search-result:hover {
    background-color: var(--color-surface-container);
  }

  .cascader-search-result.selected {
    background-color: var(--color-primary-container, #e8def8);
    color: var(--color-on-primary-container, #1d1b20);
  }

  .cascader-search-result-path {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cascader-search-result-separator {
    color: var(--color-on-surface-variant);
    margin: 0 0.25rem;
  }

  /* Empty State */
  .cascader-empty {
    padding: 1.5rem;
    text-align: center;
    color: var(--color-on-surface-variant);
    font-size: var(--font-size-sm, 0.875rem);
  }

  /* Size Variants */
  :host([size="sm"]) .cascader-trigger {
    min-height: 2.25rem;
    padding: 0.375rem 0.5rem;
    font-size: var(--font-size-sm, 0.875rem);
    border-radius: var(--radius-sm, 0.375rem);
  }

  :host([size="lg"]) .cascader-trigger {
    min-height: 3.25rem;
    padding: 0.625rem 1rem;
    font-size: var(--font-size-lg, 1.125rem);
    border-radius: var(--radius-lg, 0.625rem);
  }

  /* Validation States */
  :host([validation-state="invalid"]) .cascader-trigger {
    border-color: var(--color-error);
  }

  :host([validation-state="invalid"]) .cascader-trigger:focus {
    border-color: var(--color-error);
    box-shadow: 0 0 0 3px color-mix(in oklch, var(--color-error) 15%, transparent);
  }

  :host([validation-state="valid"]) .cascader-trigger {
    border-color: var(--color-success);
  }

  /* Disabled State */
  :host([disabled]) {
    pointer-events: none;
  }

  :host([disabled]) .cascader-trigger {
    cursor: not-allowed;
    opacity: 0.5;
    background-color: var(--color-surface-container);
  }
`;

/**
 * DuskMoon Cascader Element
 *
 * @element el-dm-cascader
 *
 * @attr {string} value - Selected path as JSON array: '["province", "city", "district"]'
 * @attr {string} placeholder - Placeholder text when no selection.
 * @attr {boolean} disabled - Disable the cascader.
 * @attr {boolean} multiple - Enable multi-path selection.
 * @attr {boolean} searchable - Enable search functionality.
 * @attr {boolean} clearable - Show clear button.
 * @attr {boolean} change-on-select - Emit change on each level (vs only leaf).
 * @attr {string} expand-trigger - Expand trigger: 'click' (default) | 'hover'.
 * @attr {string} separator - Display separator (default: ' / ').
 * @attr {boolean} show-all-levels - Show full path or just leaf label.
 * @attr {string} show-checked-strategy - For multiple: 'all' | 'parent' | 'child'.
 * @attr {string} size - Size variant: 'sm' | 'md' | 'lg'.
 * @attr {string} validation-state - Validation state: 'valid' | 'invalid'.
 *
 * @fires change - Fired when selection changes.
 * @fires expand - Fired when panel expanded.
 * @fires search - Fired when search input changes.
 */
export class ElDmCascader extends BaseElement {
  static properties = {
    value: { type: String, reflect: true, default: '' },
    placeholder: { type: String, default: 'Select...' },
    disabled: { type: Boolean, reflect: true, default: false },
    multiple: { type: Boolean, reflect: true, default: false },
    searchable: { type: Boolean, reflect: true, default: false },
    clearable: { type: Boolean, reflect: true, default: false },
    changeOnSelect: { type: Boolean, reflect: true, attribute: 'change-on-select', default: false },
    expandTrigger: { type: String, attribute: 'expand-trigger', default: 'click' },
    separator: { type: String, default: ' / ' },
    showAllLevels: { type: Boolean, reflect: true, attribute: 'show-all-levels', default: true },
    showCheckedStrategy: { type: String, attribute: 'show-checked-strategy', default: 'all' },
    size: { type: String, reflect: true, default: 'md' },
    validationState: { type: String, reflect: true, attribute: 'validation-state' },
    options: { type: String, default: '' },
  };

  // Declared properties
  declare value: string;
  declare placeholder: string;
  declare disabled: boolean;
  declare multiple: boolean;
  declare searchable: boolean;
  declare clearable: boolean;
  declare changeOnSelect: boolean;
  declare expandTrigger: 'click' | 'hover';
  declare separator: string;
  declare showAllLevels: boolean;
  declare showCheckedStrategy: 'all' | 'parent' | 'child';
  declare size: Size;
  declare validationState: ValidationState;
  declare options: string;

  // Internal state
  private _isOpen = false;
  private _searchValue = '';
  private _activePath: string[] = [];
  private _selectedPaths: string[][] = [];
  private _loadingKeys = new Set<string>();
  private _options: CascaderOption[] = [];
  private _loadDataFn: LoadDataFn | null = null;

  // Bound handlers
  private _handleOutsideClick = this._onOutsideClick.bind(this);
  private _handleKeyDown = this._onKeyDown.bind(this);
  private _handleScroll = this._onScroll.bind(this);
  private _handleResize = this._onResize.bind(this);

  constructor() {
    super();
    this.attachStyles(styles);
  }

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('click', this._handleOutsideClick);
    document.addEventListener('keydown', this._handleKeyDown);

    // Parse options from attribute (for static HTML/MDX usage)
    this._parseOptionsFromAttribute();

    this._parseValue();

    // Set up event delegation once
    this._setupEventDelegation();
  }

  /**
   * Parse options from JSON string attribute
   */
  private _parseOptionsFromAttribute(): void {
    if (this.options) {
      try {
        const parsed = JSON.parse(this.options);
        if (Array.isArray(parsed)) {
          this._options = parsed;
        }
      } catch {
        // Invalid JSON, ignore
      }
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('click', this._handleOutsideClick);
    document.removeEventListener('keydown', this._handleKeyDown);
    this._removeScrollListeners();
  }

  private _addScrollListeners(): void {
    window.addEventListener('scroll', this._handleScroll, true);
    window.addEventListener('resize', this._handleResize);
  }

  private _removeScrollListeners(): void {
    window.removeEventListener('scroll', this._handleScroll, true);
    window.removeEventListener('resize', this._handleResize);
  }

  private _onScroll(): void {
    if (this._isOpen) {
      const dropdown = this.shadowRoot?.querySelector('.cascader-dropdown') as HTMLElement;
      const trigger = this.shadowRoot?.querySelector('.cascader-trigger') as HTMLElement;
      if (dropdown && trigger) {
        this._positionDropdown(dropdown, trigger);
      }
    }
  }

  private _onResize(): void {
    if (this._isOpen) {
      this._close();
    }
  }

  /**
   * Set cascader options
   */
  setOptions(options: CascaderOption[]): void {
    this._options = options;
    this.update();
  }

  /**
   * Set async load data function
   */
  setLoadData(fn: LoadDataFn): void {
    this._loadDataFn = fn;
  }

  /**
   * Parse value into selected paths
   */
  private _parseValue(): void {
    if (!this.value) {
      this._selectedPaths = [];
      return;
    }

    try {
      const parsed = JSON.parse(this.value);
      if (this.multiple) {
        // Multiple mode: array of paths
        this._selectedPaths = Array.isArray(parsed[0]) ? parsed : [parsed];
      } else {
        // Single mode: single path
        this._selectedPaths = Array.isArray(parsed) ? [parsed] : [];
      }
    } catch {
      this._selectedPaths = [];
    }
  }

  /**
   * Get panels data based on active path
   */
  private _getPanels(): CascaderOption[][] {
    const panels: CascaderOption[][] = [this._options];

    let currentOptions = this._options;
    for (const value of this._activePath) {
      const option = currentOptions.find((o) => o.value === value);
      if (option?.children && option.children.length > 0) {
        panels.push(option.children);
        currentOptions = option.children;
      } else {
        break;
      }
    }

    return panels;
  }

  /**
   * Get display label for current selection
   */
  private _getDisplayLabel(): string {
    if (this._selectedPaths.length === 0) {
      return '';
    }

    const path = this._selectedPaths[0];
    const labels = this._getPathLabels(path);

    if (this.showAllLevels) {
      return labels.join(this.separator);
    }
    return labels[labels.length - 1] || '';
  }

  /**
   * Get labels for a path
   */
  private _getPathLabels(path: string[]): string[] {
    const labels: string[] = [];
    let currentOptions = this._options;

    for (const value of path) {
      const option = currentOptions.find((o) => o.value === value);
      if (option) {
        labels.push(option.label);
        currentOptions = option.children || [];
      }
    }

    return labels;
  }

  /**
   * Find option by path
   */
  private _findOptionByPath(path: string[]): CascaderOption | undefined {
    let currentOptions = this._options;
    let option: CascaderOption | undefined;

    for (const value of path) {
      option = currentOptions.find((o) => o.value === value);
      if (option?.children) {
        currentOptions = option.children;
      }
    }

    return option;
  }

  /**
   * Check if option is leaf (no children or marked as leaf)
   */
  private _isLeaf(option: CascaderOption): boolean {
    if (option.leaf === true) return true;
    if (option.leaf === false) return false;
    return !option.children || option.children.length === 0;
  }

  /**
   * Search options recursively
   */
  private _searchOptions(): SearchResult[] {
    const results: SearchResult[] = [];
    const search = this._searchValue.toLowerCase();

    const searchRecursive = (
      options: CascaderOption[],
      path: CascaderOption[],
      pathValues: string[]
    ): void => {
      for (const option of options) {
        const newPath = [...path, option];
        const newPathValues = [...pathValues, option.value];

        // Check if this option matches
        if (option.label.toLowerCase().includes(search)) {
          // Only add if it's a leaf or changeOnSelect is true
          if (this._isLeaf(option) || this.changeOnSelect) {
            results.push({
              path: newPath,
              pathLabels: newPath.map((o) => o.label),
              pathValues: newPathValues,
            });
          }
        }

        // Search children
        if (option.children) {
          searchRecursive(option.children, newPath, newPathValues);
        }
      }
    };

    searchRecursive(this._options, [], []);
    return results;
  }

  // Event handlers
  private _onOutsideClick(e: MouseEvent): void {
    if (!this.contains(e.target as Node)) {
      this._close();
    }
  }

  private _onKeyDown(e: KeyboardEvent): void {
    if (!this._isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        if (document.activeElement === this || this.contains(document.activeElement)) {
          e.preventDefault();
          this._open();
        }
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this._close();
        break;

      case 'ArrowLeft':
        e.preventDefault();
        if (this._activePath.length > 0) {
          this._activePath = this._activePath.slice(0, -1);
          this.update();
        }
        break;

      case 'ArrowRight':
        // Navigate into selected option if it has children
        break;
    }
  }

  private _open(): void {
    if (this.disabled) return;
    this._isOpen = true;
    this._activePath = this._selectedPaths[0] ? [...this._selectedPaths[0]] : [];
    this.update();

    // Add scroll/resize listeners to keep dropdown positioned
    this._addScrollListeners();

    // Show popover and position it
    requestAnimationFrame(() => {
      const dropdown = this.shadowRoot?.querySelector('.cascader-dropdown') as HTMLElement;
      const trigger = this.shadowRoot?.querySelector('.cascader-trigger') as HTMLElement;
      if (dropdown && trigger) {
        // Set initial position before showing (based on trigger only)
        const triggerRect = trigger.getBoundingClientRect();
        dropdown.style.top = `${triggerRect.bottom + 4}px`;
        dropdown.style.left = `${triggerRect.left}px`;
        dropdown.style.minWidth = `${triggerRect.width}px`;

        // Show the popover
        dropdown.showPopover();

        // Recalculate position after layout is complete
        requestAnimationFrame(() => {
          this._positionDropdown(dropdown, trigger);
        });
      }

      // Focus search input if searchable
      const searchInput = this.shadowRoot?.querySelector('.cascader-search-input') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    });
  }

  private _close(): void {
    this._isOpen = false;
    this._searchValue = '';
    this._activePath = [];

    // Remove scroll/resize listeners
    this._removeScrollListeners();

    // Hide popover
    const dropdown = this.shadowRoot?.querySelector('.cascader-dropdown') as HTMLElement;
    if (dropdown) {
      try {
        dropdown.hidePopover();
      } catch {
        // Ignore if already hidden
      }
    }

    this.update();
  }

  private _positionDropdown(dropdown: HTMLElement, trigger: HTMLElement): void {
    const triggerRect = trigger.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Position below the trigger by default
    let top = triggerRect.bottom + 4;
    let left = triggerRect.left;

    // Get dropdown dimensions after it's visible
    const dropdownRect = dropdown.getBoundingClientRect();

    // If not enough space below, position above
    if (top + dropdownRect.height > viewportHeight && triggerRect.top > dropdownRect.height) {
      top = triggerRect.top - dropdownRect.height - 4;
    }

    // Ensure dropdown doesn't go off-screen horizontally
    if (left + dropdownRect.width > viewportWidth) {
      left = viewportWidth - dropdownRect.width - 8;
    }
    if (left < 8) {
      left = 8;
    }

    dropdown.style.top = `${top}px`;
    dropdown.style.left = `${left}px`;
    // Cascader may be wider than trigger due to panels
    dropdown.style.minWidth = `${triggerRect.width}px`;
  }

  private _toggle(): void {
    if (this._isOpen) {
      this._close();
    } else {
      this._open();
    }
  }

  private async _handleOptionClick(value: string, level: number): Promise<void> {
    // Update active path
    this._activePath = this._activePath.slice(0, level);
    this._activePath.push(value);

    const option = this._findOptionByPath(this._activePath);
    if (!option) {
      return;
    }

    // Check if we need to load children
    if (this._loadDataFn && !option.children && !option.leaf) {
      this._loadingKeys.add(value);
      this.update();

      try {
        const children = await this._loadDataFn(option);
        option.children = children;
      } finally {
        this._loadingKeys.delete(value);
      }
    }

    // Emit expand event
    this.emit<CascaderExpandEventDetail>('expand', { option, level });

    // Handle selection
    const isLeaf = this._isLeaf(option);
    if (isLeaf || this.changeOnSelect) {
      this._selectPath([...this._activePath]);

      if (isLeaf && !this.multiple) {
        this._close();
      }
    }

    this.update();
  }

  private _handleOptionHover(value: string, level: number): void {
    if (this.expandTrigger !== 'hover') return;

    this._activePath = this._activePath.slice(0, level);
    this._activePath.push(value);
    this.update();

    // Trigger async load if needed
    const option = this._findOptionByPath(this._activePath);
    if (option && this._loadDataFn && !option.children && !option.leaf) {
      this._handleOptionClick(value, level);
    }
  }

  private _selectPath(path: string[]): void {
    if (this.multiple) {
      // Toggle path in selected paths
      const pathStr = JSON.stringify(path);
      const index = this._selectedPaths.findIndex(
        (p) => JSON.stringify(p) === pathStr
      );

      if (index >= 0) {
        this._selectedPaths.splice(index, 1);
      } else {
        this._selectedPaths.push(path);
      }

      this.value = JSON.stringify(this._selectedPaths);
    } else {
      this._selectedPaths = [path];
      this.value = JSON.stringify(path);
    }

    this._emitChange();
  }

  private _selectSearchResult(result: SearchResult): void {
    this._selectPath(result.pathValues);
    if (!this.multiple) {
      this._close();
    }
    this.update();
  }

  private _removeTag(pathIndex: number): void {
    this._selectedPaths.splice(pathIndex, 1);
    this.value = this._selectedPaths.length > 0 ? JSON.stringify(this._selectedPaths) : '';
    this._emitChange();
    this.update();
  }

  private _handleSearch(e: Event): void {
    const input = e.target as HTMLInputElement;
    this._searchValue = input.value;
    this.emit<CascaderSearchEventDetail>('search', { searchValue: this._searchValue });
    this.update();
  }

  private _handleClear(e: Event): void {
    e.stopPropagation();
    this.value = '';
    this._selectedPaths = [];
    this.emit('clear', {});
    this._emitChange();
    this.update();
  }

  private _emitChange(): void {
    const selectedOptions = this._selectedPaths.map((path) =>
      this._findOptionByPath(path)
    ).filter((o): o is CascaderOption => o !== undefined);

    this.emit<CascaderChangeEventDetail>('change', {
      value: this.value,
      selectedOptions,
      path: this._selectedPaths[0] || [],
    });
  }

  // Rendering
  protected render(): string {
    return `
      <div class="cascader ${this._isOpen ? 'open' : ''}">
        ${this._renderTrigger()}
        ${this._renderDropdown()}
      </div>
    `;
  }

  private _renderTrigger(): string {
    const hasValue = this._selectedPaths.length > 0;
    const showClear = this.clearable && hasValue && !this.disabled;

    return `
      <button
        type="button"
        class="cascader-trigger"
        aria-haspopup="listbox"
        aria-expanded="${this._isOpen}"
        ${this.disabled ? 'disabled' : ''}
        data-action="toggle"
      >
        ${this.multiple && hasValue ? this._renderTags() : this._renderValue()}
        ${showClear ? `<span class="cascader-clear" role="button" tabindex="-1" data-action="clear">${closeIcon}</span>` : ''}
        <span class="cascader-arrow">${chevronDownIcon}</span>
      </button>
    `;
  }

  private _renderValue(): string {
    const displayLabel = this._getDisplayLabel();
    if (!displayLabel) {
      return `<span class="cascader-value cascader-placeholder">${this.placeholder}</span>`;
    }
    return `<span class="cascader-value">${this._escapeHtml(displayLabel)}</span>`;
  }

  private _renderTags(): string {
    const tagsHtml = this._selectedPaths
      .map((path, index) => {
        const labels = this._getPathLabels(path);
        const displayLabel = this.showAllLevels
          ? labels.join(this.separator)
          : labels[labels.length - 1];

        return `
          <span class="cascader-tag">
            <span class="cascader-tag-text">${this._escapeHtml(displayLabel)}</span>
            <span class="cascader-tag-remove" role="button" tabindex="-1" data-action="remove-tag" data-index="${index}">${closeIcon}</span>
          </span>
        `;
      })
      .join('');

    return `<div class="cascader-tags">${tagsHtml || `<span class="cascader-placeholder">${this.placeholder}</span>`}</div>`;
  }

  private _renderDropdown(): string {
    const showSearch = this.searchable && this._searchValue;

    return `
      <div class="cascader-dropdown" role="listbox" popover="manual">
        ${this.searchable ? this._renderSearch() : ''}
        ${showSearch ? this._renderSearchResults() : this._renderPanels()}
      </div>
    `;
  }

  private _renderSearch(): string {
    return `
      <div class="cascader-search">
        <span class="cascader-search-icon">${searchIcon}</span>
        <input
          type="text"
          class="cascader-search-input"
          placeholder="Search..."
          value="${this._escapeHtml(this._searchValue)}"
          data-action="search"
        />
      </div>
    `;
  }

  private _renderPanels(): string {
    const panels = this._getPanels();

    if (panels.length === 0 || panels[0].length === 0) {
      return `<div class="cascader-empty">No options available</div>`;
    }

    return `
      <div class="cascader-panels">
        ${panels.map((options, level) => this._renderPanel(options, level)).join('')}
      </div>
    `;
  }

  private _renderPanel(options: CascaderOption[], level: number): string {
    const selectedValue = this._activePath[level];
    const selectedPathValues = this._selectedPaths.flatMap((p) => p);

    const optionsHtml = options
      .map((option) => {
        const isActive = option.value === selectedValue;
        const isSelected = this.multiple
          ? selectedPathValues.includes(option.value)
          : JSON.stringify(this._selectedPaths[0]) === JSON.stringify([...this._activePath.slice(0, level), option.value]);
        const isLoading = this._loadingKeys.has(option.value);
        const hasChildren = !this._isLeaf(option);

        const classes = [
          'cascader-option',
          isActive ? 'active' : '',
          isSelected ? 'selected' : '',
          option.disabled ? 'disabled' : '',
        ].filter(Boolean).join(' ');

        return `
          <button
            type="button"
            class="${classes}"
            data-action="option"
            data-value="${this._escapeHtml(option.value)}"
            data-level="${level}"
            ${option.disabled ? 'disabled' : ''}
          >
            ${this.multiple ? `<span class="cascader-option-checkbox">${isSelected ? checkIcon : ''}</span>` : ''}
            <span class="cascader-option-label">${this._escapeHtml(option.label)}</span>
            ${isLoading ? `<span class="cascader-option-loading">${loadingIcon}</span>` : ''}
            ${hasChildren && !isLoading ? `<span class="cascader-option-arrow">${chevronRightIcon}</span>` : ''}
          </button>
        `;
      })
      .join('');

    return `
      <div class="cascader-panel">
        <div class="cascader-panel-options">${optionsHtml}</div>
      </div>
    `;
  }

  private _renderSearchResults(): string {
    const results = this._searchOptions();

    if (results.length === 0) {
      return `<div class="cascader-empty">No results found</div>`;
    }

    const selectedPathStrs = this._selectedPaths.map((p) => JSON.stringify(p));

    const resultsHtml = results
      .map((result) => {
        const isSelected = selectedPathStrs.includes(JSON.stringify(result.pathValues));
        const classes = ['cascader-search-result', isSelected ? 'selected' : ''].filter(Boolean).join(' ');

        const pathHtml = result.pathLabels
          .map((label, i) => {
            const separator = i < result.pathLabels.length - 1
              ? `<span class="cascader-search-result-separator">${this.separator}</span>`
              : '';
            return `<span>${this._escapeHtml(label)}</span>${separator}`;
          })
          .join('');

        return `
          <button
            type="button"
            class="${classes}"
            data-action="search-result"
            data-path="${this._escapeHtml(JSON.stringify(result.pathValues))}"
          >
            ${this.multiple ? `<span class="cascader-option-checkbox">${isSelected ? checkIcon : ''}</span>` : ''}
            <span class="cascader-search-result-path">${pathHtml}</span>
          </button>
        `;
      })
      .join('');

    return `<div class="cascader-search-results">${resultsHtml}</div>`;
  }

  private _escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  protected update(): void {
    // Preserve search input focus state before DOM replacement
    const searchInput = this.shadowRoot?.querySelector('.cascader-search-input') as HTMLInputElement;
    const hadFocus = searchInput && this.shadowRoot?.activeElement === searchInput;
    const cursorPosition = hadFocus ? searchInput.selectionStart : null;

    super.update();
    // Event delegation is set up once in connectedCallback

    // If dropdown is open, re-show the popover after DOM update
    // (since update() replaces the DOM, the new dropdown element needs showPopover())
    if (this._isOpen) {
      const dropdown = this.shadowRoot?.querySelector('.cascader-dropdown') as HTMLElement;
      const trigger = this.shadowRoot?.querySelector('.cascader-trigger') as HTMLElement;
      if (dropdown && trigger) {
        try {
          dropdown.showPopover();
          this._positionDropdown(dropdown, trigger);
        } catch {
          // Ignore if already shown or other errors
        }
      }

      // Restore search input focus if it had focus before update
      if (hadFocus) {
        const newSearchInput = this.shadowRoot?.querySelector('.cascader-search-input') as HTMLInputElement;
        if (newSearchInput) {
          newSearchInput.focus();
          // Restore cursor position
          if (cursorPosition !== null) {
            newSearchInput.setSelectionRange(cursorPosition, cursorPosition);
          }
        }
      }
    }
  }

  /**
   * Set up event delegation once (called in connectedCallback)
   */
  private _setupEventDelegation(): void {
    // Use event delegation on shadow root for all interactive elements
    this.shadowRoot?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      // Toggle trigger
      const trigger = target.closest('[data-action="toggle"]');
      if (trigger && !target.closest('[data-action="clear"]') && !target.closest('[data-action="remove-tag"]')) {
        this._toggle();
        return;
      }

      // Clear button
      if (target.closest('[data-action="clear"]')) {
        this._handleClear(e);
        return;
      }

      // Tag remove button
      const removeTag = target.closest('[data-action="remove-tag"]');
      if (removeTag) {
        e.stopPropagation();
        const index = parseInt(removeTag.getAttribute('data-index') || '0', 10);
        this._removeTag(index);
        return;
      }

      // Panel option
      const option = target.closest('[data-action="option"]');
      if (option) {
        const value = option.getAttribute('data-value');
        const level = parseInt(option.getAttribute('data-level') || '0', 10);
        if (value) {
          this._handleOptionClick(value, level);
        }
        return;
      }

      // Search result
      const searchResult = target.closest('[data-action="search-result"]');
      if (searchResult) {
        const pathStr = searchResult.getAttribute('data-path');
        if (pathStr) {
          try {
            const pathValues = JSON.parse(pathStr) as string[];
            const result: SearchResult = {
              pathValues,
              path: [],
              pathLabels: this._getPathLabels(pathValues),
            };
            this._selectSearchResult(result);
          } catch {
            // Invalid path
          }
        }
        return;
      }
    });

    // Input event for search
    this.shadowRoot?.addEventListener('input', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches('[data-action="search"]')) {
        this._handleSearch(e);
      }
    });

    // Mouseenter for hover expand
    this.shadowRoot?.addEventListener('mouseenter', (e) => {
      if (this.expandTrigger !== 'hover') return;
      const target = e.target as HTMLElement;
      const option = target.closest('[data-action="option"]');
      if (option) {
        const value = option.getAttribute('data-value');
        const level = parseInt(option.getAttribute('data-level') || '0', 10);
        if (value) {
          this._handleOptionHover(value, level);
        }
      }
    }, true); // Use capture for mouseenter
  }
}

/**
 * Register the custom element
 */
export function register(): void {
  if (!customElements.get('el-dm-cascader')) {
    customElements.define('el-dm-cascader', ElDmCascader);
  }
}
