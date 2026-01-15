/**
 * @duskmoon-dev/el-select
 *
 * A unified select component supporting single, multi-select, and tree-select modes.
 */

import { BaseElement, css } from '@duskmoon-dev/el-core';
import type { Size, ValidationState } from '@duskmoon-dev/el-core';

// Icons with explicit dimensions for proper rendering
const chevronDownIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;
const chevronRightIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`;
const checkIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
const closeIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
const searchIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`;

/**
 * Option structure for flat select
 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

/**
 * Option structure for tree select
 */
export interface TreeSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  children?: TreeSelectOption[];
}

/**
 * Flattened tree node for rendering
 */
interface FlattenedTreeNode {
  option: TreeSelectOption;
  level: number;
  hasChildren: boolean;
  isExpanded: boolean;
}

/**
 * Event details
 */
export interface SelectChangeEventDetail {
  value: string;
  selectedOptions: SelectOption[] | TreeSelectOption[];
}

export interface SelectSearchEventDetail {
  searchValue: string;
}

export interface SelectExpandEventDetail {
  node: TreeSelectOption;
  expanded: boolean;
}

// Styles
const styles = css`
  :host {
    display: inline-block;
    width: 100%;
  }

  .select {
    position: relative;
    width: 100%;
  }

  /* Trigger Button */
  .select-trigger {
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

  .select-trigger:hover:not(:disabled) {
    border-color: var(--color-on-surface-variant);
  }

  .select-trigger:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px color-mix(in oklch, var(--color-primary) 15%, transparent);
  }

  .select-trigger:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    background-color: var(--color-surface-container);
  }

  /* Value Display */
  .select-value {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
  }

  .select-placeholder {
    color: var(--color-on-surface-variant);
    opacity: 0.7;
  }

  /* Tags Container */
  .select-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    flex: 1;
    min-width: 0;
  }

  .select-tag {
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

  .select-tag-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .select-tag-remove {
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

  .select-tag-remove svg {
    width: 10px;
    height: 10px;
    display: block;
  }

  .select-tag-remove:hover {
    opacity: 1;
    background-color: color-mix(in oklch, currentColor 15%, transparent);
  }

  .select-tag-overflow {
    padding: 0.125rem 0.5rem;
    background-color: var(--color-surface-container);
    color: var(--color-on-surface-variant);
  }

  /* Icons */
  .select-arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    color: var(--color-on-surface-variant);
    transition: transform 150ms ease;
  }

  .select-arrow svg {
    width: 16px;
    height: 16px;
    display: block;
  }

  .select.open .select-arrow {
    transform: rotate(180deg);
  }

  .select-clear {
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

  .select-clear svg {
    width: 14px;
    height: 14px;
    display: block;
  }

  .select-clear:hover {
    background-color: var(--color-surface-container-high);
  }

  /* Dropdown - uses Popover API (top-layer requires position: fixed) */
  .select-dropdown {
    position: fixed;
    margin: 0;
    padding: 0;
    border: 1px solid var(--color-outline-variant);
    border-radius: var(--radius-md, 0.5rem);
    background-color: var(--color-surface);
    box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
    max-height: 18rem;
    overflow: hidden;
    display: none;
    flex-direction: column;
    z-index: 1000;
  }

  .select-dropdown:popover-open {
    display: flex;
  }

  /* Search */
  .select-search {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-bottom: 1px solid var(--color-outline-variant);
  }

  .select-search-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    color: var(--color-on-surface-variant);
    flex-shrink: 0;
  }

  .select-search-icon svg {
    width: 14px;
    height: 14px;
    display: block;
  }

  .select-search-input {
    flex: 1;
    padding: 0.375rem 0.5rem;
    font-size: var(--font-size-sm, 0.875rem);
    color: var(--color-on-surface);
    background-color: var(--color-surface-container);
    border: none;
    border-radius: var(--radius-sm, 0.25rem);
    outline: none;
  }

  .select-search-input:focus {
    background-color: var(--color-surface-container-high);
  }

  .select-search-input::placeholder {
    color: var(--color-on-surface-variant);
    opacity: 0.7;
  }

  /* Options List */
  .select-options {
    flex: 1;
    overflow-y: auto;
    padding: 0.25rem;
  }

  /* Option */
  .select-option {
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

  .select-option:hover:not(.disabled) {
    background-color: var(--color-surface-container);
  }

  .select-option.selected {
    background-color: var(--color-primary-container, #e8def8);
    color: var(--color-on-primary-container, #1d1b20);
  }

  .select-option.selected:hover {
    background-color: color-mix(in oklch, var(--color-primary-container, #e8def8), black 5%);
  }

  .select-option.highlighted {
    background-color: var(--color-surface-container-high);
  }

  .select-option.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .select-option-checkbox {
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

  .select-option.selected .select-option-checkbox {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--color-on-primary, white);
  }

  .select-option-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .select-option-check {
    display: none;
    color: var(--color-primary);
    flex-shrink: 0;
  }

  .select-option.selected .select-option-check {
    display: flex;
  }

  /* Group Header */
  .select-group-header {
    padding: 0.5rem 0.75rem 0.25rem;
    font-size: var(--font-size-xs, 0.75rem);
    font-weight: 600;
    color: var(--color-on-surface-variant);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Tree Node */
  .select-tree-node {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    width: 100%;
    padding: 0.5rem 0.5rem;
    font-size: var(--font-size-sm, 0.875rem);
    color: var(--color-on-surface);
    background-color: transparent;
    border: none;
    border-radius: var(--radius-sm, 0.25rem);
    cursor: pointer;
    text-align: left;
    transition: background-color 150ms ease;
  }

  .select-tree-node:hover:not(.disabled) {
    background-color: var(--color-surface-container);
  }

  .select-tree-node.selected {
    background-color: var(--color-primary-container, #e8def8);
    color: var(--color-on-primary-container, #1d1b20);
  }

  .select-tree-node.highlighted {
    background-color: var(--color-surface-container-high);
  }

  .select-tree-node.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .select-tree-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    padding: 0;
    color: var(--color-on-surface-variant);
    background-color: transparent;
    border: none;
    border-radius: var(--radius-sm, 0.25rem);
    cursor: pointer;
    flex-shrink: 0;
    transition: transform 150ms ease;
  }

  .select-tree-toggle:hover {
    background-color: var(--color-surface-container-high);
  }

  .select-tree-toggle.expanded {
    transform: rotate(90deg);
  }

  .select-tree-toggle.hidden {
    visibility: hidden;
  }

  .select-tree-indent {
    flex-shrink: 0;
  }

  /* Empty State */
  .select-empty {
    padding: 1.5rem;
    text-align: center;
    color: var(--color-on-surface-variant);
    font-size: var(--font-size-sm, 0.875rem);
  }

  /* Size Variants */
  :host([size="sm"]) .select-trigger {
    min-height: 2.25rem;
    padding: 0.375rem 0.5rem;
    font-size: var(--font-size-sm, 0.875rem);
    border-radius: var(--radius-sm, 0.375rem);
  }

  :host([size="lg"]) .select-trigger {
    min-height: 3.25rem;
    padding: 0.625rem 1rem;
    font-size: var(--font-size-lg, 1.125rem);
    border-radius: var(--radius-lg, 0.625rem);
  }

  /* Validation States */
  :host([validation-state="invalid"]) .select-trigger {
    border-color: var(--color-error);
  }

  :host([validation-state="invalid"]) .select-trigger:focus {
    border-color: var(--color-error);
    box-shadow: 0 0 0 3px color-mix(in oklch, var(--color-error) 15%, transparent);
  }

  :host([validation-state="valid"]) .select-trigger {
    border-color: var(--color-success);
  }

  /* Disabled State */
  :host([disabled]) {
    pointer-events: none;
  }

  :host([disabled]) .select-trigger {
    cursor: not-allowed;
    opacity: 0.5;
    background-color: var(--color-surface-container);
  }
`;

/**
 * DuskMoon Select Element
 *
 * @element el-dm-select
 *
 * @attr {string} value - Selected value(s). JSON string for multiple/tree modes.
 * @attr {string} placeholder - Placeholder text when no selection.
 * @attr {boolean} disabled - Disable the select.
 * @attr {boolean} readonly - Make the select readonly.
 * @attr {boolean} multiple - Enable multi-select mode with tags.
 * @attr {boolean} tree-data - Enable tree-select mode.
 * @attr {boolean} searchable - Enable search/filter functionality.
 * @attr {boolean} clearable - Show clear button.
 * @attr {boolean} cascade - Enable cascade selection for tree mode.
 * @attr {boolean} check-strictly - Independent selection for tree mode.
 * @attr {boolean} default-expand-all - Expand all tree nodes by default.
 * @attr {number} max-tag-count - Max visible tags in multi-select mode.
 * @attr {string} size - Size variant: 'sm' | 'md' | 'lg'.
 * @attr {string} validation-state - Validation state: 'valid' | 'invalid'.
 *
 * @fires change - Fired when selection changes.
 * @fires search - Fired when search input changes.
 * @fires clear - Fired when clear button is clicked.
 * @fires expand - Fired when tree node is expanded/collapsed.
 */
export class ElDmSelect extends BaseElement {
  static properties = {
    value: { type: String, reflect: true, default: '' },
    placeholder: { type: String, default: 'Select...' },
    disabled: { type: Boolean, reflect: true, default: false },
    readonly: { type: Boolean, reflect: true, default: false },
    multiple: { type: Boolean, reflect: true, default: false },
    treeData: { type: Boolean, reflect: true, attribute: 'tree-data', default: false },
    searchable: { type: Boolean, reflect: true, default: false },
    clearable: { type: Boolean, reflect: true, default: false },
    cascade: { type: Boolean, reflect: true, default: false },
    checkStrictly: { type: Boolean, reflect: true, attribute: 'check-strictly', default: false },
    defaultExpandAll: { type: Boolean, reflect: true, attribute: 'default-expand-all', default: false },
    maxTagCount: { type: Number, attribute: 'max-tag-count', default: -1 },
    size: { type: String, reflect: true, default: 'md' },
    validationState: { type: String, reflect: true, attribute: 'validation-state' },
    options: { type: String, default: '' },
    treeOptions: { type: String, attribute: 'tree-options', default: '' },
  };

  // Declared properties
  declare value: string;
  declare placeholder: string;
  declare disabled: boolean;
  declare readonly: boolean;
  declare multiple: boolean;
  declare treeData: boolean;
  declare searchable: boolean;
  declare clearable: boolean;
  declare cascade: boolean;
  declare checkStrictly: boolean;
  declare defaultExpandAll: boolean;
  declare maxTagCount: number;
  declare size: Size;
  declare validationState: ValidationState;
  declare options: string;
  declare treeOptions: string;

  // Internal state
  private _isOpen = false;
  private _searchValue = '';
  private _highlightedIndex = -1;
  private _expandedKeys = new Set<string>();
  private _options: SelectOption[] = [];
  private _treeOptions: TreeSelectOption[] = [];

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

    // Parse options from attributes (for static HTML/MDX usage)
    this._parseOptionsFromAttributes();

    // Initialize expanded keys if defaultExpandAll
    if (this.defaultExpandAll && this.treeData) {
      this._expandAllNodes();
    }
  }

  /**
   * Parse options from JSON string attributes
   */
  private _parseOptionsFromAttributes(): void {
    // Parse flat options
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

    // Parse tree options
    if (this.treeOptions) {
      try {
        const parsed = JSON.parse(this.treeOptions);
        if (Array.isArray(parsed)) {
          this._treeOptions = parsed;
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
      const dropdown = this.shadowRoot?.querySelector('.select-dropdown') as HTMLElement;
      const trigger = this.shadowRoot?.querySelector('.select-trigger') as HTMLElement;
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
   * Set options for flat select mode
   */
  setOptions(options: SelectOption[]): void {
    this._options = options;
    this.update();
  }

  /**
   * Set options for tree select mode
   */
  setTreeOptions(options: TreeSelectOption[]): void {
    this._treeOptions = options;
    if (this.defaultExpandAll) {
      this._expandAllNodes();
    }
    this.update();
  }

  /**
   * Get selected values as array
   */
  private _getSelectedValues(): string[] {
    if (!this.value) return [];
    if (this.multiple || this.treeData) {
      try {
        const parsed = JSON.parse(this.value);
        return Array.isArray(parsed) ? parsed : [this.value];
      } catch {
        return this.value ? [this.value] : [];
      }
    }
    return this.value ? [this.value] : [];
  }

  /**
   * Get filtered options based on search
   */
  private _getFilteredOptions(): SelectOption[] {
    if (!this._searchValue) return this._options;
    const search = this._searchValue.toLowerCase();
    return this._options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(search) ||
        opt.value.toLowerCase().includes(search)
    );
  }

  /**
   * Flatten tree options for rendering
   */
  private _getFlattenedTreeOptions(): FlattenedTreeNode[] {
    const result: FlattenedTreeNode[] = [];
    const search = this._searchValue.toLowerCase();

    const flatten = (options: TreeSelectOption[], level: number): void => {
      for (const option of options) {
        const hasChildren = !!(option.children && option.children.length > 0);
        const isExpanded = this._expandedKeys.has(option.value);

        // Filter by search if searching
        if (search) {
          const matches = option.label.toLowerCase().includes(search);
          const hasMatchingChild = hasChildren && this._hasMatchingDescendant(option, search);
          if (!matches && !hasMatchingChild) continue;
        }

        result.push({ option, level, hasChildren, isExpanded });

        if (hasChildren && isExpanded) {
          flatten(option.children!, level + 1);
        }
      }
    };

    flatten(this._treeOptions, 0);
    return result;
  }

  /**
   * Check if a tree node has matching descendants
   */
  private _hasMatchingDescendant(option: TreeSelectOption, search: string): boolean {
    if (!option.children) return false;
    for (const child of option.children) {
      if (child.label.toLowerCase().includes(search)) return true;
      if (this._hasMatchingDescendant(child, search)) return true;
    }
    return false;
  }

  /**
   * Expand all tree nodes
   */
  private _expandAllNodes(): void {
    const expandAll = (options: TreeSelectOption[]): void => {
      for (const option of options) {
        if (option.children && option.children.length > 0) {
          this._expandedKeys.add(option.value);
          expandAll(option.children);
        }
      }
    };
    expandAll(this._treeOptions);
  }

  /**
   * Get all descendant values of a tree node
   */
  private _getDescendantValues(option: TreeSelectOption): string[] {
    const values: string[] = [];
    const collect = (opt: TreeSelectOption): void => {
      values.push(opt.value);
      if (opt.children) {
        opt.children.forEach(collect);
      }
    };
    collect(option);
    return values;
  }

  /**
   * Find option by value in flat options
   */
  private _findOption(value: string): SelectOption | undefined {
    return this._options.find((opt) => opt.value === value);
  }

  /**
   * Find option by value in tree options
   */
  private _findTreeOption(value: string, options = this._treeOptions): TreeSelectOption | undefined {
    for (const opt of options) {
      if (opt.value === value) return opt;
      if (opt.children) {
        const found = this._findTreeOption(value, opt.children);
        if (found) return found;
      }
    }
    return undefined;
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

    const options = this.treeData ? this._getFlattenedTreeOptions() : this._getFilteredOptions();
    const enabledOptions = this.treeData
      ? (options as FlattenedTreeNode[]).filter((n) => !n.option.disabled)
      : (options as SelectOption[]).filter((o) => !o.disabled);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this._highlightedIndex = Math.min(
          this._highlightedIndex + 1,
          enabledOptions.length - 1
        );
        this.update();
        break;

      case 'ArrowUp':
        e.preventDefault();
        this._highlightedIndex = Math.max(this._highlightedIndex - 1, 0);
        this.update();
        break;

      case 'Enter':
        e.preventDefault();
        if (this._highlightedIndex >= 0 && this._highlightedIndex < enabledOptions.length) {
          const option = this.treeData
            ? (enabledOptions[this._highlightedIndex] as FlattenedTreeNode).option
            : (enabledOptions[this._highlightedIndex] as SelectOption);
          this._selectOption(option.value);
        }
        break;

      case 'Escape':
        e.preventDefault();
        this._close();
        break;

      case 'Backspace':
        if (this.multiple && !this._searchValue) {
          e.preventDefault();
          const selected = this._getSelectedValues();
          if (selected.length > 0) {
            this._removeTag(selected[selected.length - 1]);
          }
        }
        break;
    }
  }

  private _open(): void {
    if (this.disabled || this.readonly) return;
    this._isOpen = true;
    this._highlightedIndex = -1;
    this.update();

    // Add scroll/resize listeners to keep dropdown positioned
    this._addScrollListeners();

    // Show popover and position it
    requestAnimationFrame(() => {
      const dropdown = this.shadowRoot?.querySelector('.select-dropdown') as HTMLElement;
      const trigger = this.shadowRoot?.querySelector('.select-trigger') as HTMLElement;
      if (dropdown && trigger) {
        // Set initial position before showing (based on trigger only)
        const triggerRect = trigger.getBoundingClientRect();
        dropdown.style.top = `${triggerRect.bottom + 4}px`;
        dropdown.style.left = `${triggerRect.left}px`;
        dropdown.style.width = `${triggerRect.width}px`;

        // Show the popover
        dropdown.showPopover();

        // Recalculate position after layout is complete
        requestAnimationFrame(() => {
          this._positionDropdown(dropdown, trigger);
        });
      }

      // Focus search input if searchable
      const searchInput = this.shadowRoot?.querySelector('.select-search-input') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    });
  }

  private _close(): void {
    this._isOpen = false;
    this._searchValue = '';
    this._highlightedIndex = -1;

    // Remove scroll/resize listeners
    this._removeScrollListeners();

    // Hide popover
    const dropdown = this.shadowRoot?.querySelector('.select-dropdown') as HTMLElement;
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
    const dropdownRect = dropdown.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Position below the trigger by default
    let top = triggerRect.bottom + 4;
    let left = triggerRect.left;

    // If not enough space below, position above
    if (top + dropdownRect.height > viewportHeight && triggerRect.top > dropdownRect.height) {
      top = triggerRect.top - dropdownRect.height - 4;
    }

    // Ensure dropdown doesn't go off-screen horizontally
    const viewportWidth = window.innerWidth;
    if (left + triggerRect.width > viewportWidth) {
      left = viewportWidth - triggerRect.width - 8;
    }

    dropdown.style.top = `${top}px`;
    dropdown.style.left = `${left}px`;
    dropdown.style.width = `${triggerRect.width}px`;
  }

  private _toggle(): void {
    if (this._isOpen) {
      this._close();
    } else {
      this._open();
    }
  }

  private _selectOption(value: string): void {
    const selectedValues = this._getSelectedValues();

    if (this.multiple) {
      // Toggle selection
      const index = selectedValues.indexOf(value);
      if (index >= 0) {
        selectedValues.splice(index, 1);
      } else {
        // Handle cascade for tree mode
        if (this.treeData && this.cascade && !this.checkStrictly) {
          const option = this._findTreeOption(value);
          if (option) {
            const descendants = this._getDescendantValues(option);
            for (const v of descendants) {
              if (!selectedValues.includes(v)) {
                selectedValues.push(v);
              }
            }
          }
        } else {
          selectedValues.push(value);
        }
      }
      this.value = JSON.stringify(selectedValues);
    } else {
      this.value = value;
      this._close();
    }

    this._emitChange();
    this.update();
  }

  private _removeTag(value: string): void {
    const selectedValues = this._getSelectedValues();
    const index = selectedValues.indexOf(value);
    if (index >= 0) {
      selectedValues.splice(index, 1);
      this.value = selectedValues.length > 0 ? JSON.stringify(selectedValues) : '';
      this._emitChange();
      this.update();
    }
  }

  private _toggleExpand(value: string, e: Event): void {
    e.stopPropagation();
    const option = this._findTreeOption(value);
    if (!option) return;

    const wasExpanded = this._expandedKeys.has(value);
    if (wasExpanded) {
      this._expandedKeys.delete(value);
    } else {
      this._expandedKeys.add(value);
    }

    this.emit<SelectExpandEventDetail>('expand', {
      node: option,
      expanded: !wasExpanded,
    });
    this.update();
  }

  private _handleSearch(e: Event): void {
    const input = e.target as HTMLInputElement;
    this._searchValue = input.value;
    this._highlightedIndex = -1;
    this.emit<SelectSearchEventDetail>('search', { searchValue: this._searchValue });
    this.update();
  }

  private _handleClear(e: Event): void {
    e.stopPropagation();
    const previousValue = this.value;
    this.value = '';
    this.emit('clear', { previousValue });
    this._emitChange();
    this.update();
  }

  private _emitChange(): void {
    const selectedValues = this._getSelectedValues();
    let selectedOptions: SelectOption[] | TreeSelectOption[];

    if (this.treeData) {
      selectedOptions = selectedValues
        .map((v) => this._findTreeOption(v))
        .filter((o): o is TreeSelectOption => o !== undefined);
    } else {
      selectedOptions = selectedValues
        .map((v) => this._findOption(v))
        .filter((o): o is SelectOption => o !== undefined);
    }

    this.emit<SelectChangeEventDetail>('change', {
      value: this.value,
      selectedOptions,
    });
  }

  // Rendering
  protected render(): string {
    return `
      <div class="select ${this._isOpen ? 'open' : ''}">
        ${this._renderTrigger()}
        ${this._renderDropdown()}
      </div>
    `;
  }

  private _renderTrigger(): string {
    const selectedValues = this._getSelectedValues();
    const hasValue = selectedValues.length > 0;
    const showClear = this.clearable && hasValue && !this.disabled && !this.readonly;

    return `
      <button
        type="button"
        class="select-trigger"
        aria-haspopup="listbox"
        aria-expanded="${this._isOpen}"
        ${this.disabled ? 'disabled' : ''}
        data-action="toggle"
      >
        ${this.multiple && hasValue ? this._renderTags() : this._renderValue()}
        ${showClear ? `<span class="select-clear" role="button" tabindex="-1" data-action="clear">${closeIcon}</span>` : ''}
        <span class="select-arrow">${chevronDownIcon}</span>
      </button>
    `;
  }

  private _renderValue(): string {
    const selectedValues = this._getSelectedValues();
    if (selectedValues.length === 0) {
      return `<span class="select-value select-placeholder">${this.placeholder}</span>`;
    }

    const value = selectedValues[0];
    let label = value;

    if (this.treeData) {
      const option = this._findTreeOption(value);
      if (option) label = option.label;
    } else {
      const option = this._findOption(value);
      if (option) label = option.label;
    }

    return `<span class="select-value">${this._escapeHtml(label)}</span>`;
  }

  private _renderTags(): string {
    const selectedValues = this._getSelectedValues();
    const maxCount = this.maxTagCount;
    const showAll = maxCount < 0;
    const visibleValues = showAll ? selectedValues : selectedValues.slice(0, maxCount);
    const overflowCount = showAll ? 0 : Math.max(0, selectedValues.length - maxCount);

    let tagsHtml = visibleValues
      .map((value) => {
        let label = value;
        if (this.treeData) {
          const option = this._findTreeOption(value);
          if (option) label = option.label;
        } else {
          const option = this._findOption(value);
          if (option) label = option.label;
        }

        return `
          <span class="select-tag">
            <span class="select-tag-text">${this._escapeHtml(label)}</span>
            <span class="select-tag-remove" role="button" tabindex="-1" data-action="remove-tag" data-value="${this._escapeHtml(value)}">${closeIcon}</span>
          </span>
        `;
      })
      .join('');

    if (overflowCount > 0) {
      tagsHtml += `<span class="select-tag select-tag-overflow">+${overflowCount}</span>`;
    }

    return `<div class="select-tags">${tagsHtml || `<span class="select-placeholder">${this.placeholder}</span>`}</div>`;
  }

  private _renderDropdown(): string {
    return `
      <div class="select-dropdown" role="listbox" popover="manual">
        ${this.searchable ? this._renderSearch() : ''}
        <div class="select-options">
          ${this.treeData ? this._renderTreeOptions() : this._renderFlatOptions()}
        </div>
      </div>
    `;
  }

  private _renderSearch(): string {
    return `
      <div class="select-search">
        <span class="select-search-icon">${searchIcon}</span>
        <input
          type="text"
          class="select-search-input"
          placeholder="Search..."
          value="${this._escapeHtml(this._searchValue)}"
          data-action="search"
        />
      </div>
    `;
  }

  private _renderFlatOptions(): string {
    const options = this._getFilteredOptions();
    if (options.length === 0) {
      return `<div class="select-empty">No options available</div>`;
    }

    const selectedValues = this._getSelectedValues();

    // Group options if they have groups
    const grouped = new Map<string, SelectOption[]>();
    const ungrouped: SelectOption[] = [];

    for (const opt of options) {
      if (opt.group) {
        const group = grouped.get(opt.group) || [];
        group.push(opt);
        grouped.set(opt.group, group);
      } else {
        ungrouped.push(opt);
      }
    }

    let html = '';
    let index = 0;

    // Render ungrouped first
    for (const opt of ungrouped) {
      html += this._renderOption(opt, selectedValues, index);
      index++;
    }

    // Render grouped
    for (const [groupName, groupOptions] of grouped) {
      html += `<div class="select-group-header">${this._escapeHtml(groupName)}</div>`;
      for (const opt of groupOptions) {
        html += this._renderOption(opt, selectedValues, index);
        index++;
      }
    }

    return html;
  }

  private _renderOption(option: SelectOption, selectedValues: string[], index: number): string {
    const isSelected = selectedValues.includes(option.value);
    const isHighlighted = index === this._highlightedIndex;
    const classes = [
      'select-option',
      isSelected ? 'selected' : '',
      isHighlighted ? 'highlighted' : '',
      option.disabled ? 'disabled' : '',
    ].filter(Boolean).join(' ');

    return `
      <button
        type="button"
        class="${classes}"
        role="option"
        aria-selected="${isSelected}"
        ${option.disabled ? 'aria-disabled="true"' : ''}
        data-action="select"
        data-value="${this._escapeHtml(option.value)}"
      >
        ${this.multiple ? `<span class="select-option-checkbox">${isSelected ? checkIcon : ''}</span>` : ''}
        <span class="select-option-label">${this._escapeHtml(option.label)}</span>
        ${!this.multiple ? `<span class="select-option-check">${checkIcon}</span>` : ''}
      </button>
    `;
  }

  private _renderTreeOptions(): string {
    const flatNodes = this._getFlattenedTreeOptions();
    if (flatNodes.length === 0) {
      return `<div class="select-empty">No options available</div>`;
    }

    const selectedValues = this._getSelectedValues();

    return flatNodes
      .map((node, index) => this._renderTreeNode(node, selectedValues, index))
      .join('');
  }

  private _renderTreeNode(node: FlattenedTreeNode, selectedValues: string[], index: number): string {
    const { option, level, hasChildren, isExpanded } = node;
    const isSelected = selectedValues.includes(option.value);
    const isHighlighted = index === this._highlightedIndex;
    const indentWidth = level * 1.25;

    const classes = [
      'select-tree-node',
      isSelected ? 'selected' : '',
      isHighlighted ? 'highlighted' : '',
      option.disabled ? 'disabled' : '',
    ].filter(Boolean).join(' ');

    const toggleClasses = [
      'select-tree-toggle',
      isExpanded ? 'expanded' : '',
      !hasChildren ? 'hidden' : '',
    ].filter(Boolean).join(' ');

    return `
      <button
        type="button"
        class="${classes}"
        role="treeitem"
        aria-selected="${isSelected}"
        aria-expanded="${hasChildren ? isExpanded : undefined}"
        ${option.disabled ? 'aria-disabled="true"' : ''}
        data-action="select-tree"
        data-value="${this._escapeHtml(option.value)}"
      >
        <span class="select-tree-indent" style="width: ${indentWidth}rem"></span>
        <span class="${toggleClasses}" data-action="toggle-expand" data-value="${this._escapeHtml(option.value)}">${chevronRightIcon}</span>
        ${this.multiple ? `<span class="select-option-checkbox">${isSelected ? checkIcon : ''}</span>` : ''}
        <span class="select-option-label">${this._escapeHtml(option.label)}</span>
        ${!this.multiple ? `<span class="select-option-check">${checkIcon}</span>` : ''}
      </button>
    `;
  }

  private _escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  protected update(): void {
    super.update();
    this._attachEventListeners();
  }

  private _attachEventListeners(): void {
    // Toggle trigger
    const trigger = this.shadowRoot?.querySelector('[data-action="toggle"]');
    trigger?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-action="clear"]') && !target.closest('[data-action="remove-tag"]')) {
        this._toggle();
      }
    });

    // Clear button
    const clearBtn = this.shadowRoot?.querySelector('[data-action="clear"]');
    clearBtn?.addEventListener('click', (e) => this._handleClear(e));

    // Search input
    const searchInput = this.shadowRoot?.querySelector('[data-action="search"]');
    searchInput?.addEventListener('input', (e) => this._handleSearch(e));

    // Flat options
    const options = this.shadowRoot?.querySelectorAll('[data-action="select"]');
    options?.forEach((opt) => {
      opt.addEventListener('click', () => {
        const value = opt.getAttribute('data-value');
        if (value) this._selectOption(value);
      });
    });

    // Tree options
    const treeNodes = this.shadowRoot?.querySelectorAll('[data-action="select-tree"]');
    treeNodes?.forEach((node) => {
      node.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-action="toggle-expand"]')) return;
        const value = node.getAttribute('data-value');
        if (value) this._selectOption(value);
      });
    });

    // Tree expand toggles
    const toggles = this.shadowRoot?.querySelectorAll('[data-action="toggle-expand"]');
    toggles?.forEach((toggle) => {
      toggle.addEventListener('click', (e) => {
        const value = toggle.getAttribute('data-value');
        if (value) this._toggleExpand(value, e);
      });
    });

    // Tag remove buttons
    const tagRemoves = this.shadowRoot?.querySelectorAll('[data-action="remove-tag"]');
    tagRemoves?.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const value = btn.getAttribute('data-value');
        if (value) this._removeTag(value);
      });
    });
  }
}

/**
 * Register the custom element
 */
export function register(): void {
  if (!customElements.get('el-dm-select')) {
    customElements.define('el-dm-select', ElDmSelect);
  }
}
