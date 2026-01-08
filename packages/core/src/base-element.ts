/**
 * Base class for all DuskMoon custom elements
 */

import { resetStyles, defaultTheme } from './styles.js';

/**
 * Property definition for reactive properties
 */
export interface PropertyDefinition {
  /** Attribute name (defaults to kebab-case of property name) */
  attribute?: string | false;
  /** Whether changes should reflect to attribute */
  reflect?: boolean;
  /** Property type for conversion */
  type?: typeof String | typeof Number | typeof Boolean | typeof Object | typeof Array;
  /** Default value */
  default?: unknown;
}

/**
 * Map of property names to their definitions
 */
export type PropertyDefinitions = Record<string, PropertyDefinition>;

/**
 * Base class for all DuskMoon custom elements
 *
 * Provides:
 * - Shadow DOM setup with adoptedStyleSheets
 * - Reactive properties with attribute reflection
 * - Style injection utilities
 * - Common lifecycle methods
 *
 * @example
 * ```ts
 * class MyElement extends BaseElement {
 *   static properties = {
 *     name: { type: String, reflect: true }
 *   };
 *
 *   constructor() {
 *     super();
 *     this.attachStyles(myStyles);
 *   }
 *
 *   render() {
 *     return `<div>Hello, ${this.name}!</div>`;
 *   }
 * }
 * ```
 */
export abstract class BaseElement extends HTMLElement {
  /**
   * Property definitions for reactive properties
   * Override in subclasses to define properties
   */
  static properties: PropertyDefinitions = {};

  /**
   * Observed attributes derived from property definitions
   */
  static get observedAttributes(): string[] {
    return Object.entries(this.properties)
      .filter(([, def]) => def.attribute !== false)
      .map(([name, def]) => def.attribute || toKebabCase(name));
  }

  /**
   * Shadow root for the element
   */
  declare shadowRoot: ShadowRoot;

  /**
   * Stylesheets attached to this element
   */
  private _styles: CSSStyleSheet[] = [];

  /**
   * Whether the element has been connected to the DOM
   */
  private _isConnected = false;

  /**
   * Queue of pending property updates
   */
  private _pendingUpdate = false;

  /**
   * Internal property values storage
   */
  private _propertyValues = new Map<string, unknown>();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Apply default styles
    this._styles = [resetStyles, defaultTheme];
    this.shadowRoot.adoptedStyleSheets = [...this._styles];

    // Initialize properties
    this._initializeProperties();
  }

  /**
   * Initialize reactive properties from static definitions
   */
  private _initializeProperties(): void {
    const ctor = this.constructor as typeof BaseElement;
    const properties = ctor.properties;

    for (const [name, def] of Object.entries(properties)) {
      // Set default value
      if (def.default !== undefined) {
        this._propertyValues.set(name, def.default);
      }

      // Define property accessor
      Object.defineProperty(this, name, {
        get: () => this._propertyValues.get(name),
        set: (value: unknown) => {
          const oldValue = this._propertyValues.get(name);
          if (oldValue === value) return;

          this._propertyValues.set(name, value);

          // Reflect to attribute if needed
          if (def.reflect && def.attribute !== false) {
            const attrName = def.attribute || toKebabCase(name);
            this._reflectToAttribute(attrName, value, def.type);
          }

          // Schedule update
          this._scheduleUpdate();
        },
        enumerable: true,
        configurable: true,
      });
    }
  }

  /**
   * Reflect a property value to an attribute
   */
  private _reflectToAttribute(
    attrName: string,
    value: unknown,
    type?: typeof String | typeof Number | typeof Boolean | typeof Object | typeof Array,
  ): void {
    if (value === null || value === undefined) {
      this.removeAttribute(attrName);
      return;
    }

    if (type === Boolean) {
      if (value) {
        this.setAttribute(attrName, '');
      } else {
        this.removeAttribute(attrName);
      }
      return;
    }

    if (type === Object || type === Array) {
      this.setAttribute(attrName, JSON.stringify(value));
      return;
    }

    this.setAttribute(attrName, String(value));
  }

  /**
   * Convert an attribute value to a property value
   */
  private _attributeToProperty(
    value: string | null,
    type?: typeof String | typeof Number | typeof Boolean | typeof Object | typeof Array,
  ): unknown {
    if (value === null) {
      return type === Boolean ? false : undefined;
    }

    switch (type) {
      case Boolean:
        return true;
      case Number:
        return Number(value);
      case Object:
      case Array:
        try {
          return JSON.parse(value);
        } catch {
          return undefined;
        }
      default:
        return value;
    }
  }

  /**
   * Schedule an update for the next microtask
   */
  private _scheduleUpdate(): void {
    if (this._pendingUpdate) return;
    this._pendingUpdate = true;

    queueMicrotask(() => {
      this._pendingUpdate = false;
      if (this._isConnected) {
        this.update();
      }
    });
  }

  /**
   * Attach additional stylesheets to the Shadow DOM
   *
   * @param styles - CSSStyleSheet or array of stylesheets to attach
   */
  protected attachStyles(styles: CSSStyleSheet | CSSStyleSheet[]): void {
    const sheets = Array.isArray(styles) ? styles : [styles];
    this._styles = [...this._styles, ...sheets];
    this.shadowRoot.adoptedStyleSheets = [...this._styles];
  }

  /**
   * Called when the element is connected to the DOM
   */
  connectedCallback(): void {
    this._isConnected = true;
    this.update();
  }

  /**
   * Called when the element is disconnected from the DOM
   */
  disconnectedCallback(): void {
    this._isConnected = false;
  }

  /**
   * Called when an observed attribute changes
   */
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    const ctor = this.constructor as typeof BaseElement;
    const properties = ctor.properties;

    // Find the property for this attribute
    for (const [propName, def] of Object.entries(properties)) {
      const attrName = def.attribute || toKebabCase(propName);
      if (attrName === name) {
        const value = this._attributeToProperty(newValue, def.type);
        this._propertyValues.set(propName, value);
        this._scheduleUpdate();
        break;
      }
    }
  }

  /**
   * Called when the element should update its DOM
   * Override to customize update behavior
   */
  protected update(): void {
    const content = this.render();
    if (content !== undefined) {
      this.shadowRoot.innerHTML = content;
    }
  }

  /**
   * Returns the HTML content for the element
   * Override in subclasses to define the element's template
   *
   * @returns HTML string or undefined if no update needed
   */
  protected render(): string | undefined {
    return undefined;
  }

  /**
   * Emit a custom event from this element
   *
   * @param name - Event name
   * @param detail - Event detail data
   * @param options - Additional event options
   */
  protected emit<T>(name: string, detail?: T, options?: Omit<CustomEventInit, 'detail'>): boolean {
    const event = new CustomEvent(name, {
      bubbles: true,
      composed: true,
      cancelable: true,
      ...options,
      detail,
    });
    return this.dispatchEvent(event);
  }

  /**
   * Query an element in the Shadow DOM
   */
  protected query<T extends Element>(selector: string): T | null {
    return this.shadowRoot.querySelector<T>(selector);
  }

  /**
   * Query all matching elements in the Shadow DOM
   */
  protected queryAll<T extends Element>(selector: string): NodeListOf<T> {
    return this.shadowRoot.querySelectorAll<T>(selector);
  }
}

/**
 * Convert a camelCase string to kebab-case
 */
function toKebabCase(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}
