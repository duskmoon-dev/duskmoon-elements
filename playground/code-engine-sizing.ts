import {
  register,
  type ElDmCodeEngine,
  type CodeEngineTheme,
} from '../elements/code-engine/src/index.js';
import { sunshineColor } from '@duskmoon-dev/code-engine/theme/sunshine';
import { moonlightColor } from '@duskmoon-dev/code-engine/theme/moonlight';
import { color as oneDarkColor } from '@duskmoon-dev/code-engine/theme/one-dark';

interface SizingResult {
  name: string;
  passed: boolean;
  error?: string;
}

declare global {
  interface Window {
    codeEngineSizingResults: SizingResult[];
  }
}

register();
window.codeEngineSizingResults = [];
const fixture = document.querySelector<HTMLDivElement>('#fixture')!;
const output = document.querySelector<HTMLPreElement>('#results')!;
const longDocument = Array.from(
  { length: 100 },
  (_, index) => `const line${index} = ${index};`,
).join('\n');
const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function near(actual: number, expected: number, message: string): void {
  assert(Math.abs(actual - expected) <= 2, `${message}: expected ${expected}px, got ${actual}px`);
}

function part(editor: ElDmCodeEngine, selector: string): HTMLElement {
  const element = editor.shadowRoot!.querySelector<HTMLElement>(selector);
  assert(Boolean(element), `Missing ${selector}`);
  return element!;
}

async function waitFor(predicate: () => boolean, message: string): Promise<void> {
  const deadline = performance.now() + 5000;
  let stableFrames = 0;
  while (stableFrames < 3) {
    assert(performance.now() < deadline, `Timed out: ${message}`);
    stableFrames = predicate() ? stableFrames + 1 : 0;
    await frame();
  }
}

async function waitForTheme(editor: ElDmCodeEngine, theme: CodeEngineTheme): Promise<void> {
  const backgrounds: Record<CodeEngineTheme, string> = {
    duskmoon: getComputedStyle(editor).getPropertyValue('--color-surface'),
    sunshine: sunshineColor.background,
    moonlight: moonlightColor.background,
    'one-dark': oneDarkColor.background,
  };
  // Let the browser normalize hex and OKLCH using the same serialization as CodeMirror.
  const probe = document.createElement('span');
  probe.style.backgroundColor = backgrounds[theme];
  fixture.append(probe);
  const expected = getComputedStyle(probe).backgroundColor;
  probe.remove();
  await waitFor(() => {
    const nativeEditor = editor.shadowRoot?.querySelector<HTMLElement>('.cm-editor');
    return Boolean(
      nativeEditor &&
      nativeEditor.classList.length > 1 &&
      getComputedStyle(nativeEditor).backgroundColor === expected,
    );
  }, `${theme} applied background ${expected}`);
}

async function mount(value = '', styles = '', language = ''): Promise<ElDmCodeEngine> {
  const editor = document.createElement('el-dm-code-engine') as ElDmCodeEngine;
  editor.style.cssText = `width: 100%; --color-surface: #fafafa; ${styles}`;
  editor.value = value;
  if (language) editor.language = language;
  fixture.append(editor);
  await document.fonts.ready;
  await waitForTheme(editor, 'duskmoon');
  assert(editor.value === value, 'Initial document was lost during asynchronous mount');
  return editor;
}

function fillsAvailableSpace(editor: ElDmCodeEngine): void {
  const host = editor.getBoundingClientRect();
  const computed = getComputedStyle(editor);
  const inset = (side: 'Top' | 'Bottom') =>
    Number.parseFloat(computed[`border${side}Width`]) +
    Number.parseFloat(computed[`padding${side}`]);
  const barHeight = (selector: string) => part(editor, selector).getBoundingClientRect().height;
  const mountBox = part(editor, '.cm-host').getBoundingClientRect();
  const editorBox = part(editor, '.cm-editor').getBoundingClientRect();
  near(mountBox.top, host.top + inset('Top') + barHeight('.topbar'), 'Editor starts below topbar');
  near(
    mountBox.bottom,
    host.bottom - inset('Bottom') - barHeight('.bottombar'),
    'Editor fills space above bottombar',
  );
  near(editorBox.height, mountBox.height, 'CodeMirror fills its mount');
  near(
    part(editor, '.cm-scroller').getBoundingClientRect().height,
    editorBox.height,
    'Scroller fills CodeMirror',
  );
}

async function check(name: string, run: () => Promise<void>): Promise<void> {
  try {
    await run();
    window.codeEngineSizingResults.push({ name, passed: true });
  } catch (error) {
    window.codeEngineSizingResults.push({ name, passed: false, error: String(error) });
  } finally {
    fixture.replaceChildren();
    output.textContent = window.codeEngineSizingResults
      .map(
        (result) =>
          `${result.passed ? 'PASS' : 'FAIL'} ${result.name}${result.error ? `\n  ${result.error}` : ''}`,
      )
      .join('\n');
  }
}

await check(
  'issue #87: Python one-dark fills its default minimum without an explicit height',
  async () => {
    const editor = document.createElement('el-dm-code-engine') as ElDmCodeEngine;
    editor.setAttribute('language', 'python');
    editor.setAttribute('theme', 'one-dark');
    editor.setAttribute('value', "print('hello')");
    fixture.append(editor);
    await document.fonts.ready;
    await waitForTheme(editor, 'one-dark');
    near(editor.getBoundingClientRect().height, 200, 'Default host minimum height');
    fillsAvailableSpace(editor);
    assert(editor.value === "print('hello')", 'Initial Python document was lost');
    assert(
      editor.shadowRoot!.querySelectorAll('.cm-editor').length === 1,
      'Expected exactly one editor',
    );
  },
);

for (const [label, value] of [
  ['empty', ''],
  ['one line', 'const answer = 42;'],
]) {
  for (const minimum of [200, 320]) {
    await check(`${label}: ${minimum === 200 ? 'default' : 'custom'} minimum height`, async () => {
      const editor = await mount(value, minimum === 200 ? '' : `min-height: ${minimum}px;`);
      near(editor.getBoundingClientRect().height, minimum, 'Host minimum height');
      fillsAvailableSpace(editor);
    });
  }
}

await check('explicit height and resize preserve the editor and document', async () => {
  const value = 'const unchanged = true;';
  const editor = await mount(value, 'height: 360px;');
  const nativeEditor = part(editor, '.cm-editor');
  for (const height of [360, 480, 260]) {
    editor.style.height = `${height}px`;
    await frame();
    await frame();
    near(editor.getBoundingClientRect().height, height, 'Explicit host height');
    fillsAvailableSpace(editor);
    assert(part(editor, '.cm-editor') === nativeEditor, 'Resize replaced the editor');
    assert(editor.value === value, 'Resize changed the document');
  }
});

await check('auto height grows for a long document', async () => {
  const editor = await mount(longDocument);
  assert(editor.getBoundingClientRect().height > 400, 'Unconstrained document did not grow');
  fillsAvailableSpace(editor);
});

for (const constraint of ['height: 280px;', 'max-height: 280px;']) {
  await check(`long document scrolls with ${constraint}`, async () => {
    const editor = await mount(longDocument, constraint);
    assert(editor.getBoundingClientRect().height <= 282, 'Constrained host grew with document');
    fillsAvailableSpace(editor);
    const scroller = part(editor, '.cm-scroller');
    assert(
      scroller.scrollHeight > scroller.clientHeight + 100,
      'Native scroller does not overflow',
    );
    scroller.scrollTop = 100;
    await frame();
    assert(scroller.scrollTop > 0, 'Native scroller cannot scroll');
  });
}

await check('topbar and bottombar retain their space when toggled', async () => {
  const editor = await mount('const bars = true;', 'height: 300px;');
  const nativeEditor = part(editor, '.cm-editor');
  for (const [top, bottom] of [
    [true, false],
    [false, true],
    [true, true],
    [false, false],
  ]) {
    editor.showTopbar = top;
    editor.showBottombar = bottom;
    await frame();
    await frame();
    assert(part(editor, '.topbar').getBoundingClientRect().height > 0 === top, 'Topbar visibility');
    assert(
      part(editor, '.bottombar').getBoundingClientRect().height > 0 === bottom,
      'Bottombar visibility',
    );
    fillsAvailableSpace(editor);
    assert(part(editor, '.cm-editor') === nativeEditor, 'Bar toggle replaced the editor');
  }
});

await check('custom tall bars do not shrink in a constrained editor', async () => {
  const editor = await mount(longDocument, 'height: 300px;');
  for (const [slot, height] of [
    ['topbar', 72],
    ['bottombar', 60],
  ] as const) {
    const bar = document.createElement('div');
    bar.slot = slot;
    bar.style.cssText = `height: ${height}px; width: 100%;`;
    bar.textContent = `Custom ${slot}`;
    editor.append(bar);
  }
  editor.showTopbar = true;
  editor.showBottombar = true;
  await frame();
  await frame();
  assert(part(editor, '.topbar').getBoundingClientRect().height >= 72, 'Tall topbar shrank');
  assert(part(editor, '.bottombar').getBoundingClientRect().height >= 60, 'Tall bottombar shrank');
  fillsAvailableSpace(editor);
});

await check('fullscreen fills the viewport and restores explicit height', async () => {
  const editor = await mount('const fullscreen = true;', 'height: 340px;');
  editor.showTopbar = true;
  editor.showBottombar = true;
  await frame();
  await frame();
  const previous = editor.getBoundingClientRect();
  const nativeEditor = part(editor, '.cm-editor');
  part(editor, '[data-action="fullscreen"]').click();
  await frame();
  await frame();
  const fullscreen = editor.getBoundingClientRect();
  near(fullscreen.top, 0, 'Fullscreen top');
  near(fullscreen.left, 0, 'Fullscreen left');
  near(fullscreen.width, innerWidth, 'Fullscreen width');
  near(fullscreen.height, innerHeight, 'Fullscreen height');
  fillsAvailableSpace(editor);
  part(editor, '[data-action="fullscreen"]').click();
  await frame();
  await frame();
  const restored = editor.getBoundingClientRect();
  near(restored.height, previous.height, 'Restored explicit height');
  near(restored.width, previous.width, 'Restored width');
  near(restored.top, previous.top, 'Restored position');
  fillsAvailableSpace(editor);
  assert(part(editor, '.cm-editor') === nativeEditor, 'Fullscreen replaced the editor');
  assert(editor.value === 'const fullscreen = true;', 'Fullscreen changed the document');
});

await check('all built-in themes preserve native sizing after configuration', async () => {
  // Complete the asynchronous language mount before exercising theme reconfiguration.
  const editor = await mount('const theme = true;', 'height: 300px;', 'javascript');
  const nativeEditor = part(editor, '.cm-editor');
  const themes: CodeEngineTheme[] = ['sunshine', 'moonlight', 'one-dark', 'duskmoon'];
  for (const theme of themes) {
    editor.theme = theme;
    await waitForTheme(editor, theme);
    fillsAvailableSpace(editor);
    near(editor.getBoundingClientRect().height, 300, `${theme} host height`);
    assert(part(editor, '.cm-editor') === nativeEditor, `${theme} replaced the editor`);
    assert(editor.value === 'const theme = true;', `${theme} changed the document`);
  }
});

document.body.dataset.testStatus = window.codeEngineSizingResults.every((result) => result.passed)
  ? 'passed'
  : 'failed';
