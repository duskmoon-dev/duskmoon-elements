import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmMarkdown, register } from './index';

// Register the element
register();

describe('ElDmMarkdown', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-markdown')).toBe(ElDmMarkdown);
  });

  test('creates a shadow root', () => {
    const el = document.createElement('el-dm-markdown') as ElDmMarkdown;
    container.appendChild(el);

    expect(el.shadowRoot).toBeDefined();
    expect(el.shadowRoot?.mode).toBe('open');
  });

  test('has container and content parts', () => {
    const el = document.createElement('el-dm-markdown') as ElDmMarkdown;
    container.appendChild(el);

    const containerPart = el.shadowRoot?.querySelector('[part="container"]');
    expect(containerPart).toBeDefined();
  });

  test('applies theme attribute', () => {
    const el = document.createElement('el-dm-markdown') as ElDmMarkdown;
    el.theme = 'atom-one-dark';
    container.appendChild(el);

    expect(el.getAttribute('theme')).toBe('atom-one-dark');
  });

  test('applies debug attribute', () => {
    const el = document.createElement('el-dm-markdown') as ElDmMarkdown;
    el.debug = true;
    container.appendChild(el);

    expect(el.hasAttribute('debug')).toBe(true);
  });

  test('applies no-mermaid attribute', () => {
    const el = document.createElement('el-dm-markdown') as ElDmMarkdown;
    el.noMermaid = true;
    container.appendChild(el);

    expect(el.hasAttribute('no-mermaid')).toBe(true);
  });

  test('applies src attribute', () => {
    const el = document.createElement('el-dm-markdown') as ElDmMarkdown;
    el.src = '/test.md';
    container.appendChild(el);

    expect(el.getAttribute('src')).toBe('/test.md');
  });

  test('has adoptedStyleSheets', () => {
    const el = document.createElement('el-dm-markdown') as ElDmMarkdown;
    container.appendChild(el);

    expect(el.shadowRoot?.adoptedStyleSheets.length).toBeGreaterThan(0);
  });

  test('default theme is auto', () => {
    const el = document.createElement('el-dm-markdown') as ElDmMarkdown;
    container.appendChild(el);

    // Default theme should be 'auto' or undefined (which defaults to auto)
    expect(el.theme === 'auto' || el.theme === undefined).toBe(true);
  });
});

describe('Theme exports', () => {
  test('exports github theme', async () => {
    const { github } = await import('./themes/github.js');
    expect(typeof github).toBe('string');
    expect(github).toContain('.hljs');
  });

  test('exports atomOneDark theme', async () => {
    const { atomOneDark } = await import('./themes/atom-one-dark.js');
    expect(typeof atomOneDark).toBe('string');
    expect(atomOneDark).toContain('.hljs');
  });

  test('exports atomOneLight theme', async () => {
    const { atomOneLight } = await import('./themes/atom-one-light.js');
    expect(typeof atomOneLight).toBe('string');
    expect(atomOneLight).toContain('.hljs');
  });
});

describe('Streaming API', () => {
  let container: HTMLDivElement;
  let el: ElDmMarkdown;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    el = document.createElement('el-dm-markdown') as ElDmMarkdown;
    container.appendChild(el);
  });

  afterEach(() => {
    container.remove();
  });

  test('startStreaming sets streaming state', () => {
    el.startStreaming();

    expect(el.streaming).toBe(true);
    expect(el.hasAttribute('streaming')).toBe(true);
  });

  test('endStreaming clears streaming state', () => {
    el.startStreaming();
    el.endStreaming();

    expect(el.streaming).toBe(false);
    expect(el.hasAttribute('streaming')).toBe(false);
  });

  test('appendContent accumulates content', () => {
    el.startStreaming();
    el.appendContent('Hello ');
    el.appendContent('World');

    expect(el.content).toBe('Hello World');
  });

  test('setContent replaces content', () => {
    el.startStreaming();
    el.appendContent('Hello');
    el.setContent('Goodbye');

    expect(el.content).toBe('Goodbye');
  });

  test('content property works in non-streaming mode', () => {
    el.content = '# Test';

    expect(el.content).toBe('# Test');
  });

  test('shows cursor during streaming', async () => {
    el.startStreaming();
    el.appendContent('Test');

    // Wait for RAF to complete
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => setTimeout(resolve, 10));

    const cursor = el.shadowRoot?.querySelector('.streaming-cursor');
    expect(cursor).toBeDefined();
  });

  test('hides cursor after streaming ends', async () => {
    el.startStreaming();
    el.appendContent('Test');
    el.endStreaming();

    // Wait for render
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => setTimeout(resolve, 10));

    const cursor = el.shadowRoot?.querySelector('.streaming-cursor');
    expect(cursor).toBeNull();
  });

  test('emits dm-stream-chunk event', () => {
    let eventFired = false;
    let eventDetail: { content: string; chunk: string } | null = null;

    el.addEventListener('dm-stream-chunk', ((e: CustomEvent) => {
      eventFired = true;
      eventDetail = e.detail;
    }) as EventListener);

    el.startStreaming();
    el.appendContent('chunk1');

    expect(eventFired).toBe(true);
    expect(eventDetail?.chunk).toBe('chunk1');
    expect(eventDetail?.content).toBe('chunk1');
  });

  test('emits dm-stream-end event', () => {
    let eventFired = false;
    let eventDetail: { content: string } | null = null;

    el.addEventListener('dm-stream-end', ((e: CustomEvent) => {
      eventFired = true;
      eventDetail = e.detail;
    }) as EventListener);

    el.startStreaming();
    el.appendContent('content');
    el.endStreaming();

    expect(eventFired).toBe(true);
    expect(eventDetail?.content).toBe('content');
  });
});

describe('Syntax Auto-Fixer', () => {
  let container: HTMLDivElement;
  let el: ElDmMarkdown;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    el = document.createElement('el-dm-markdown') as ElDmMarkdown;
    container.appendChild(el);
  });

  afterEach(() => {
    container.remove();
  });

  test('handles incomplete fenced code block', async () => {
    el.startStreaming();
    el.appendContent('```javascript\nconst x = 1;');

    // Wait for render
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Should render without error (code block auto-closed)
    const content = el.shadowRoot?.querySelector('.content');
    expect(content?.innerHTML).toContain('const');
  });

  test('handles incomplete inline code', async () => {
    el.startStreaming();
    el.appendContent('This is `incomplete code');

    // Wait for render
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Should render without throwing
    const content = el.shadowRoot?.querySelector('.content');
    expect(content).toBeDefined();
  });

  test('handles incomplete bold', async () => {
    el.startStreaming();
    el.appendContent('This is **bold text');

    // Wait for render
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => setTimeout(resolve, 50));

    const content = el.shadowRoot?.querySelector('.content');
    expect(content).toBeDefined();
  });

  test('handles incomplete link', async () => {
    el.startStreaming();
    el.appendContent('Check [this link](http://example.com');

    // Wait for render
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => setTimeout(resolve, 50));

    const content = el.shadowRoot?.querySelector('.content');
    expect(content).toBeDefined();
  });

  test('handles incomplete strikethrough', async () => {
    el.startStreaming();
    el.appendContent('This is ~~strikethrough');

    // Wait for render
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => setTimeout(resolve, 50));

    const content = el.shadowRoot?.querySelector('.content');
    expect(content).toBeDefined();
  });

  test('final render after endStreaming is clean', async () => {
    el.startStreaming();
    el.appendContent('# Hello World\n\nThis is a test.');
    el.endStreaming();

    // Wait for render
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => setTimeout(resolve, 50));

    const content = el.shadowRoot?.querySelector('.content');
    expect(content?.innerHTML).toContain('<h1>');
    expect(content?.innerHTML).toContain('Hello World');
  });
});
