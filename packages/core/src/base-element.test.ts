import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { BaseElement } from './base-element';
import { css } from './styles';

// Test element for testing BaseElement
class TestElement extends BaseElement {
  static properties = {
    name: { type: String, reflect: true, default: 'world' },
    count: { type: Number, reflect: true },
    active: { type: Boolean, reflect: true },
  };

  declare name: string;
  declare count: number;
  declare active: boolean;

  private testStyles = css`
    :host {
      display: block;
    }
  `;

  constructor() {
    super();
    this.attachStyles(this.testStyles);
  }

  render(): string {
    return `<div class="greeting">Hello, ${this.name}! Count: ${this.count || 0}</div>`;
  }
}

// Register the test element
if (!customElements.get('test-element')) {
  customElements.define('test-element', TestElement);
}

describe('BaseElement', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('creates a shadow root', () => {
    const el = document.createElement('test-element') as TestElement;
    container.appendChild(el);

    expect(el.shadowRoot).toBeDefined();
    expect(el.shadowRoot?.mode).toBe('open');
  });

  test('renders content in shadow DOM', () => {
    const el = document.createElement('test-element') as TestElement;
    container.appendChild(el);

    const content = el.shadowRoot?.querySelector('.greeting');
    expect(content?.textContent).toContain('Hello, world!');
  });

  test('uses default property values', () => {
    const el = document.createElement('test-element') as TestElement;
    container.appendChild(el);

    expect(el.name).toBe('world');
  });

  test('reflects string properties to attributes', () => {
    const el = document.createElement('test-element') as TestElement;
    container.appendChild(el);

    el.name = 'test';
    expect(el.getAttribute('name')).toBe('test');
  });

  test('reflects number properties to attributes', () => {
    const el = document.createElement('test-element') as TestElement;
    container.appendChild(el);

    el.count = 42;
    expect(el.getAttribute('count')).toBe('42');
  });

  test('reflects boolean properties to attributes', () => {
    const el = document.createElement('test-element') as TestElement;
    container.appendChild(el);

    el.active = true;
    expect(el.hasAttribute('active')).toBe(true);

    el.active = false;
    expect(el.hasAttribute('active')).toBe(false);
  });

  test('converts attributes to properties', () => {
    const el = document.createElement('test-element') as TestElement;
    el.setAttribute('name', 'attribute-value');
    container.appendChild(el);

    expect(el.name).toBe('attribute-value');
  });

  test('applies stylesheets via adoptedStyleSheets', () => {
    const el = document.createElement('test-element') as TestElement;
    container.appendChild(el);

    expect(el.shadowRoot?.adoptedStyleSheets.length).toBeGreaterThan(0);
  });
});
