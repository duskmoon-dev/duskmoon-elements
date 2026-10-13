import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmButton, register } from './index';

// Register the element
register();

describe('ElDmButton', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-button')).toBe(ElDmButton);
  });

  test('creates a shadow root with button', () => {
    const el = document.createElement('el-dm-button') as ElDmButton;
    container.appendChild(el);

    const button = el.shadowRoot?.querySelector('button');
    expect(button).toBeDefined();
  });

  test('renders slot content', () => {
    const el = document.createElement('el-dm-button') as ElDmButton;
    el.textContent = 'Click me';
    container.appendChild(el);

    const slot = el.shadowRoot?.querySelector('slot:not([name])');
    expect(slot).toBeDefined();
  });

  test('forwards an initial icon-only label without interpreting it as markup', () => {
    const el = document.createElement('el-dm-button') as ElDmButton;
    const label = 'Remove "email" & <img src=x onerror="alert(1)">';
    el.setAttribute('aria-label', label);
    el.innerHTML = '<svg aria-hidden="true"></svg>';
    container.appendChild(el);

    const button = el.shadowRoot.querySelector('button')!;
    expect(button.getAttribute('aria-label')).toBe(label);
    expect(button.querySelector('img')).toBeNull();
    expect(button.hasAttribute('onerror')).toBe(false);
  });

  test('synchronizes label changes and removal without replacing the focused button', () => {
    const el = document.createElement('el-dm-button') as ElDmButton;
    el.textContent = 'Visible label';
    container.appendChild(el);
    const button = el.shadowRoot.querySelector('button')!;
    button.focus();

    el.setAttribute('aria-label', 'Remove email');
    expect(button.getAttribute('aria-label')).toBe('Remove email');
    el.setAttribute('aria-label', 'Remove phone');
    expect(button.getAttribute('aria-label')).toBe('Remove phone');
    el.removeAttribute('aria-label');
    expect(button.hasAttribute('aria-label')).toBe(false);
    expect(button.hasAttribute('aria-labelledby')).toBe(false);
    expect(el.shadowRoot.querySelector('button')).toBe(button);
    expect(el.shadowRoot.activeElement).toBe(button);
    expect(el.textContent).toBe('Visible label');
  });

  test('keeps labels after reactive button state updates', async () => {
    const el = document.createElement('el-dm-button') as ElDmButton;
    el.setAttribute('aria-label', 'Remove email');
    container.appendChild(el);
    el.loading = true;
    await Promise.resolve();

    const button = el.shadowRoot.querySelector('button')!;
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-label')).toBe('Remove email');
  });

  test('resolves external labelledby targets in ID order and restores aria-label on removal', () => {
    container.innerHTML = '<span id="action">Remove</span><span id="field">email</span>';
    const el = document.createElement('el-dm-button') as ElDmButton;
    el.setAttribute('aria-label', 'Fallback');
    el.setAttribute('aria-labelledby', 'action missing field');
    container.appendChild(el);
    const button = el.shadowRoot.querySelector('button')!;

    expect(button.getAttribute('aria-label')).toBe('Remove email');
    el.setAttribute('aria-labelledby', 'field action');
    expect(button.getAttribute('aria-label')).toBe('email Remove');
    el.removeAttribute('aria-labelledby');
    expect(button.getAttribute('aria-label')).toBe('Fallback');
    el.removeAttribute('aria-label');
    expect(button.hasAttribute('aria-label')).toBe(false);
  });

  test('updates external label text, replacement, and late target insertion', async () => {
    const el = document.createElement('el-dm-button') as ElDmButton;
    el.setAttribute('aria-label', 'Fallback');
    el.setAttribute('aria-labelledby', 'external-label');
    container.appendChild(el);
    const button = el.shadowRoot.querySelector('button')!;
    expect(button.getAttribute('aria-label')).toBe('Fallback');

    const label = document.createElement('span');
    label.id = 'external-label';
    label.textContent = 'Remove email';
    container.appendChild(label);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(button.getAttribute('aria-label')).toBe('Remove email');

    label.firstChild!.textContent = 'Remove phone';
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(button.getAttribute('aria-label')).toBe('Remove phone');

    const replacement = document.createElement('span');
    replacement.id = label.id;
    replacement.textContent = 'Remove address';
    label.replaceWith(replacement);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(button.getAttribute('aria-label')).toBe('Remove address');

    replacement.id = 'renamed-label';
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(button.getAttribute('aria-label')).toBe('Fallback');
    el.setAttribute('aria-labelledby', replacement.id);
    expect(button.getAttribute('aria-label')).toBe('Remove address');

    replacement.remove();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(button.getAttribute('aria-label')).toBe('Fallback');
  });

  test('uses native element references when supported and clears them after removal', () => {
    container.innerHTML = '<span id="external-label">Remove email</span>';
    const el = document.createElement('el-dm-button') as ElDmButton;
    container.appendChild(el);
    const button = el.shadowRoot.querySelector('button')!;
    Object.defineProperty(button, 'ariaLabelledByElements', { value: null, writable: true });

    el.setAttribute('aria-label', 'Fallback');
    el.setAttribute('aria-labelledby', 'external-label');
    expect(button.ariaLabelledByElements?.length).toBe(1);
    expect(button.ariaLabelledByElements?.[0]).toBe(container.querySelector('span'));
    expect(button.getAttribute('aria-label')).toBe('Fallback');
    el.removeAttribute('aria-labelledby');
    expect(button.ariaLabelledByElements?.length).toBe(0);
  });

  test('resolves labels in the host shadow root and reconnects label observation', async () => {
    const wrapper = document.createElement('div');
    const root = wrapper.attachShadow({ mode: 'open' });
    root.innerHTML = '<span id="label">Remove email</span>';
    container.appendChild(wrapper);
    const el = document.createElement('el-dm-button') as ElDmButton;
    el.setAttribute('aria-labelledby', 'label');
    root.appendChild(el);
    expect(el.shadowRoot.querySelector('button')!.getAttribute('aria-label')).toBe('Remove email');

    el.remove();
    root.querySelector('span')!.textContent = 'Remove phone';
    root.appendChild(el);
    expect(el.shadowRoot.querySelector('button')!.getAttribute('aria-label')).toBe('Remove phone');
    root.querySelector('span')!.textContent = 'Remove address';
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(el.shadowRoot.querySelector('button')!.getAttribute('aria-label')).toBe(
      'Remove address',
    );
  });

  test('applies variant attribute', () => {
    const el = document.createElement('el-dm-button') as ElDmButton;
    el.variant = 'secondary';
    container.appendChild(el);

    expect(el.getAttribute('variant')).toBe('secondary');
  });

  test('applies size attribute', () => {
    const el = document.createElement('el-dm-button') as ElDmButton;
    el.size = 'lg';
    container.appendChild(el);

    expect(el.getAttribute('size')).toBe('lg');
  });

  test('applies disabled attribute to native button', () => {
    const el = document.createElement('el-dm-button') as ElDmButton;
    el.disabled = true;
    container.appendChild(el);

    const button = el.shadowRoot?.querySelector('button');
    expect(button?.hasAttribute('disabled')).toBe(true);
  });

  test('shows loading spinner when loading', () => {
    const el = document.createElement('el-dm-button') as ElDmButton;
    el.loading = true;
    container.appendChild(el);

    expect(el.hasAttribute('loading')).toBe(true);
  });

  test('default type is button', () => {
    const el = document.createElement('el-dm-button') as ElDmButton;
    container.appendChild(el);

    const button = el.shadowRoot?.querySelector('button');
    expect(button?.getAttribute('type')).toBe('button');
  });

  test('submits external form referenced by form attribute', () => {
    const form = document.createElement('form');
    form.id = 'external-form';
    let submitter: HTMLElement | undefined;
    form.requestSubmit = (button) => {
      submitter = button;
      expect(button?.isConnected).toBe(true);
      expect(button?.form).toBe(form);
    };
    container.appendChild(form);

    const el = document.createElement('el-dm-button') as ElDmButton;
    el.type = 'submit';
    el.setAttribute('form', 'external-form');
    el.setAttribute('name', 'action');
    el.setAttribute('value', 'save');
    container.appendChild(el);

    el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

    expect(submitter?.getAttribute('name')).toBe('action');
    expect(submitter?.getAttribute('value')).toBe('save');
    expect(submitter?.isConnected).toBe(false);
    expect(form.querySelector('button')).toBeNull();
  });

  test('supports prefix and suffix slots', () => {
    const el = document.createElement('el-dm-button') as ElDmButton;
    container.appendChild(el);

    const prefixSlot = el.shadowRoot?.querySelector('slot[name="prefix"]');
    const suffixSlot = el.shadowRoot?.querySelector('slot[name="suffix"]');

    expect(prefixSlot).toBeDefined();
    expect(suffixSlot).toBeDefined();
  });
});
