import { register, type ElDmButton } from '../elements/button/src/index.js';

interface ReconnectResult {
  name: string;
  passed: boolean;
  error?: string;
}

declare global {
  interface Window {
    buttonReconnectResults: ReconnectResult[];
  }
}

register();
window.buttonReconnectResults = [];
const fixture = document.querySelector<HTMLDivElement>('#fixture')!;
const output = document.querySelector<HTMLPreElement>('#results')!;

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function setup(type: 'submit' | 'reset' = 'submit') {
  const form = document.createElement('form');
  const button = document.createElement('el-dm-button') as ElDmButton;
  button.type = type;
  button.textContent = 'Save';
  form.append(button);
  fixture.append(form);
  let submits = 0;
  let resets = 0;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submits++;
  });
  form.addEventListener('reset', () => resets++);
  return { form, button, submits: () => submits, resets: () => resets };
}

function reconnect(button: ElDmButton, parent: HTMLElement): void {
  button.remove();
  parent.append(button);
}

async function check(name: string, run: () => void | Promise<void>): Promise<void> {
  try {
    await run();
    window.buttonReconnectResults.push({ name, passed: true });
  } catch (error) {
    window.buttonReconnectResults.push({ name, passed: false, error: String(error) });
  } finally {
    fixture.replaceChildren();
    output.textContent = window.buttonReconnectResults
      .map(
        (result) =>
          `${result.passed ? 'PASS' : 'FAIL'} ${result.name}${result.error ? `\n  ${result.error}` : ''}`,
      )
      .join('\n');
  }
}

await check('issue #88: host clicks submit once after every reconnect', () => {
  const { form, button, submits } = setup();
  for (let activation = 1; activation <= 5; activation++) {
    if (activation > 1) reconnect(button, form);
    button.click();
    assert(submits() === activation, `Click ${activation} produced ${submits()} submissions`);
    assert(form.querySelector('button') === null, 'Temporary submitter was not removed');
  }
});

await check('shadow button clicks submit once after every reconnect', () => {
  const { form, button, submits } = setup();
  for (let activation = 1; activation <= 5; activation++) {
    if (activation > 1) reconnect(button, form);
    const nativeButton = button.shadowRoot?.querySelector('button');
    assert(Boolean(nativeButton), 'Missing native button');
    nativeButton!.click();
    assert(submits() === activation, `Click ${activation} produced ${submits()} submissions`);
  }
});

await check('invalid form then valid reconnect submits exactly once', () => {
  const { form, button, submits } = setup();
  const input = document.createElement('input');
  input.required = true;
  form.prepend(input);
  button.click();
  assert(submits() === 0, 'Invalid form was submitted');
  reconnect(button, form);
  input.value = 'valid';
  button.click();
  assert(submits() === 1, `Valid form produced ${submits()} submissions`);
});

await check('external form keeps submitter metadata and removes temporary buttons', () => {
  const { form, button, submits } = setup();
  form.id = 'reconnect-external-form';
  button.setAttribute('form', form.id);
  button.setAttribute('name', 'action');
  button.setAttribute('value', 'save');
  const submitters: HTMLButtonElement[] = [];
  form.addEventListener('submit', (event) => {
    const submitter = event.submitter;
    assert(submitter instanceof HTMLButtonElement, 'Missing native submitter');
    submitters.push(submitter);
  });
  for (let activation = 1; activation <= 3; activation++) {
    reconnect(button, fixture);
    button.click();
    assert(submits() === activation, `Click ${activation} produced ${submits()} submissions`);
    const submitter = submitters.at(-1);
    assert(submitter?.name === 'action' && submitter.value === 'save', 'Submitter data changed');
    assert(!submitter.isConnected, 'Temporary submitter remains connected');
    assert(form.querySelector('button') === null, 'Temporary submitter remains in form');
  }
});

await check('reset buttons reset once after every reconnect', () => {
  const { form, button, resets } = setup('reset');
  const input = document.createElement('input');
  input.defaultValue = 'initial';
  form.prepend(input);
  for (let activation = 1; activation <= 5; activation++) {
    if (activation > 1) reconnect(button, form);
    input.value = 'edited';
    button.click();
    assert(resets() === activation, `Click ${activation} produced ${resets()} resets`);
    assert(input.value === 'initial', 'Form value was not reset');
  }
});

await check(
  'disabled and loading reconnects stay inert before one enabled submission',
  async () => {
    const { form, button, submits } = setup();
    for (const state of ['disabled', 'loading'] as const) {
      button[state] = true;
      reconnect(button, form);
      button.click();
      button.shadowRoot?.querySelector('button')?.click();
      assert(submits() === 0, `${state} button submitted the form`);
      button[state] = false;
    }
    await Promise.resolve();
    button.click();
    assert(submits() === 1, `Enabled button produced ${submits()} submissions`);
  },
);

document.body.dataset.testStatus = window.buttonReconnectResults.every((result) => result.passed)
  ? 'passed'
  : 'failed';
