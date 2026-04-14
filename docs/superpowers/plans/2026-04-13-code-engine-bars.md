# Code Engine Topbar & Bottombar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add opt-in topbar and bottombar to `el-dm-code-engine` with default VS Code-style content and slot-based customization.

**Architecture:** Extend the existing `ElDmCodeEngine` class with three new reactive properties (`showTopbar`, `showBottombar`, `title`), two named slots (`topbar`, `bottombar`), and cursor-position tracking via CodeMirror's `updateListener`. Default bar content is rendered inline in the shadow DOM; named slots replace the defaults when populated.

**Tech Stack:** TypeScript, `@duskmoon-dev/el-base` (BaseElement, css), `@duskmoon-dev/code-engine` (EditorView, undo/redo commands), `bun test` for testing.

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Modify | `elements/code-engine/src/el-dm-code-engine.ts` | Add properties, slots, bar rendering, cursor tracking, action handlers |
| Create | `elements/code-engine/src/el-dm-code-engine.test.ts` | Tests for bars, slots, actions, cursor tracking |
| Modify | `packages/docs/src/content/docs/components/code-engine.mdx` | Document new attributes, slots, events, CSS parts |

---

### Task 1: Add New Reactive Properties

**Files:**
- Modify: `elements/code-engine/src/el-dm-code-engine.ts:141-148`

- [ ] **Step 1: Add `showTopbar`, `showBottombar`, and `title` properties to the static properties definition**

In `elements/code-engine/src/el-dm-code-engine.ts`, add three properties to the `static properties` block:

```typescript
static properties = {
  language: { type: String, reflect: true },
  readonly: { type: Boolean, reflect: true },
  theme: { type: String, reflect: true, default: 'duskmoon' },
  wrap: { type: Boolean, reflect: true },
  showTopbar: { type: Boolean, reflect: true },
  showBottombar: { type: Boolean, reflect: true },
  title: { type: String, reflect: true },
};

declare language: string;
declare readonly: boolean;
declare theme: CodeEngineTheme;
declare wrap: boolean;
declare showTopbar: boolean;
declare showBottombar: boolean;
declare title: string;
```

- [ ] **Step 2: Run typecheck to verify properties compile**

Run: `bun run --filter @duskmoon-dev/el-code-engine typecheck`
Expected: No errors (new properties have no usage yet, just declarations).

- [ ] **Step 3: Commit**

```bash
git add elements/code-engine/src/el-dm-code-engine.ts
git commit -m "feat(code-engine): add showTopbar, showBottombar, title properties"
```

---

### Task 2: Add Bar Styles

**Files:**
- Modify: `elements/code-engine/src/el-dm-code-engine.ts:108-139`

- [ ] **Step 1: Add topbar and bottombar CSS to the `styles` constant**

In `elements/code-engine/src/el-dm-code-engine.ts`, extend the `styles` template literal after the existing `.cm-host .cm-editor.cm-focused` rule:

```typescript
const styles = css`
  :host {
    display: block;
    min-height: 200px;
    font-family: var(
      --dm-font-mono,
      ui-monospace,
      'Cascadia Code',
      'Source Code Pro',
      Menlo,
      Consolas,
      'DejaVu Sans Mono',
      monospace
    );
  }

  :host([hidden]) {
    display: none !important;
  }

  .cm-host {
    height: 100%;
  }

  .cm-host .cm-editor {
    height: 100%;
  }

  .cm-host .cm-editor.cm-focused {
    outline: none;
  }

  /* ── Topbar ────────────────────────────────────────── */

  .topbar {
    display: none;
  }

  :host([show-topbar]) .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    border-bottom: 1px solid var(--dm-border, #e0e0e0);
    background: var(--dm-surface-container, #f0f0f0);
    font-size: 0.75rem;
    color: var(--dm-on-surface, #1a1a1a);
  }

  .topbar-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .lang-badge {
    padding: 0.0625rem 0.375rem;
    border-radius: var(--dm-radius-sm, 0.25rem);
    background: var(--dm-primary, #6750a4);
    color: var(--dm-on-primary, #fff);
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .topbar-title {
    opacity: 0.7;
    font-size: 0.6875rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .bar-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    border: none;
    border-radius: var(--dm-radius-sm, 0.25rem);
    background: transparent;
    color: var(--dm-on-surface-variant, #555);
    font-family: inherit;
    font-size: 0.75rem;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }

  .bar-btn:hover {
    background: var(--dm-surface-container-high, #e0e0e0);
    color: var(--dm-on-surface, #1a1a1a);
  }

  .bar-btn svg {
    width: 14px;
    height: 14px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* ── Bottombar ─────────────────────────────────────── */

  .bottombar {
    display: none;
  }

  :host([show-bottombar]) .bottombar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.25rem 0.75rem;
    border-top: 1px solid var(--dm-border, #e0e0e0);
    background: var(--dm-surface-container-high, #e0e0e0);
    font-size: 0.625rem;
    color: var(--dm-on-surface-variant, #555);
  }

  .bottombar-left,
  .bottombar-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  /* ── Fullscreen ────────────────────────────────────── */

  :host(.fullscreen) {
    position: fixed !important;
    inset: 0 !important;
    z-index: 9999 !important;
    min-height: 100vh !important;
  }

  :host(.fullscreen) .cm-host {
    flex: 1;
  }

  :host(.fullscreen) {
    display: flex;
    flex-direction: column;
  }
`;
```

- [ ] **Step 2: Run typecheck**

Run: `bun run --filter @duskmoon-dev/el-code-engine typecheck`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add elements/code-engine/src/el-dm-code-engine.ts
git commit -m "style(code-engine): add topbar and bottombar CSS"
```

---

### Task 3: Add Language Badge Map and SVG Icons

**Files:**
- Modify: `elements/code-engine/src/el-dm-code-engine.ts` (add constants after `LANG_LOADERS`)

- [ ] **Step 1: Add the language badge map and icon SVGs**

Add these constants after the `LANG_LOADERS` block (before `export type CodeEngineTheme`):

```typescript
const LANG_BADGES: Record<string, string> = {
  javascript: 'JS',
  typescript: 'TS',
  python: 'PY',
  rust: 'RS',
  go: 'GO',
  java: 'JAVA',
  cpp: 'C++',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  markdown: 'MD',
  sql: 'SQL',
  yaml: 'YAML',
  xml: 'XML',
  php: 'PHP',
  elixir: 'EX',
  erlang: 'ERL',
  heex: 'HEEX',
  dart: 'DART',
  zig: 'ZIG',
  vue: 'VUE',
  angular: 'NG',
  sass: 'SASS',
  less: 'LESS',
  wast: 'WAST',
  lezer: 'LEZER',
  caddyfile: 'CADDY',
  jinja: 'JINJA',
  liquid: 'LIQUID',
};

const LANG_NAMES: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  rust: 'Rust',
  go: 'Go',
  java: 'Java',
  cpp: 'C++',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  markdown: 'Markdown',
  sql: 'SQL',
  yaml: 'YAML',
  xml: 'XML',
  php: 'PHP',
  elixir: 'Elixir',
  erlang: 'Erlang',
  heex: 'HEEx',
  dart: 'Dart',
  zig: 'Zig',
  vue: 'Vue',
  angular: 'Angular',
  sass: 'Sass',
  less: 'Less',
  wast: 'WAT',
  lezer: 'Lezer',
  caddyfile: 'Caddyfile',
  jinja: 'Jinja',
  liquid: 'Liquid',
};

// ── SVG Icons (14×14, stroke-based) ──

const ICON_UNDO = `<svg viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`;

const ICON_REDO = `<svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`;

const ICON_WRAP = `<svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><path d="M3 12h15a3 3 0 1 1 0 6h-4"/><polyline points="16 16 14 18 16 20"/><line x1="3" y1="18" x2="10" y2="18"/></svg>`;

const ICON_COPY = `<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;

const ICON_CHECK = `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`;

const ICON_FULLSCREEN = `<svg viewBox="0 0 24 24"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;

const ICON_EXIT_FULLSCREEN = `<svg viewBox="0 0 24 24"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;
```

- [ ] **Step 2: Commit**

```bash
git add elements/code-engine/src/el-dm-code-engine.ts
git commit -m "feat(code-engine): add language badge map and SVG icons"
```

---

### Task 4: Render Topbar and Bottombar in Shadow DOM

**Files:**
- Modify: `elements/code-engine/src/el-dm-code-engine.ts` (update `render()` and add bar rendering methods)

- [ ] **Step 1: Import `undo` and `redo` from code-engine commands**

Add this import at the top of the file, alongside the existing imports:

```typescript
import { undo, redo } from '@duskmoon-dev/code-engine/commands';
```

- [ ] **Step 2: Add cursor tracking fields and fullscreen state**

Add these private fields to the `ElDmCodeEngine` class, after the existing `#langCache` field:

```typescript
#cursorLine = 1;
#cursorCol = 1;
#lineCount = 0;
#isFullscreen = false;
```

- [ ] **Step 3: Add bar rendering helper methods**

Add these methods to `ElDmCodeEngine`, before the existing `// ── Private helpers` section:

```typescript
#renderTopbar(): string {
  const badge = this.language
    ? `<span class="lang-badge">${LANG_BADGES[this.language] ?? this.language.toUpperCase()}</span>`
    : '';
  const title = (this as unknown as { title: string }).title
    ? `<span class="topbar-title">${(this as unknown as { title: string }).title}</span>`
    : '';
  return `
    <div class="topbar" part="topbar">
      <slot name="topbar">
        <div class="topbar-left">${badge}${title}</div>
        <div class="topbar-right">
          <button class="bar-btn" data-action="undo" title="Undo">${ICON_UNDO}</button>
          <button class="bar-btn" data-action="redo" title="Redo">${ICON_REDO}</button>
          <button class="bar-btn" data-action="wrap" title="Toggle line wrap">${ICON_WRAP}</button>
          <button class="bar-btn" data-action="copy" title="Copy">${ICON_COPY}</button>
          <button class="bar-btn" data-action="fullscreen" title="Toggle fullscreen">${this.#isFullscreen ? ICON_EXIT_FULLSCREEN : ICON_FULLSCREEN}</button>
        </div>
      </slot>
    </div>
  `;
}

#renderBottombar(): string {
  const langName = this.language
    ? (LANG_NAMES[this.language] ?? this.language)
    : '';
  return `
    <div class="bottombar" part="bottombar">
      <slot name="bottombar">
        <div class="bottombar-left">
          <span class="cursor-pos">Ln ${this.#cursorLine}, Col ${this.#cursorCol}</span>
          <span class="line-count">${this.#lineCount} lines</span>
        </div>
        <div class="bottombar-right">
          <span>UTF-8</span>
          ${langName ? `<span>${langName}</span>` : ''}
        </div>
      </slot>
    </div>
  `;
}
```

- [ ] **Step 4: Update the `render()` method to include bars**

Replace the existing `render()` method:

```typescript
protected render(): string {
  return `${this.#renderTopbar()}<div class="cm-host" part="editor"></div>${this.#renderBottombar()}`;
}
```

- [ ] **Step 5: Run typecheck**

Run: `bun run --filter @duskmoon-dev/el-code-engine typecheck`
Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add elements/code-engine/src/el-dm-code-engine.ts
git commit -m "feat(code-engine): render topbar and bottombar in shadow DOM"
```

---

### Task 5: Wire Up Action Handlers and Cursor Tracking

**Files:**
- Modify: `elements/code-engine/src/el-dm-code-engine.ts` (add event listeners and cursor tracking)

- [ ] **Step 1: Add the click handler for bar actions**

Add this method to `ElDmCodeEngine`:

```typescript
#handleBarAction(action: string): void {
  switch (action) {
    case 'undo':
      if (this.#editor) undo(this.#editor);
      break;
    case 'redo':
      if (this.#editor) redo(this.#editor);
      break;
    case 'wrap':
      this.wrap = !this.wrap;
      break;
    case 'copy':
      void this.#handleCopy();
      break;
    case 'fullscreen':
      this.#toggleFullscreen();
      break;
  }
}

async #handleCopy(): Promise<void> {
  const value = this.value;
  try {
    await navigator.clipboard.writeText(value);
    this.emit('copy', { value });
    this.#showCopyFeedback();
  } catch {
    // Clipboard API unavailable
  }
}

#showCopyFeedback(): void {
  const btn = this.shadowRoot?.querySelector('[data-action="copy"]');
  if (!btn) return;
  btn.innerHTML = ICON_CHECK;
  btn.setAttribute('title', 'Copied!');
  setTimeout(() => {
    btn.innerHTML = ICON_COPY;
    btn.setAttribute('title', 'Copy');
  }, 2000);
}

#toggleFullscreen(): void {
  this.#isFullscreen = !this.#isFullscreen;
  this.classList.toggle('fullscreen', this.#isFullscreen);
  // Update fullscreen button icon
  const btn = this.shadowRoot?.querySelector('[data-action="fullscreen"]');
  if (btn) {
    btn.innerHTML = this.#isFullscreen ? ICON_EXIT_FULLSCREEN : ICON_FULLSCREEN;
    btn.setAttribute('title', this.#isFullscreen ? 'Exit fullscreen' : 'Toggle fullscreen');
  }
  this.emit('fullscreen', { active: this.#isFullscreen });
}
```

- [ ] **Step 2: Add cursor position update method**

```typescript
#updateCursorInfo(state: EditorState): void {
  const pos = state.selection.main.head;
  const line = state.doc.lineAt(pos);
  this.#cursorLine = line.number;
  this.#cursorCol = pos - line.from + 1;
  this.#lineCount = state.doc.lines;

  // Update bottombar spans directly (avoid full re-render)
  const cursorEl = this.shadowRoot?.querySelector('.cursor-pos');
  const lineCountEl = this.shadowRoot?.querySelector('.line-count');
  if (cursorEl) cursorEl.textContent = `Ln ${this.#cursorLine}, Col ${this.#cursorCol}`;
  if (lineCountEl) lineCountEl.textContent = `${this.#lineCount} lines`;
}
```

Note: Add `EditorState` to the existing import from `@duskmoon-dev/code-engine/state` — it's already imported on line 32.

- [ ] **Step 3: Wire the cursor update into the editor's updateListener**

In the `#mountEditor()` method, modify the existing `EditorView.updateListener.of(...)` block to also handle selection changes:

```typescript
EditorView.updateListener.of((update) => {
  if (update.docChanged) {
    this.emit('input', { value: update.state.doc.toString() });
  }
  if (update.docChanged || update.selectionSet) {
    this.#updateCursorInfo(update.state);
  }
}),
```

- [ ] **Step 4: Initialize cursor info after editor mount**

At the end of `#mountEditor()`, after `this.#editor = new EditorView(...)`, add:

```typescript
this.#updateCursorInfo(this.#editor.state);
```

- [ ] **Step 5: Add click delegation in `connectedCallback`**

Override `connectedCallback` to add a click listener for bar actions:

```typescript
connectedCallback(): void {
  super.connectedCallback();
  this.shadowRoot.addEventListener('click', (e) => {
    const btn = (e.target as Element)?.closest('[data-action]');
    if (btn) {
      const action = btn.getAttribute('data-action');
      if (action) this.#handleBarAction(action);
    }
  });
}
```

- [ ] **Step 6: Run typecheck**

Run: `bun run --filter @duskmoon-dev/el-code-engine typecheck`
Expected: No errors.

- [ ] **Step 7: Build the package to verify it compiles**

Run: `bun run --filter @duskmoon-dev/el-code-engine build`
Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add elements/code-engine/src/el-dm-code-engine.ts
git commit -m "feat(code-engine): wire action handlers and cursor tracking"
```

---

### Task 6: Write Tests

**Files:**
- Create: `elements/code-engine/src/el-dm-code-engine.test.ts`

- [ ] **Step 1: Create the test file**

Create `elements/code-engine/src/el-dm-code-engine.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterEach } from 'bun:test';
import { ElDmCodeEngine } from './el-dm-code-engine.js';

// Register the element once
beforeAll(() => {
  if (!customElements.get('el-dm-code-engine')) {
    customElements.define('el-dm-code-engine', ElDmCodeEngine);
  }
});

// Clean up DOM after each test
afterEach(() => {
  document.body.innerHTML = '';
});

function createElement(attrs: Record<string, string | boolean> = {}): ElDmCodeEngine {
  const el = document.createElement('el-dm-code-engine') as ElDmCodeEngine;
  for (const [key, value] of Object.entries(attrs)) {
    if (typeof value === 'boolean') {
      if (value) el.setAttribute(key, '');
    } else {
      el.setAttribute(key, value);
    }
  }
  document.body.appendChild(el);
  return el;
}

describe('ElDmCodeEngine', () => {
  describe('properties', () => {
    it('should have showTopbar default to false', () => {
      const el = createElement();
      expect(el.showTopbar).toBe(false);
    });

    it('should have showBottombar default to false', () => {
      const el = createElement();
      expect(el.showBottombar).toBe(false);
    });

    it('should have title default to undefined', () => {
      const el = createElement();
      expect(el.title).toBeUndefined();
    });

    it('should reflect show-topbar attribute', () => {
      const el = createElement({ 'show-topbar': true });
      expect(el.showTopbar).toBe(true);
      expect(el.hasAttribute('show-topbar')).toBe(true);
    });

    it('should reflect show-bottombar attribute', () => {
      const el = createElement({ 'show-bottombar': true });
      expect(el.showBottombar).toBe(true);
      expect(el.hasAttribute('show-bottombar')).toBe(true);
    });

    it('should reflect title attribute', () => {
      const el = createElement({ title: 'main.js' });
      expect((el as unknown as { title: string }).title).toBe('main.js');
    });
  });

  describe('topbar rendering', () => {
    it('should not render topbar when show-topbar is not set', () => {
      const el = createElement();
      const topbar = el.shadowRoot?.querySelector('.topbar');
      expect(topbar).toBeTruthy();
      // topbar div exists but is display: none via CSS
      expect(el.hasAttribute('show-topbar')).toBe(false);
    });

    it('should render topbar content when show-topbar is set', () => {
      const el = createElement({ 'show-topbar': true, language: 'javascript' });
      const badge = el.shadowRoot?.querySelector('.lang-badge');
      expect(badge?.textContent).toBe('JS');
    });

    it('should render title in topbar', () => {
      const el = createElement({ 'show-topbar': true, title: 'app.ts' });
      const title = el.shadowRoot?.querySelector('.topbar-title');
      expect(title?.textContent).toBe('app.ts');
    });

    it('should render action buttons', () => {
      const el = createElement({ 'show-topbar': true });
      const buttons = el.shadowRoot?.querySelectorAll('.bar-btn');
      expect(buttons?.length).toBe(5); // undo, redo, wrap, copy, fullscreen
    });

    it('should use fallback badge for unknown languages', () => {
      const el = createElement({ 'show-topbar': true, language: 'cobol' });
      const badge = el.shadowRoot?.querySelector('.lang-badge');
      expect(badge?.textContent).toBe('COBOL');
    });
  });

  describe('bottombar rendering', () => {
    it('should render bottombar content when show-bottombar is set', () => {
      const el = createElement({ 'show-bottombar': true, language: 'python' });
      const rightSide = el.shadowRoot?.querySelector('.bottombar-right');
      expect(rightSide?.textContent).toContain('Python');
      expect(rightSide?.textContent).toContain('UTF-8');
    });

    it('should show default cursor position', () => {
      const el = createElement({ 'show-bottombar': true });
      const cursorPos = el.shadowRoot?.querySelector('.cursor-pos');
      expect(cursorPos?.textContent).toContain('Ln');
      expect(cursorPos?.textContent).toContain('Col');
    });

    it('should show line count', () => {
      const el = createElement({ 'show-bottombar': true });
      const lineCount = el.shadowRoot?.querySelector('.line-count');
      expect(lineCount?.textContent).toContain('lines');
    });
  });

  describe('slots', () => {
    it('should have topbar slot', () => {
      const el = createElement({ 'show-topbar': true });
      const slot = el.shadowRoot?.querySelector('slot[name="topbar"]');
      expect(slot).toBeTruthy();
    });

    it('should have bottombar slot', () => {
      const el = createElement({ 'show-bottombar': true });
      const slot = el.shadowRoot?.querySelector('slot[name="bottombar"]');
      expect(slot).toBeTruthy();
    });
  });

  describe('CSS parts', () => {
    it('should expose topbar part', () => {
      const el = createElement({ 'show-topbar': true });
      const part = el.shadowRoot?.querySelector('[part="topbar"]');
      expect(part).toBeTruthy();
    });

    it('should expose bottombar part', () => {
      const el = createElement({ 'show-bottombar': true });
      const part = el.shadowRoot?.querySelector('[part="bottombar"]');
      expect(part).toBeTruthy();
    });

    it('should expose editor part', () => {
      const el = createElement();
      const part = el.shadowRoot?.querySelector('[part="editor"]');
      expect(part).toBeTruthy();
    });
  });

  describe('backwards compatibility', () => {
    it('should render only cm-host when no bars enabled', () => {
      const el = createElement({ language: 'javascript' });
      const topbar = el.shadowRoot?.querySelector('.topbar');
      const bottombar = el.shadowRoot?.querySelector('.bottombar');
      const editor = el.shadowRoot?.querySelector('.cm-host');
      // Bars exist in DOM but are hidden via CSS
      expect(topbar).toBeTruthy();
      expect(bottombar).toBeTruthy();
      expect(editor).toBeTruthy();
      // No show attributes
      expect(el.hasAttribute('show-topbar')).toBe(false);
      expect(el.hasAttribute('show-bottombar')).toBe(false);
    });
  });

  describe('fullscreen', () => {
    it('should toggle fullscreen class', () => {
      const el = createElement({ 'show-topbar': true });
      const btn = el.shadowRoot?.querySelector('[data-action="fullscreen"]') as HTMLButtonElement;
      btn?.click();
      expect(el.classList.contains('fullscreen')).toBe(true);
      btn?.click();
      expect(el.classList.contains('fullscreen')).toBe(false);
    });
  });

  describe('wrap toggle', () => {
    it('should toggle wrap attribute', () => {
      const el = createElement({ 'show-topbar': true });
      expect(el.wrap).toBeFalsy();
      const btn = el.shadowRoot?.querySelector('[data-action="wrap"]') as HTMLButtonElement;
      btn?.click();
      expect(el.wrap).toBe(true);
    });
  });
});
```

- [ ] **Step 2: Run the tests**

Run: `bun run --filter @duskmoon-dev/el-code-engine test`
Expected: All tests pass. (Note: CodeMirror editor won't fully mount in happy-dom, but property/rendering tests should work since they test shadow DOM HTML output.)

- [ ] **Step 3: Fix any failing tests**

Adjust tests if happy-dom limitations cause issues (e.g. CodeMirror mount failures are expected — tests focus on bar rendering, not editor behavior).

- [ ] **Step 4: Commit**

```bash
git add elements/code-engine/src/el-dm-code-engine.test.ts
git commit -m "test(code-engine): add tests for topbar and bottombar"
```

---

### Task 7: Update Documentation

**Files:**
- Modify: `packages/docs/src/content/docs/components/code-engine.mdx`

- [ ] **Step 1: Add topbar and bottombar documentation**

Add the following sections to the docs page after the existing "Features" section:

```markdown
## Topbar & Bottombar

The code engine supports opt-in topbar and bottombar with VS Code-style defaults. Enable them with `show-topbar` and `show-bottombar` attributes.

### Default Bars

```html
<el-dm-code-engine
  language="javascript"
  title="main.js"
  show-topbar
  show-bottombar
  value="const x = 42;"
></el-dm-code-engine>
```

The topbar shows a language badge, title, and action buttons (undo, redo, wrap toggle, copy, fullscreen). The bottombar shows cursor position, line count, encoding, and language name.

### Custom Bars via Slots

Replace default bar content using named slots:

```html
<el-dm-code-engine language="rust" show-topbar show-bottombar>
  <div slot="topbar">
    <span>My Custom Toolbar</span>
    <button>Run</button>
    <button>Format</button>
  </div>
  <div slot="bottombar">
    <span>Custom Status Bar</span>
  </div>
</el-dm-code-engine>
```
```

- [ ] **Step 2: Update the Properties table to include new attributes**

Add `show-topbar`, `show-bottombar`, and `title` to the properties/attributes table in the docs.

- [ ] **Step 3: Update the Events table to include `copy` and `fullscreen`**

Add the new events to the events table.

- [ ] **Step 4: Add CSS Parts section with `topbar`, `bottombar`, `editor`**

- [ ] **Step 5: Add Slots section with `topbar` and `bottombar`**

- [ ] **Step 6: Commit**

```bash
git add packages/docs/src/content/docs/components/code-engine.mdx
git commit -m "docs(code-engine): document topbar and bottombar features"
```

---

### Task 8: Final Build and Lint Check

**Files:**
- All modified files

- [ ] **Step 1: Run full build**

Run: `bun run build:all`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Run typecheck**

Run: `bun run typecheck`
Expected: No type errors.

- [ ] **Step 3: Run lint**

Run: `bun run lint:check`
Expected: No lint errors.

- [ ] **Step 4: Run format check**

Run: `bun run format:check`
Expected: No format issues (or run `bun run format` to fix).

- [ ] **Step 5: Run all tests**

Run: `bun run test`
Expected: All tests pass.

- [ ] **Step 6: Commit any remaining fixes**

```bash
git add -A
git commit -m "chore(code-engine): fix lint and format issues"
```
