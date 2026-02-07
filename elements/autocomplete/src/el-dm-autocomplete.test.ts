import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmAutocomplete, register } from './index';
import type { AutocompleteOption } from './index';

register();

const sampleOptions: AutocompleteOption[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular', disabled: true },
  { value: 'svelte', label: 'Svelte', description: 'Compiler-based' },
];

function createAutocomplete(props: Partial<ElDmAutocomplete> = {}): ElDmAutocomplete {
  const el = document.createElement('el-dm-autocomplete') as ElDmAutocomplete;
  Object.assign(el, props);
  return el;
}

describe('ElDmAutocomplete', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  // --- Registration ---
  test('is defined', () => {
    expect(customElements.get('el-dm-autocomplete')).toBe(ElDmAutocomplete);
  });

  // --- Rendering ---
  test('creates a shadow root with autocomplete', () => {
    const el = createAutocomplete();
    container.appendChild(el);
    const autocomplete = el.shadowRoot?.querySelector('.autocomplete');
    expect(autocomplete).toBeDefined();
  });

  test('has input element', () => {
    const el = createAutocomplete();
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input).toBeDefined();
  });

  test('has dropdown element', () => {
    const el = createAutocomplete();
    container.appendChild(el);
    const dropdown = el.shadowRoot?.querySelector('.autocomplete-dropdown');
    expect(dropdown).toBeDefined();
  });

  test('has autocomplete wrapper', () => {
    const el = createAutocomplete();
    container.appendChild(el);
    const wrapper = el.shadowRoot?.querySelector('.autocomplete-wrapper');
    expect(wrapper).toBeDefined();
  });

  // --- Properties ---
  test('reflects value attribute', () => {
    const el = createAutocomplete({ value: 'react' });
    container.appendChild(el);
    expect(el.getAttribute('value')).toBe('react');
  });

  test('reflects disabled attribute', () => {
    const el = createAutocomplete({ disabled: true });
    container.appendChild(el);
    expect(el.hasAttribute('disabled')).toBe(true);
  });

  test('reflects multiple attribute', () => {
    const el = createAutocomplete({ multiple: true });
    container.appendChild(el);
    expect(el.hasAttribute('multiple')).toBe(true);
  });

  test('reflects clearable attribute', () => {
    const el = createAutocomplete({ clearable: true });
    container.appendChild(el);
    expect(el.hasAttribute('clearable')).toBe(true);
  });

  test('reflects placeholder attribute', () => {
    const el = createAutocomplete({ placeholder: 'Type to search' });
    container.appendChild(el);
    expect(el.getAttribute('placeholder')).toBe('Type to search');
  });

  test('reflects size attribute', () => {
    const el = createAutocomplete({ size: 'lg' } as Partial<ElDmAutocomplete>);
    container.appendChild(el);
    expect(el.getAttribute('size')).toBe('lg');
  });

  test('reflects loading attribute', () => {
    const el = createAutocomplete({ loading: true });
    container.appendChild(el);
    expect(el.hasAttribute('loading')).toBe(true);
  });

  test('reflects noResultsText attribute', () => {
    const el = createAutocomplete({ noResultsText: 'Nothing found' });
    container.appendChild(el);
    expect(el.getAttribute('no-results-text')).toBe('Nothing found');
  });

  test('reflects options attribute', () => {
    const el = createAutocomplete({ options: JSON.stringify(sampleOptions) });
    container.appendChild(el);
    expect(el.getAttribute('options')).toBe(JSON.stringify(sampleOptions));
  });

  // --- Input ---
  test('input gets placeholder', () => {
    const el = createAutocomplete({ placeholder: 'Search...' });
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('placeholder')).toBe('Search...');
  });

  test('input is disabled when component is disabled', () => {
    const el = createAutocomplete({ disabled: true });
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.hasAttribute('disabled')).toBe(true);
  });

  // --- Accessibility ---
  test('has combobox role', () => {
    const el = createAutocomplete();
    container.appendChild(el);
    const combobox = el.shadowRoot?.querySelector('[role="combobox"]');
    expect(combobox).toBeDefined();
  });

  test('has listbox role on dropdown', () => {
    const el = createAutocomplete();
    container.appendChild(el);
    const listbox = el.shadowRoot?.querySelector('[role="listbox"]');
    expect(listbox).toBeDefined();
  });

  test('has aria-expanded', () => {
    const el = createAutocomplete();
    container.appendChild(el);
    const trigger = el.shadowRoot?.querySelector('[aria-expanded]');
    expect(trigger).toBeDefined();
  });

  test('input has autocomplete off', () => {
    const el = createAutocomplete();
    container.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('autocomplete')).toBe('off');
  });

  // --- Options rendering ---
  test('renders options from JSON', () => {
    const el = createAutocomplete({ options: JSON.stringify(sampleOptions) });
    container.appendChild(el);
    const opts = el.shadowRoot?.querySelectorAll('.autocomplete-option');
    expect(opts?.length).toBeGreaterThanOrEqual(3);
  });

  test('renders no results text when no options', () => {
    const el = createAutocomplete({ options: '[]' });
    container.appendChild(el);
    const noResults = el.shadowRoot?.querySelector('.autocomplete-no-results');
    expect(noResults?.textContent).toContain('No results found');
  });

  test('renders disabled options', () => {
    const el = createAutocomplete({ options: JSON.stringify(sampleOptions) });
    container.appendChild(el);
    const disabledOpt = el.shadowRoot?.querySelector('.autocomplete-option.disabled');
    expect(disabledOpt).toBeDefined();
  });

  // --- Loading state ---
  test('shows loading indicator when loading', () => {
    const el = createAutocomplete({ loading: true });
    container.appendChild(el);
    const indicator = el.shadowRoot?.querySelector('.autocomplete-loading');
    expect(indicator).toBeDefined();
  });

  // --- Size classes ---
  test('applies sm size class', () => {
    const el = createAutocomplete({ size: 'sm' } as Partial<ElDmAutocomplete>);
    container.appendChild(el);
    const autocomplete = el.shadowRoot?.querySelector('.autocomplete');
    expect(autocomplete?.classList.contains('autocomplete-sm')).toBe(true);
  });

  test('applies lg size class', () => {
    const el = createAutocomplete({ size: 'lg' } as Partial<ElDmAutocomplete>);
    container.appendChild(el);
    const autocomplete = el.shadowRoot?.querySelector('.autocomplete');
    expect(autocomplete?.classList.contains('autocomplete-lg')).toBe(true);
  });

  // --- Disabled state ---
  test('host reflects disabled attribute', () => {
    const el = createAutocomplete({ disabled: true });
    container.appendChild(el);
    expect(el.hasAttribute('disabled')).toBe(true);
  });
});
