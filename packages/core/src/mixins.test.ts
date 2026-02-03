import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { BaseElement } from './base-element';
import { FocusableMixin, FormMixin, EventListenerMixin, SlotObserverMixin } from './mixins';

// Register test elements
let registered = false;
function ensureRegistered() {
  if (registered) return;
  registered = true;

  class TestFocusable extends FocusableMixin(BaseElement) {
    render() {
      return `<div>focusable</div>`;
    }
  }
  customElements.define('test-focusable', TestFocusable);

  class TestForm extends FormMixin(BaseElement) {
    render() {
      return `<input />`;
    }
  }
  customElements.define('test-form', TestForm);

  class TestEventListener extends EventListenerMixin(BaseElement) {
    public callCount = 0;

    connectedCallback() {
      super.connectedCallback();
      this.addListener(this, 'click', () => {
        this.callCount++;
      });
    }

    render() {
      return `<div>event listener</div>`;
    }
  }
  customElements.define('test-event-listener', TestEventListener);

  class TestSlotObserver extends SlotObserverMixin(BaseElement) {
    public slottedElements: Element[] = [];

    constructor() {
      super();
      this.observeSlot('', (elements) => {
        this.slottedElements = elements;
      });
    }

    render() {
      return `<slot></slot>`;
    }
  }
  customElements.define('test-slot-observer', TestSlotObserver);

  // Composed mixin test: FocusableMixin + FormMixin
  class TestComposed extends FormMixin(FocusableMixin(BaseElement)) {
    render() {
      return `<input />`;
    }
  }
  customElements.define('test-composed', TestComposed);
}

describe('Composition Mixins', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    ensureRegistered();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('FocusableMixin', () => {
    test('sets tabindex on connect', () => {
      const el = document.createElement('test-focusable');
      container.appendChild(el);
      expect(el.getAttribute('tabindex')).toBe('0');
    });

    test('does not override existing tabindex', () => {
      const el = document.createElement('test-focusable');
      el.setAttribute('tabindex', '-1');
      container.appendChild(el);
      expect(el.getAttribute('tabindex')).toBe('-1');
    });

    test('has focused property defaulting to false', () => {
      const el = document.createElement('test-focusable') as InstanceType<
        ReturnType<typeof FocusableMixin>
      >;
      container.appendChild(el);
      expect(el.focused).toBe(false);
    });

    test('sets focused on focus event', () => {
      const el = document.createElement('test-focusable') as InstanceType<
        ReturnType<typeof FocusableMixin>
      >;
      container.appendChild(el);
      el.dispatchEvent(new Event('focus'));
      expect(el.focused).toBe(true);
    });

    test('clears focused on blur event', () => {
      const el = document.createElement('test-focusable') as InstanceType<
        ReturnType<typeof FocusableMixin>
      >;
      container.appendChild(el);
      el.dispatchEvent(new Event('focus'));
      el.dispatchEvent(new Event('blur'));
      expect(el.focused).toBe(false);
    });
  });

  describe('FormMixin', () => {
    test('has name property', () => {
      const el = document.createElement('test-form') as InstanceType<ReturnType<typeof FormMixin>>;
      container.appendChild(el);
      expect(el.name).toBe('');
      el.name = 'email';
      expect(el.getAttribute('name')).toBe('email');
    });

    test('has value property', () => {
      const el = document.createElement('test-form') as InstanceType<ReturnType<typeof FormMixin>>;
      container.appendChild(el);
      expect(el.value).toBe('');
      el.value = 'test';
      expect(el.getAttribute('value')).toBe('test');
    });

    test('has disabled property', () => {
      const el = document.createElement('test-form') as InstanceType<ReturnType<typeof FormMixin>>;
      container.appendChild(el);
      expect(el.disabled).toBe(false);
    });

    test('has required property', () => {
      const el = document.createElement('test-form') as InstanceType<ReturnType<typeof FormMixin>>;
      container.appendChild(el);
      expect(el.required).toBe(false);
    });

    test('form getter returns null when not in form', () => {
      const el = document.createElement('test-form') as InstanceType<ReturnType<typeof FormMixin>>;
      container.appendChild(el);
      expect(el.form).toBeNull();
    });

    test('form getter returns parent form', () => {
      const form = document.createElement('form');
      const el = document.createElement('test-form') as InstanceType<ReturnType<typeof FormMixin>>;
      form.appendChild(el);
      container.appendChild(form);
      expect(el.form).not.toBeNull();
      expect(el.form?.tagName.toLowerCase()).toBe('form');
    });
  });

  describe('EventListenerMixin', () => {
    test('adds event listener on connect', () => {
      const el = document.createElement('test-event-listener') as InstanceType<
        ReturnType<typeof EventListenerMixin>
      > & { callCount: number };
      container.appendChild(el);
      el.dispatchEvent(new Event('click'));
      expect(el.callCount).toBe(1);
    });

    test('cleans up listeners on disconnect', () => {
      const el = document.createElement('test-event-listener') as InstanceType<
        ReturnType<typeof EventListenerMixin>
      > & { callCount: number };
      container.appendChild(el);
      el.dispatchEvent(new Event('click'));
      expect(el.callCount).toBe(1);
      el.remove();
      el.dispatchEvent(new Event('click'));
      // Listener should have been removed on disconnect
      expect(el.callCount).toBe(1);
    });
  });

  describe('SlotObserverMixin', () => {
    test('creates element with slot', () => {
      const el = document.createElement('test-slot-observer');
      container.appendChild(el);
      expect(el.shadowRoot.querySelector('slot')).toBeTruthy();
    });
  });

  describe('Composed mixins', () => {
    test('combines FocusableMixin + FormMixin properties', () => {
      const el = document.createElement('test-composed') as InstanceType<
        ReturnType<typeof FormMixin>
      > &
        InstanceType<ReturnType<typeof FocusableMixin>>;
      container.appendChild(el);
      // FormMixin properties
      expect(el.name).toBe('');
      expect(el.disabled).toBe(false);
      // FocusableMixin properties
      expect(el.focused).toBe(false);
      expect(el.getAttribute('tabindex')).toBe('0');
    });

    test('focus behavior works on composed element', () => {
      const el = document.createElement('test-composed') as InstanceType<
        ReturnType<typeof FocusableMixin>
      >;
      container.appendChild(el);
      el.dispatchEvent(new Event('focus'));
      expect(el.focused).toBe(true);
    });

    test('form association works on composed element', () => {
      const form = document.createElement('form');
      const el = document.createElement('test-composed') as InstanceType<
        ReturnType<typeof FormMixin>
      >;
      form.appendChild(el);
      container.appendChild(form);
      expect(el.form).not.toBeNull();
      expect(el.form?.tagName.toLowerCase()).toBe('form');
    });
  });
});
