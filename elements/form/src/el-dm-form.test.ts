import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmForm, register } from './index';

register();

function createForm(props: Partial<ElDmForm> = {}): ElDmForm {
  const el = document.createElement('el-dm-form') as ElDmForm;
  Object.assign(el, props);
  return el;
}

describe('ElDmForm', () => {
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
    expect(customElements.get('el-dm-form')).toBe(ElDmForm);
  });

  // --- Rendering ---
  test('creates a shadow root with form', () => {
    const el = createForm();
    container.appendChild(el);
    const form = el.shadowRoot?.querySelector('form');
    expect(form).toBeDefined();
  });

  test('form has form class', () => {
    const el = createForm();
    container.appendChild(el);
    const form = el.shadowRoot?.querySelector('form.form');
    expect(form).toBeDefined();
  });

  test('has default slot', () => {
    const el = createForm();
    container.appendChild(el);
    const slot = el.shadowRoot?.querySelector('slot');
    expect(slot).toBeDefined();
  });

  // --- Properties ---
  test('defaults validationState to default', () => {
    const el = createForm();
    container.appendChild(el);
    expect(el.validationState).toBe('default');
  });

  test('reflects validation-state attribute', () => {
    const el = createForm({ validationState: 'error' } as Partial<ElDmForm>);
    container.appendChild(el);
    expect(el.getAttribute('validation-state')).toBe('error');
  });

  test('reflects disabled attribute', () => {
    const el = createForm({ disabled: true });
    container.appendChild(el);
    expect(el.hasAttribute('disabled')).toBe(true);
  });

  test('validation-state success reflected', () => {
    const el = createForm({ validationState: 'success' } as Partial<ElDmForm>);
    container.appendChild(el);
    expect(el.getAttribute('validation-state')).toBe('success');
  });

  // --- Gap property ---
  test('defaults gap to 1rem', () => {
    const el = createForm();
    container.appendChild(el);
    expect(el.gap).toBe('1rem');
  });

  test('reflects custom gap to attribute', () => {
    const el = createForm({ gap: '2rem' } as Partial<ElDmForm>);
    container.appendChild(el);
    expect(el.getAttribute('gap')).toBe('2rem');
  });

  test('applies gap as CSS variable on form element', () => {
    const el = createForm({ gap: '1.5rem' } as Partial<ElDmForm>);
    container.appendChild(el);
    const form = el.shadowRoot?.querySelector('form');
    expect(form?.getAttribute('style')).toContain('--form-gap: 1.5rem');
  });

  test('updates CSS variable when gap changes', () => {
    const el = createForm();
    container.appendChild(el);
    el.gap = '0.5rem';
    // Wait for microtask batched update
    return new Promise<void>((resolve) => {
      queueMicrotask(() => {
        const form = el.shadowRoot?.querySelector('form');
        expect(form?.getAttribute('style')).toContain('--form-gap: 0.5rem');
        resolve();
      });
    });
  });

  // --- Public methods ---
  test('has submit method', () => {
    const el = createForm();
    container.appendChild(el);
    expect(typeof el.submit).toBe('function');
  });

  test('has reset method', () => {
    const el = createForm();
    container.appendChild(el);
    expect(typeof el.reset).toBe('function');
  });

  test('reset emits reset event', () => {
    const el = createForm();
    container.appendChild(el);
    let fired = false;
    el.addEventListener('reset', () => { fired = true; });
    el.reset();
    expect(fired).toBe(true);
  });

  test('reset does nothing when disabled', () => {
    const el = createForm({ disabled: true });
    container.appendChild(el);
    let fired = false;
    el.addEventListener('reset', () => { fired = true; });
    el.reset();
    expect(fired).toBe(false);
  });

  // --- Events ---
  test('form submit event emits custom submit', () => {
    const el = createForm();
    container.appendChild(el);
    let fired = false;
    el.addEventListener('submit', () => { fired = true; });
    const form = el.shadowRoot?.querySelector('form');
    form?.dispatchEvent(new Event('submit'));
    expect(fired).toBe(true);
  });

  test('form reset event emits custom reset', () => {
    const el = createForm();
    container.appendChild(el);
    let fired = false;
    el.addEventListener('reset', () => { fired = true; });
    const form = el.shadowRoot?.querySelector('form');
    form?.dispatchEvent(new Event('reset'));
    expect(fired).toBe(true);
  });

  test('submit event prevented when disabled', () => {
    const el = createForm({ disabled: true });
    container.appendChild(el);
    let fired = false;
    el.addEventListener('submit', () => { fired = true; });
    const form = el.shadowRoot?.querySelector('form');
    form?.dispatchEvent(new Event('submit'));
    expect(fired).toBe(false);
  });

  test('reset event prevented when disabled', () => {
    const el = createForm({ disabled: true });
    container.appendChild(el);
    let fired = false;
    el.addEventListener('reset', () => { fired = true; });
    const form = el.shadowRoot?.querySelector('form');
    form?.dispatchEvent(new Event('reset'));
    expect(fired).toBe(false);
  });

  // --- CSS Parts ---
  test('has form part', () => {
    const el = createForm();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="form"]')).toBeDefined();
  });
});
