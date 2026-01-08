/**
 * Test setup file for DOM API polyfills
 * This file is preloaded before tests run
 */
import { GlobalWindow } from 'happy-dom';

const window = new GlobalWindow();

// Register DOM globals
Object.assign(globalThis, {
  window,
  document: window.document,
  HTMLElement: window.HTMLElement,
  HTMLDivElement: window.HTMLDivElement,
  CustomEvent: window.CustomEvent,
  Event: window.Event,
  CSSStyleSheet: window.CSSStyleSheet,
  customElements: window.customElements,
  MutationObserver: window.MutationObserver,
  getComputedStyle: window.getComputedStyle.bind(window),
  requestAnimationFrame: window.requestAnimationFrame.bind(window),
  cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
});
