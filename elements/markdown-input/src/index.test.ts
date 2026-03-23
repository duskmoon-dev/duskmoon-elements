import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { MarkdownInputHook } from './index.js';

// ── Minimal mock for LiveView hook context ────────────────────────────

function makeMockContext() {
  const listeners: Record<string, EventListener> = {};
  const el = {
    getValue: mock(() => ''),
    setValue: mock((_s: string) => {}),
    dataset: {} as DOMStringMap,
    addEventListener: mock((event: string, handler: EventListener) => {
      listeners[event] = handler;
    }),
  };

  const ctx = {
    el,
    pushEvent: mock((_event: string, _payload: Record<string, unknown>) => {}),
  };

  return { ctx, listeners };
}

describe('MarkdownInputHook', () => {
  describe('mounted', () => {
    test('sets initial value from data-value attribute', () => {
      const { ctx } = makeMockContext();
      ctx.el.dataset.value = 'Hello **world**';
      MarkdownInputHook.mounted.call(ctx as never);

      expect(ctx.el.setValue).toHaveBeenCalledWith('Hello **world**');
    });

    test('sets empty string when data-value is missing', () => {
      const { ctx } = makeMockContext();
      MarkdownInputHook.mounted.call(ctx as never);

      expect(ctx.el.setValue).toHaveBeenCalledWith('');
    });

    test('registers change event listener', () => {
      const { ctx } = makeMockContext();
      MarkdownInputHook.mounted.call(ctx as never);

      expect(ctx.el.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    test('pushes content_changed on change event', () => {
      const { ctx, listeners } = makeMockContext();
      MarkdownInputHook.mounted.call(ctx as never);

      // Simulate change event
      const event = new CustomEvent('change', { detail: { value: 'new text' } });
      listeners['change'](event);

      expect(ctx.pushEvent).toHaveBeenCalledWith('content_changed', { value: 'new text' });
    });

    test('registers upload-start event listener', () => {
      const { ctx } = makeMockContext();
      MarkdownInputHook.mounted.call(ctx as never);

      expect(ctx.el.addEventListener).toHaveBeenCalledWith('upload-start', expect.any(Function));
    });

    test('pushes upload_file on upload-start event', () => {
      const { ctx, listeners } = makeMockContext();
      MarkdownInputHook.mounted.call(ctx as never);

      const file = new File(['content'], 'photo.png', { type: 'image/png' });
      const event = new CustomEvent('upload-start', { detail: { file } });
      listeners['upload-start'](event);

      expect(ctx.pushEvent).toHaveBeenCalledWith('upload_file', { name: 'photo.png' });
    });
  });

  describe('updated', () => {
    let ctx: ReturnType<typeof makeMockContext>['ctx'];

    beforeEach(() => {
      ({ ctx } = makeMockContext());
    });

    test('sets value when data-value differs from current', () => {
      ctx.el.dataset.value = 'server value';
      ctx.el.getValue = mock(() => 'old value');

      MarkdownInputHook.updated.call(ctx as never);

      expect(ctx.el.setValue).toHaveBeenCalledWith('server value');
    });

    test('does not set value when data-value matches current', () => {
      ctx.el.dataset.value = 'same';
      ctx.el.getValue = mock(() => 'same');

      MarkdownInputHook.updated.call(ctx as never);

      expect(ctx.el.setValue).not.toHaveBeenCalled();
    });

    test('does not set value when data-value is undefined', () => {
      // dataset.value is undefined (attribute not present)
      ctx.el.getValue = mock(() => 'anything');

      MarkdownInputHook.updated.call(ctx as never);

      expect(ctx.el.setValue).not.toHaveBeenCalled();
    });
  });
});
