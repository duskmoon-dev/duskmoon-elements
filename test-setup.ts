/**
 * Test setup file for DOM API polyfills
 * This file is preloaded before tests run
 */
import { GlobalWindow } from 'happy-dom';

const window = new GlobalWindow();

// Happy DOM's Node getter returns an empty name instead of dispatching to subclasses.
// DOMPurify caches this native getter, so mirror browser behavior in the test runtime.
const nodeNameDescriptor = Object.getOwnPropertyDescriptor(window.Node.prototype, 'nodeName')!;
Object.defineProperty(window.Node.prototype, 'nodeName', {
  ...nodeNameDescriptor,
  get(this: Node): string {
    let prototype = Object.getPrototypeOf(this);
    while (prototype && prototype !== window.Node.prototype) {
      const getter = Object.getOwnPropertyDescriptor(prototype, 'nodeName')?.get;
      if (getter) return getter.call(this);
      prototype = Object.getPrototypeOf(prototype);
    }
    return nodeNameDescriptor.get!.call(this);
  },
});

// Register DOM globals
Object.assign(globalThis, {
  window,
  document: window.document,
  HTMLElement: window.HTMLElement,
  HTMLDivElement: window.HTMLDivElement,
  HTMLDialogElement: window.HTMLDialogElement,
  CustomEvent: window.CustomEvent,
  Event: window.Event,
  CSSStyleSheet: window.CSSStyleSheet,
  customElements: window.customElements,
  MutationObserver: window.MutationObserver,
  getComputedStyle: window.getComputedStyle.bind(window),
  requestAnimationFrame: window.requestAnimationFrame.bind(window),
  cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
});
