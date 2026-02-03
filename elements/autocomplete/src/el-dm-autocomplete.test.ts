import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmAutocomplete, register } from './index';

register();

describe('ElDmAutocomplete', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-autocomplete')).toBe(ElDmAutocomplete);
  });

  test('creates a shadow root with autocomplete', () => {
    const el = document.createElement('el-dm-autocomplete') as ElDmAutocomplete;
    container.appendChild(el);

    const autocomplete = el.shadowRoot?.querySelector('.autocomplete');
    expect(autocomplete).toBeDefined();
  });

  test('has combobox role on input', () => {
    const el = document.createElement('el-dm-autocomplete') as ElDmAutocomplete;
    container.appendChild(el);

    const combobox = el.shadowRoot?.querySelector('[role="combobox"]');
    expect(combobox).toBeDefined();
  });

  test('has listbox role on dropdown', () => {
    const el = document.createElement('el-dm-autocomplete') as ElDmAutocomplete;
    container.appendChild(el);

    const listbox = el.shadowRoot?.querySelector('[role="listbox"]');
    expect(listbox).toBeDefined();
  });

  test('reflects disabled attribute', () => {
    const el = document.createElement('el-dm-autocomplete') as ElDmAutocomplete;
    el.disabled = true;
    container.appendChild(el);

    expect(el.hasAttribute('disabled')).toBe(true);
  });

  test('reflects placeholder attribute', () => {
    const el = document.createElement('el-dm-autocomplete') as ElDmAutocomplete;
    el.placeholder = 'Search...';
    container.appendChild(el);

    expect(el.getAttribute('placeholder')).toBe('Search...');
  });

  test('reflects loading attribute', () => {
    const el = document.createElement('el-dm-autocomplete') as ElDmAutocomplete;
    el.loading = true;
    container.appendChild(el);

    expect(el.hasAttribute('loading')).toBe(true);
  });

  test('renders no results text when no options', () => {
    const el = document.createElement('el-dm-autocomplete') as ElDmAutocomplete;
    el.options = '[]';
    container.appendChild(el);

    const noResults = el.shadowRoot?.querySelector('.autocomplete-no-results');
    expect(noResults?.textContent).toContain('No results found');
  });

  test('renders options from JSON', () => {
    const el = document.createElement('el-dm-autocomplete') as ElDmAutocomplete;
    el.options = JSON.stringify([
      { value: 'a', label: 'Apple' },
      { value: 'b', label: 'Banana' },
    ]);
    container.appendChild(el);

    const options = el.shadowRoot?.querySelectorAll('.autocomplete-option');
    expect(options?.length).toBe(2);
  });

  test('applies size classes', () => {
    const el = document.createElement('el-dm-autocomplete') as ElDmAutocomplete;
    el.size = 'lg';
    container.appendChild(el);

    const autocomplete = el.shadowRoot?.querySelector('.autocomplete');
    expect(autocomplete?.classList.contains('autocomplete-lg')).toBe(true);
  });
});
