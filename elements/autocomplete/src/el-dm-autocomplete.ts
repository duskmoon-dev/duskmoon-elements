import { BaseElement, css as cssTag } from '@duskmoon-dev/el-core';
import { css } from '@duskmoon-dev/core/components/autocomplete';

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

  .autocomplete {
    width: 100%;
  }
`;

export type AutocompleteSize = 'sm' | 'md' | 'lg';

export interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  group?: string;
}

export class ElDmAutocomplete extends BaseElement {
  static properties = {
    value: { type: String, reflect: true, default: '' },
    options: { type: String, reflect: true, default: '[]' },
    multiple: { type: Boolean, reflect: true, default: false },
    disabled: { type: Boolean, reflect: true, default: false },
    clearable: { type: Boolean, reflect: true, default: false },
    placeholder: { type: String, reflect: true, default: '' },
    size: { type: String, reflect: true, default: 'md' },
    loading: { type: Boolean, reflect: true, default: false },
    noResultsText: { type: String, reflect: true, default: 'No results found' },
  };

  value!: string;
  options!: string;
  multiple!: boolean;
  disabled!: boolean;
  clearable!: boolean;
  placeholder!: string;
  size!: AutocompleteSize;
  loading!: boolean;
  noResultsText!: string;

  private _isOpen = false;
  private _searchValue = '';
  private _highlightedIndex = -1;
  private _selectedValues: string[] = [];

  constructor() {
    super();
    this.attachStyles(styles);
  }

  connectedCallback() {
    super.connectedCallback();
    this._parseValue();
    document.addEventListener('click', this._handleOutsideClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._handleOutsideClick);
  }

  private _handleOutsideClick = (e: MouseEvent) => {
    if (!this.contains(e.target as Node)) {
      this._close();
    }
  };

  private _parseValue() {
    if (this.multiple && this.value) {
      try {
        this._selectedValues = JSON.parse(this.value);
      } catch {
        this._selectedValues = this.value ? [this.value] : [];
      }
    } else {
      this._selectedValues = this.value ? [this.value] : [];
    }
  }

  private _getOptions(): AutocompleteOption[] {
    try {
      return JSON.parse(this.options);
    } catch {
      return [];
    }
  }

  private _getFilteredOptions(): AutocompleteOption[] {
    const allOptions = this._getOptions();
    if (!this._searchValue) return allOptions;

    const search = this._searchValue.toLowerCase();
    return allOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(search) ||
        opt.value.toLowerCase().includes(search) ||
        opt.description?.toLowerCase().includes(search)
    );
  }

  private _open() {
    if (this.disabled) return;
    this._isOpen = true;
    this._highlightedIndex = -1;
    this.update();
  }

  private _close() {
    this._isOpen = false;
    this._searchValue = '';
    this._highlightedIndex = -1;
    this.update();
  }

  private _toggle() {
    if (this._isOpen) {
      this._close();
    } else {
      this._open();
    }
  }

  private _handleInputChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this._searchValue = input.value;
    this._highlightedIndex = -1;

    if (!this._isOpen) {
      this._open();
    } else {
      this.update();
    }

    this.emit('input', { searchValue: this._searchValue });
  }

  private _handleKeyDown(e: KeyboardEvent) {
    const filteredOptions = this._getFilteredOptions().filter(
      (opt) => !opt.disabled
    );

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!this._isOpen) {
          this._open();
        } else {
          this._highlightedIndex = Math.min(
            this._highlightedIndex + 1,
            filteredOptions.length - 1
          );
          this.update();
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (this._isOpen) {
          this._highlightedIndex = Math.max(this._highlightedIndex - 1, 0);
          this.update();
        }
        break;

      case 'Enter':
        e.preventDefault();
        if (
          this._isOpen &&
          this._highlightedIndex >= 0 &&
          this._highlightedIndex < filteredOptions.length
        ) {
          this._selectOption(filteredOptions[this._highlightedIndex]);
        } else if (!this._isOpen) {
          this._open();
        }
        break;

      case 'Escape':
        e.preventDefault();
        this._close();
        break;

      case 'Backspace':
        if (
          this.multiple &&
          !this._searchValue &&
          this._selectedValues.length > 0
        ) {
          const lastValue = this._selectedValues[this._selectedValues.length - 1];
          this._removeValue(lastValue);
        }
        break;
    }
  }

  private _selectOption(option: AutocompleteOption) {
    if (option.disabled) return;

    if (this.multiple) {
      const index = this._selectedValues.indexOf(option.value);
      if (index === -1) {
        this._selectedValues = [...this._selectedValues, option.value];
      } else {
        this._selectedValues = this._selectedValues.filter(
          (v) => v !== option.value
        );
      }
      this.value = JSON.stringify(this._selectedValues);
      this._searchValue = '';
    } else {
      this._selectedValues = [option.value];
      this.value = option.value;
      this._close();
    }

    this.emit('change', {
      value: this.value,
      selectedValues: this._selectedValues,
      option,
    });

    this.update();
  }

  private _removeValue(val: string) {
    this._selectedValues = this._selectedValues.filter((v) => v !== val);
    this.value = this.multiple
      ? JSON.stringify(this._selectedValues)
      : this._selectedValues[0] || '';

    this.emit('change', {
      value: this.value,
      selectedValues: this._selectedValues,
    });

    this.update();
  }

  private _clear() {
    this._selectedValues = [];
    this._searchValue = '';
    this.value = this.multiple ? '[]' : '';

    this.emit('clear', { value: this.value });
    this.emit('change', {
      value: this.value,
      selectedValues: this._selectedValues,
    });

    this.update();
  }

  private _getDisplayValue(): string {
    if (this._selectedValues.length === 0) return '';

    const allOptions = this._getOptions();
    if (this.multiple) {
      return '';
    }

    const selectedOption = allOptions.find(
      (opt) => opt.value === this._selectedValues[0]
    );
    return selectedOption?.label || this._selectedValues[0];
  }

  private _highlightMatch(text: string): string {
    if (!this._searchValue) return text;

    const search = this._searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${search})`, 'gi');
    return text.replace(
      regex,
      '<span class="autocomplete-highlight">$1</span>'
    );
  }

  private _renderTags(): string {
    const allOptions = this._getOptions();
    return this._selectedValues
      .map((val) => {
        const option = allOptions.find((opt) => opt.value === val);
        const label = option?.label || val;
        return `
        <span class="autocomplete-tag">
          <span>${label}</span>
          <button
            type="button"
            class="autocomplete-tag-remove"
            data-value="${val}"
            ${this.disabled ? 'disabled' : ''}
          >&times;</button>
        </span>
      `;
      })
      .join('');
  }

  private _renderOptions(): string {
    const filteredOptions = this._getFilteredOptions();

    if (this.loading) {
      return `
        <div class="autocomplete-loading">
          <span>Loading...</span>
        </div>
      `;
    }

    if (filteredOptions.length === 0) {
      return `
        <div class="autocomplete-no-results">${this.noResultsText}</div>
      `;
    }

    // Group options if they have groups
    const groups = new Map<string, AutocompleteOption[]>();
    const ungrouped: AutocompleteOption[] = [];

    for (const opt of filteredOptions) {
      if (opt.group) {
        const group = groups.get(opt.group) || [];
        group.push(opt);
        groups.set(opt.group, group);
      } else {
        ungrouped.push(opt);
      }
    }

    let html = '';
    let globalIndex = 0;

    // Render grouped options
    for (const [groupName, options] of groups) {
      html += `<div class="autocomplete-group-header">${groupName}</div>`;
      for (const opt of options) {
        html += this._renderOption(opt, globalIndex++);
      }
    }

    // Render ungrouped options
    for (const opt of ungrouped) {
      html += this._renderOption(opt, globalIndex++);
    }

    return html;
  }

  private _renderOption(opt: AutocompleteOption, index: number): string {
    const isSelected = this._selectedValues.includes(opt.value);
    const isHighlighted = index === this._highlightedIndex;

    const classes = [
      'autocomplete-option',
      isSelected ? 'selected' : '',
      isHighlighted ? 'highlighted' : '',
      opt.disabled ? 'disabled' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return `
      <div
        class="${classes}"
        data-value="${opt.value}"
        data-index="${index}"
        role="option"
        aria-selected="${isSelected}"
        ${opt.disabled ? 'aria-disabled="true"' : ''}
      >
        ${
          this.multiple
            ? `
          <span class="autocomplete-option-icon">
            ${isSelected ? '✓' : ''}
          </span>
        `
            : ''
        }
        <div class="autocomplete-option-content">
          <div class="autocomplete-option-label">${this._highlightMatch(opt.label)}</div>
          ${opt.description ? `<div class="autocomplete-option-description">${this._highlightMatch(opt.description)}</div>` : ''}
        </div>
      </div>
    `;
  }

  render() {
    const sizeClass =
      this.size !== 'md' ? `autocomplete-${this.size}` : '';
    const openClass = this._isOpen ? 'autocomplete-open' : '';
    const clearableClass = this.clearable ? 'autocomplete-clearable' : '';
    const showClear =
      this.clearable && this._selectedValues.length > 0 && !this.disabled;

    if (this.multiple) {
      return `
        <div class="autocomplete ${sizeClass} ${openClass} ${clearableClass}">
          <div class="autocomplete-tags">
            ${this._renderTags()}
            <input
              type="text"
              class="autocomplete-tags-input"
              placeholder="${this._selectedValues.length === 0 ? this.placeholder : ''}"
              value="${this._searchValue}"
              ${this.disabled ? 'disabled' : ''}
              role="combobox"
              aria-expanded="${this._isOpen}"
              aria-haspopup="listbox"
              autocomplete="off"
            />
          </div>
          ${
            showClear
              ? `
            <button type="button" class="autocomplete-clear" aria-label="Clear selection">&times;</button>
          `
              : ''
          }
          <div class="autocomplete-dropdown" role="listbox">
            ${this._renderOptions()}
          </div>
        </div>
      `;
    }

    return `
      <div class="autocomplete ${sizeClass} ${openClass} ${clearableClass}">
        <input
          type="text"
          class="autocomplete-input"
          placeholder="${this.placeholder}"
          value="${this._isOpen ? this._searchValue : this._getDisplayValue()}"
          ${this.disabled ? 'disabled' : ''}
          role="combobox"
          aria-expanded="${this._isOpen}"
          aria-haspopup="listbox"
          autocomplete="off"
        />
        ${
          showClear
            ? `
          <button type="button" class="autocomplete-clear" aria-label="Clear selection">&times;</button>
        `
            : ''
        }
        <div class="autocomplete-dropdown" role="listbox">
          ${this._renderOptions()}
        </div>
      </div>
    `;
  }

  update() {
    super.update();
    this._attachEventListeners();
  }

  private _attachEventListeners() {
    const input = this.shadowRoot?.querySelector(
      '.autocomplete-input, .autocomplete-tags-input'
    ) as HTMLInputElement;

    if (input) {
      input.removeEventListener('input', this._handleInputChange.bind(this));
      input.removeEventListener('keydown', this._handleKeyDown.bind(this));
      input.removeEventListener('focus', this._open.bind(this));

      input.addEventListener('input', this._handleInputChange.bind(this));
      input.addEventListener('keydown', this._handleKeyDown.bind(this));
      input.addEventListener('focus', this._open.bind(this));
    }

    const clearBtn = this.shadowRoot?.querySelector('.autocomplete-clear');
    if (clearBtn) {
      clearBtn.removeEventListener('click', this._clear.bind(this));
      clearBtn.addEventListener('click', this._clear.bind(this));
    }

    // Option click handlers
    const options = this.shadowRoot?.querySelectorAll('.autocomplete-option');
    options?.forEach((opt) => {
      opt.removeEventListener('click', this._handleOptionClick);
      opt.addEventListener('click', this._handleOptionClick);
    });

    // Tag remove handlers
    const tagRemoves = this.shadowRoot?.querySelectorAll(
      '.autocomplete-tag-remove'
    );
    tagRemoves?.forEach((btn) => {
      btn.removeEventListener('click', this._handleTagRemove);
      btn.addEventListener('click', this._handleTagRemove);
    });
  }

  private _handleOptionClick = (e: Event) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    const value = target.dataset.value;

    if (value) {
      const allOptions = this._getOptions();
      const option = allOptions.find((opt) => opt.value === value);
      if (option) {
        this._selectOption(option);
      }
    }
  };

  private _handleTagRemove = (e: Event) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    const value = target.dataset.value;

    if (value) {
      this._removeValue(value);
    }
  };
}
