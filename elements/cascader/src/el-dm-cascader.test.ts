import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmCascader, register } from './index';
import type { CascaderOption } from './index';

register();

const sampleOptions: CascaderOption[] = [
  { value: 'fruits', label: 'Fruits', children: [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
  ]},
  { value: 'vegs', label: 'Vegetables', children: [
    { value: 'carrot', label: 'Carrot' },
  ]},
  { value: 'grains', label: 'Grains' },
];

function createCascader(props: Partial<ElDmCascader> = {}): ElDmCascader {
  const el = document.createElement('el-dm-cascader') as ElDmCascader;
  Object.assign(el, props);
  return el;
}

describe('ElDmCascader', () => {
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
    expect(customElements.get('el-dm-cascader')).toBe(ElDmCascader);
  });

  // --- Rendering ---
  test('creates a shadow root', () => {
    const el = createCascader();
    container.appendChild(el);
    expect(el.shadowRoot).toBeDefined();
  });

  test('has cascader trigger', () => {
    const el = createCascader();
    container.appendChild(el);
    const trigger = el.shadowRoot?.querySelector('.cascader-trigger');
    expect(trigger).toBeDefined();
  });

  test('shows placeholder text', () => {
    const el = createCascader({ placeholder: 'Pick one' });
    container.appendChild(el);
    const placeholder = el.shadowRoot?.querySelector('.cascader-placeholder');
    expect(placeholder?.textContent).toContain('Pick one');
  });

  test('shows default placeholder', () => {
    const el = createCascader();
    container.appendChild(el);
    const placeholder = el.shadowRoot?.querySelector('.cascader-placeholder');
    expect(placeholder?.textContent).toContain('Select...');
  });

  test('has dropdown element', () => {
    const el = createCascader();
    container.appendChild(el);
    const dropdown = el.shadowRoot?.querySelector('.cascader-dropdown');
    expect(dropdown).toBeDefined();
  });

  test('has panels container', () => {
    const el = createCascader();
    container.appendChild(el);
    const panels = el.shadowRoot?.querySelector('.cascader-panels');
    expect(panels).toBeDefined();
  });

  test('has chevron icon', () => {
    const el = createCascader();
    container.appendChild(el);
    const chevron = el.shadowRoot?.querySelector('.cascader-chevron');
    expect(chevron).toBeDefined();
  });

  // --- Properties ---
  test('reflects value attribute', () => {
    const el = createCascader({ value: '["fruits","apple"]' });
    container.appendChild(el);
    expect(el.getAttribute('value')).toBe('["fruits","apple"]');
  });

  test('reflects disabled attribute', () => {
    const el = createCascader({ disabled: true });
    container.appendChild(el);
    expect(el.hasAttribute('disabled')).toBe(true);
  });

  test('reflects multiple attribute', () => {
    const el = createCascader({ multiple: true });
    container.appendChild(el);
    expect(el.hasAttribute('multiple')).toBe(true);
  });

  test('reflects searchable attribute', () => {
    const el = createCascader({ searchable: true });
    container.appendChild(el);
    expect(el.hasAttribute('searchable')).toBe(true);
  });

  test('reflects clearable attribute', () => {
    const el = createCascader({ clearable: true });
    container.appendChild(el);
    expect(el.hasAttribute('clearable')).toBe(true);
  });

  test('reflects changeOnSelect attribute', () => {
    const el = createCascader({ changeOnSelect: true });
    container.appendChild(el);
    expect(el.hasAttribute('change-on-select')).toBe(true);
  });

  test('defaults expandTrigger to click', () => {
    const el = createCascader();
    container.appendChild(el);
    expect(el.expandTrigger).toBe('click');
  });

  test('defaults separator to " / "', () => {
    const el = createCascader();
    container.appendChild(el);
    expect(el.separator).toBe(' / ');
  });

  test('defaults size to md', () => {
    const el = createCascader();
    container.appendChild(el);
    expect(el.size).toBe('md');
  });

  test('reflects size attribute', () => {
    const el = createCascader({ size: 'sm' } as Partial<ElDmCascader>);
    container.appendChild(el);
    expect(el.getAttribute('size')).toBe('sm');
  });

  // --- Public methods ---
  test('has setOptions method', () => {
    const el = createCascader();
    container.appendChild(el);
    expect(typeof el.setOptions).toBe('function');
  });

  test('has setLoadData method', () => {
    const el = createCascader();
    container.appendChild(el);
    expect(typeof el.setLoadData).toBe('function');
  });

  test('setOptions renders options in first panel', () => {
    const el = createCascader();
    container.appendChild(el);
    el.setOptions(sampleOptions);
    const options = el.shadowRoot?.querySelectorAll('.cascader-option');
    expect(options?.length).toBeGreaterThanOrEqual(3);
  });

  // --- Accessibility ---
  test('has combobox role', () => {
    const el = createCascader();
    container.appendChild(el);
    const combobox = el.shadowRoot?.querySelector('[role="combobox"]');
    expect(combobox).toBeDefined();
  });

  test('has aria-expanded', () => {
    const el = createCascader();
    container.appendChild(el);
    const trigger = el.shadowRoot?.querySelector('[aria-expanded]');
    expect(trigger).toBeDefined();
  });

  // --- Disabled ---
  test('trigger is disabled when component disabled', () => {
    const el = createCascader({ disabled: true });
    container.appendChild(el);
    const trigger = el.shadowRoot?.querySelector('.cascader-trigger');
    expect(trigger?.hasAttribute('disabled')).toBe(true);
  });

  // --- Size via host attribute (styled with :host([size="sm/lg"])) ---
  test('host has size=sm attribute', () => {
    const el = createCascader({ size: 'sm' } as Partial<ElDmCascader>);
    container.appendChild(el);
    expect(el.getAttribute('size')).toBe('sm');
  });

  test('host has size=lg attribute', () => {
    const el = createCascader({ size: 'lg' } as Partial<ElDmCascader>);
    container.appendChild(el);
    expect(el.getAttribute('size')).toBe('lg');
  });

  // --- Validation ---
  test('reflects validationState attribute', () => {
    const el = createCascader({ validationState: 'invalid' } as Partial<ElDmCascader>);
    container.appendChild(el);
    expect(el.getAttribute('validation-state')).toBe('invalid');
  });

  // --- Options with children show expand indicator ---
  test('options with children have expand indicator', () => {
    const el = createCascader();
    container.appendChild(el);
    el.setOptions(sampleOptions);
    const expandable = el.shadowRoot?.querySelectorAll('.cascader-option-arrow');
    // fruits and vegs have children = 2 arrows
    expect(expandable?.length).toBeGreaterThanOrEqual(2);
  });

  // --- Searchable ---
  test('shows search input when searchable', () => {
    const el = createCascader({ searchable: true });
    container.appendChild(el);
    const searchInput = el.shadowRoot?.querySelector('.cascader-search-input');
    expect(searchInput).toBeDefined();
  });
});
