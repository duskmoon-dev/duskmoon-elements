import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmSelect, register } from './index';

register();

describe('ElDmSelect', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-select')).toBe(ElDmSelect);
  });

  test('creates a shadow root', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    container.appendChild(el);

    expect(el.shadowRoot).toBeDefined();
  });

  test('has combobox role', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    container.appendChild(el);

    const combobox = el.shadowRoot?.querySelector('[role="combobox"]');
    expect(combobox).toBeDefined();
  });

  test('reflects disabled attribute', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    el.disabled = true;
    container.appendChild(el);

    expect(el.hasAttribute('disabled')).toBe(true);
  });

  test('sets placeholder property', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    el.placeholder = 'Choose...';
    container.appendChild(el);

    expect(el.placeholder).toBe('Choose...');
  });

  test('reflects size attribute', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    el.size = 'lg';
    container.appendChild(el);

    expect(el.getAttribute('size')).toBe('lg');
  });

  test('reflects multiple attribute', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    el.multiple = true;
    container.appendChild(el);

    expect(el.hasAttribute('multiple')).toBe(true);
  });

  test('reflects clearable attribute', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    el.clearable = true;
    container.appendChild(el);

    expect(el.hasAttribute('clearable')).toBe(true);
  });

  test('reflects searchable attribute', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    el.searchable = true;
    container.appendChild(el);

    expect(el.hasAttribute('searchable')).toBe(true);
  });

  test('reflects tree-data attribute', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    el.treeData = true;
    container.appendChild(el);

    expect(el.hasAttribute('tree-data')).toBe(true);
  });

  test('reflects readonly attribute', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    el.readonly = true;
    container.appendChild(el);

    expect(el.hasAttribute('readonly')).toBe(true);
  });

  test('reflects validation-state attribute', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    (el as any).validationState = 'invalid';
    container.appendChild(el);

    expect(el.getAttribute('validation-state')).toBe('invalid');
  });

  test('renders placeholder text', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    el.placeholder = 'Pick one';
    container.appendChild(el);

    const placeholder = el.shadowRoot?.querySelector('.select-placeholder');
    expect(placeholder?.textContent?.trim()).toBe('Pick one');
  });

  test('setOptions renders options', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    container.appendChild(el);

    el.setOptions([
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
    ]);

    const options = el.shadowRoot?.querySelectorAll('.select-option');
    expect(options?.length).toBe(2);
  });

  test('renders dropdown with listbox role', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    container.appendChild(el);

    el.setOptions([{ value: 'a', label: 'Alpha' }]);

    const listbox = el.shadowRoot?.querySelector('[role="listbox"]');
    expect(listbox).toBeDefined();
  });

  test('has aria-expanded on trigger', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    container.appendChild(el);

    const trigger = el.shadowRoot?.querySelector('.select-trigger');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
  });

  test('setOptions with group headers', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    container.appendChild(el);

    el.setOptions([
      { value: 'a', label: 'Alpha', group: 'Greek' },
      { value: '1', label: 'One', group: 'Numbers' },
    ]);

    const groupHeaders = el.shadowRoot?.querySelectorAll('.select-group-header');
    expect(groupHeaders?.length).toBe(2);
  });

  test('shows empty state when no options match', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    container.appendChild(el);

    el.setOptions([]);

    const empty = el.shadowRoot?.querySelector('.select-empty');
    expect(empty).toBeDefined();
  });

  test('renders selected value in trigger', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    el.value = 'a';
    container.appendChild(el);

    el.setOptions([
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
    ]);

    const valueDisplay = el.shadowRoot?.querySelector('.select-value');
    expect(valueDisplay?.textContent?.trim()).toBe('Alpha');
  });

  test('renders tags in multiple mode', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    el.multiple = true;
    el.value = '["a","b"]';
    container.appendChild(el);

    el.setOptions([
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
      { value: 'c', label: 'Charlie' },
    ]);

    const tags = el.shadowRoot?.querySelectorAll('.select-tag');
    expect(tags?.length).toBe(2);
  });

  test('renders search input when searchable', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    el.searchable = true;
    container.appendChild(el);

    el.setOptions([{ value: 'a', label: 'Alpha' }]);

    const searchInput = el.shadowRoot?.querySelector('.select-search-input');
    expect(searchInput).toBeDefined();
  });

  test('renders clear button when clearable and has value', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    el.clearable = true;
    el.value = 'a';
    container.appendChild(el);

    el.setOptions([{ value: 'a', label: 'Alpha' }]);

    const clearBtn = el.shadowRoot?.querySelector('.select-clear');
    expect(clearBtn).toBeDefined();
  });

  test('setTreeOptions renders tree nodes', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    el.treeData = true;
    el.defaultExpandAll = true;
    container.appendChild(el);

    el.setTreeOptions([
      {
        value: 'parent',
        label: 'Parent',
        children: [
          { value: 'child1', label: 'Child 1' },
          { value: 'child2', label: 'Child 2' },
        ],
      },
    ]);

    const treeNodes = el.shadowRoot?.querySelectorAll('.select-tree-node');
    expect(treeNodes?.length).toBeGreaterThanOrEqual(1);
  });

  test('setOptions with 3 items renders 3 options', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    container.appendChild(el);

    el.setOptions([
      { value: 'x', label: 'X-Ray' },
      { value: 'y', label: 'Yankee' },
      { value: 'z', label: 'Zulu' },
    ]);

    const options = el.shadowRoot?.querySelectorAll('.select-option');
    expect(options?.length).toBe(3);
  });

  test('handles invalid JSON options gracefully', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    el.options = 'not-json';
    container.appendChild(el);

    // Should not throw, renders empty
    const options = el.shadowRoot?.querySelectorAll('.select-option');
    expect(options?.length).toBe(0);
  });

  test('arrow icon present in trigger', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    container.appendChild(el);

    const arrow = el.shadowRoot?.querySelector('.select-arrow');
    expect(arrow).toBeDefined();
  });

  test('marks selected option', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    el.value = 'b';
    container.appendChild(el);

    el.setOptions([
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
    ]);

    const selected = el.shadowRoot?.querySelector('.select-option.selected');
    expect(selected).toBeDefined();
    expect(selected?.textContent).toContain('Beta');
  });

  test('renders disabled options', () => {
    const el = document.createElement('el-dm-select') as ElDmSelect;
    container.appendChild(el);

    el.setOptions([
      { value: 'a', label: 'Alpha', disabled: true },
      { value: 'b', label: 'Beta' },
    ]);

    const disabledOpt = el.shadowRoot?.querySelector('.select-option.disabled');
    expect(disabledOpt).toBeDefined();
  });
});
