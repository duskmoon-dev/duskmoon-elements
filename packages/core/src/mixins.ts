/**
 * Composition mixins for DuskMoon custom elements
 *
 * Mixins add reusable behaviors to BaseElement subclasses using
 * the TypeScript mixin pattern (class expression extending a base).
 *
 * @example
 * ```ts
 * import { BaseElement, FocusableMixin, FormMixin } from '@duskmoon-dev/el-core';
 *
 * class MyInput extends FormMixin(FocusableMixin(BaseElement)) {
 *   // Now has focus management + form association behaviors
 * }
 * ```
 */

import type { PropertyDefinitions } from './base-element.js';

/**
 * A constructor type that returns an HTMLElement with shadow DOM and
 * lifecycle methods. Using HTMLElement (not BaseElement) avoids TS4094
 * errors where private BaseElement members leak into anonymous class types.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = HTMLElement> = abstract new (...args: any[]) => T;

interface BaseElementLike extends HTMLElement {
  connectedCallback(): void;
  disconnectedCallback(): void;
  shadowRoot: ShadowRoot;
}

interface BaseElementConstructorLike {
  properties: PropertyDefinitions;
}

/**
 * Mixin that adds keyboard focus management.
 * Sets tabindex, handles focus/blur events, and tracks focused state.
 */
export function FocusableMixin<T extends Constructor<BaseElementLike>>(Base: T) {
  abstract class FocusableElement extends Base {
    static properties: PropertyDefinitions = {
      ...(Base as unknown as BaseElementConstructorLike).properties,
      focused: { type: Boolean, reflect: true, default: false },
    };

    declare focused: boolean;

    #handleFocus = () => {
      this.focused = true;
    };

    #handleBlur = () => {
      this.focused = false;
    };

    connectedCallback() {
      super.connectedCallback();
      if (!this.hasAttribute('tabindex')) {
        this.setAttribute('tabindex', '0');
      }
      this.addEventListener('focus', this.#handleFocus);
      this.addEventListener('blur', this.#handleBlur);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('focus', this.#handleFocus);
      this.removeEventListener('blur', this.#handleBlur);
    }
  }

  return FocusableElement;
}

/**
 * Mixin that adds form association.
 * Provides name/value/disabled/required props and form participation.
 */
export function FormMixin<T extends Constructor<BaseElementLike>>(Base: T) {
  abstract class FormElement extends Base {
    static properties: PropertyDefinitions = {
      ...(Base as unknown as BaseElementConstructorLike).properties,
      name: { type: String, reflect: true, default: '' },
      value: { type: String, reflect: true, default: '' },
      disabled: { type: Boolean, reflect: true, default: false },
      required: { type: Boolean, reflect: true, default: false },
    };

    declare name: string;
    declare value: string;
    declare disabled: boolean;
    declare required: boolean;

    /** Get the form this element is associated with */
    get form(): HTMLFormElement | null {
      return this.closest('form');
    }
  }

  return FormElement;
}

/**
 * Mixin that adds event listener management with automatic cleanup.
 * Listeners added via addListener() are removed on disconnect.
 */
export function EventListenerMixin<T extends Constructor<BaseElementLike>>(Base: T) {
  abstract class EventListenerElement extends Base {
    #listeners: Array<{
      target: EventTarget;
      type: string;
      handler: EventListener;
      options?: boolean | AddEventListenerOptions;
    }> = [];

    /**
     * Add an event listener that will be automatically removed on disconnect
     */
    addListener(
      target: EventTarget,
      type: string,
      handler: EventListener,
      options?: boolean | AddEventListenerOptions,
    ): void {
      target.addEventListener(type, handler, options);
      this.#listeners.push({ target, type, handler, options });
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      for (const { target, type, handler, options } of this.#listeners) {
        target.removeEventListener(type, handler, options);
      }
      this.#listeners = [];
    }
  }

  return EventListenerElement;
}

/**
 * Mixin that adds slot change observation.
 * Tracks slotted elements and fires a callback when slots change.
 */
export function SlotObserverMixin<T extends Constructor<BaseElementLike>>(Base: T) {
  abstract class SlotObserverElement extends Base {
    #slotObservers: Map<string, (elements: Element[]) => void> = new Map();

    /**
     * Observe a named slot (or '' for default) and call handler when content changes
     */
    observeSlot(
      slotName: string,
      handler: (elements: Element[]) => void,
    ): void {
      this.#slotObservers.set(slotName, handler);
    }

    connectedCallback() {
      super.connectedCallback();
      // Defer to next frame so shadow DOM is rendered
      requestAnimationFrame(() => this.#attachSlotListeners());
    }

    #attachSlotListeners(): void {
      const slots = this.shadowRoot.querySelectorAll('slot');
      for (const slot of slots) {
        const name = slot.name || '';
        const handler = this.#slotObservers.get(name);
        if (handler) {
          slot.addEventListener('slotchange', () => {
            const elements = slot.assignedElements();
            handler(elements);
          });
          // Fire initial
          const elements = slot.assignedElements();
          handler(elements);
        }
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.#slotObservers.clear();
    }
  }

  return SlotObserverElement;
}
