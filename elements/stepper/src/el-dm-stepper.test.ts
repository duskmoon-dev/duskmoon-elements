import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmStepper, ElDmStep, register } from './index';
import type { StepData } from './index';

register();

const sampleSteps: StepData[] = [
  { label: 'Step 1', description: 'First step' },
  { label: 'Step 2', description: 'Second step' },
  { label: 'Step 3' },
];

function createStepper(props: Partial<ElDmStepper> = {}): ElDmStepper {
  const el = document.createElement('el-dm-stepper') as ElDmStepper;
  Object.assign(el, props);
  return el;
}

function createStep(props: Partial<ElDmStep> = {}): ElDmStep {
  const el = document.createElement('el-dm-step') as ElDmStep;
  Object.assign(el, props);
  return el;
}

describe('ElDmStepper', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  // --- Registration ---
  test('is defined', () => {
    expect(customElements.get('el-dm-stepper')).toBe(ElDmStepper);
  });

  test('step is defined', () => {
    expect(customElements.get('el-dm-step')).toBe(ElDmStep);
  });

  // --- Rendering ---
  test('creates a shadow root with navigation role', () => {
    const el = createStepper();
    container.appendChild(el);
    const nav = el.shadowRoot?.querySelector('[role="navigation"]');
    expect(nav).toBeDefined();
  });

  test('has aria-label', () => {
    const el = createStepper();
    container.appendChild(el);
    const nav = el.shadowRoot?.querySelector('[role="navigation"]');
    expect(nav?.getAttribute('aria-label')).toBe('Progress steps');
  });

  test('renders steps from data', () => {
    const el = createStepper({ steps: sampleSteps });
    container.appendChild(el);
    const steps = el.shadowRoot?.querySelectorAll('.step');
    expect(steps?.length).toBe(3);
  });

  test('renders no steps with empty array', () => {
    const el = createStepper({ steps: [] });
    container.appendChild(el);
    const steps = el.shadowRoot?.querySelectorAll('.step');
    expect(steps?.length).toBe(0);
  });

  test('renders labels', () => {
    const el = createStepper({ steps: sampleSteps });
    container.appendChild(el);
    const labels = el.shadowRoot?.querySelectorAll('.step-label');
    expect(labels?.[0]?.textContent).toBe('Step 1');
    expect(labels?.[1]?.textContent).toBe('Step 2');
  });

  test('renders descriptions', () => {
    const el = createStepper({ steps: sampleSteps });
    container.appendChild(el);
    const descriptions = el.shadowRoot?.querySelectorAll('.step-description');
    expect(descriptions?.length).toBe(2);
    expect(descriptions?.[0]?.textContent).toBe('First step');
  });

  test('renders connectors between steps', () => {
    const el = createStepper({ steps: sampleSteps });
    container.appendChild(el);
    const connectors = el.shadowRoot?.querySelectorAll('.connector');
    expect(connectors?.length).toBe(3);
  });

  // --- Properties ---
  test('defaults current to 0', () => {
    const el = createStepper();
    container.appendChild(el);
    expect(el.current).toBe(0);
  });

  test('defaults orientation to horizontal', () => {
    const el = createStepper();
    container.appendChild(el);
    expect(el.orientation).toBe('horizontal');
  });

  test('defaults color to primary', () => {
    const el = createStepper();
    container.appendChild(el);
    expect(el.color).toBe('primary');
  });

  test('defaults clickable to false', () => {
    const el = createStepper();
    container.appendChild(el);
    expect(el.clickable).toBe(false);
  });

  test('reflects current attribute', () => {
    const el = createStepper({ current: 2 });
    container.appendChild(el);
    expect(el.getAttribute('current')).toBe('2');
  });

  test('reflects orientation attribute', () => {
    const el = createStepper({ orientation: 'vertical' });
    container.appendChild(el);
    expect(el.getAttribute('orientation')).toBe('vertical');
  });

  test('reflects color attribute', () => {
    const el = createStepper({ color: 'success' });
    container.appendChild(el);
    expect(el.getAttribute('color')).toBe('success');
  });

  test('reflects clickable attribute', () => {
    const el = createStepper({ clickable: true });
    container.appendChild(el);
    expect(el.hasAttribute('clickable')).toBe(true);
  });

  // --- Orientation classes ---
  test('applies horizontal orientation class', () => {
    const el = createStepper();
    container.appendChild(el);
    const stepper = el.shadowRoot?.querySelector('.stepper');
    expect(stepper?.classList.contains('stepper--horizontal')).toBe(true);
  });

  test('applies vertical orientation class', () => {
    const el = createStepper({ orientation: 'vertical' });
    container.appendChild(el);
    const stepper = el.shadowRoot?.querySelector('.stepper');
    expect(stepper?.classList.contains('stepper--vertical')).toBe(true);
  });

  // --- Step state classes ---
  test('marks current step', () => {
    const el = createStepper({ steps: sampleSteps, current: 1 });
    container.appendChild(el);
    const steps = el.shadowRoot?.querySelectorAll('.step');
    expect(steps?.[1]?.classList.contains('step--current')).toBe(true);
  });

  test('marks completed steps', () => {
    const el = createStepper({ steps: sampleSteps, current: 2 });
    container.appendChild(el);
    const steps = el.shadowRoot?.querySelectorAll('.step');
    expect(steps?.[0]?.classList.contains('step--completed')).toBe(true);
    expect(steps?.[1]?.classList.contains('step--completed')).toBe(true);
  });

  test('marks upcoming steps', () => {
    const el = createStepper({ steps: sampleSteps, current: 0 });
    container.appendChild(el);
    const steps = el.shadowRoot?.querySelectorAll('.step');
    expect(steps?.[1]?.classList.contains('step--upcoming')).toBe(true);
    expect(steps?.[2]?.classList.contains('step--upcoming')).toBe(true);
  });

  // --- Step indicators ---
  test('current step shows number', () => {
    const el = createStepper({ steps: sampleSteps, current: 0 });
    container.appendChild(el);
    const indicator = el.shadowRoot?.querySelector('.step--current .step-indicator');
    expect(indicator?.textContent?.trim()).toContain('1');
  });

  test('completed step shows checkmark SVG', () => {
    const el = createStepper({ steps: sampleSteps, current: 2 });
    container.appendChild(el);
    const indicator = el.shadowRoot?.querySelector('.step--completed .step-indicator');
    expect(indicator?.innerHTML).toContain('svg');
  });

  test('step with icon shows icon', () => {
    const stepsWithIcon: StepData[] = [
      { label: 'Step 1', icon: '🏠' },
      { label: 'Step 2' },
    ];
    const el = createStepper({ steps: stepsWithIcon, current: 1 });
    container.appendChild(el);
    const icon = el.shadowRoot?.querySelector('.step-icon');
    expect(icon).toBeDefined();
    expect(icon?.textContent).toBe('🏠');
  });

  test('completed step with icon shows icon instead of checkmark', () => {
    const stepsWithIcon: StepData[] = [
      { label: 'Step 1', icon: '✓' },
      { label: 'Step 2' },
    ];
    const el = createStepper({ steps: stepsWithIcon, current: 1 });
    container.appendChild(el);
    const icon = el.shadowRoot?.querySelector('.step--completed .step-icon');
    expect(icon).toBeDefined();
    expect(icon?.textContent).toBe('✓');
  });

  // --- Clickable ---
  test('clickable steps have clickable class', () => {
    const el = createStepper({ steps: sampleSteps, clickable: true });
    container.appendChild(el);
    const steps = el.shadowRoot?.querySelectorAll('.step--clickable');
    expect(steps?.length).toBe(3);
  });

  test('non-clickable steps do not have clickable class', () => {
    const el = createStepper({ steps: sampleSteps });
    container.appendChild(el);
    const steps = el.shadowRoot?.querySelectorAll('.step--clickable');
    expect(steps?.length).toBe(0);
  });

  test('steps have data-step-index', () => {
    const el = createStepper({ steps: sampleSteps });
    container.appendChild(el);
    const steps = el.shadowRoot?.querySelectorAll('[data-step-index]');
    expect(steps?.length).toBe(3);
    expect(steps?.[0]?.getAttribute('data-step-index')).toBe('0');
    expect(steps?.[2]?.getAttribute('data-step-index')).toBe('2');
  });

  // --- Color ---
  test('stepper has color CSS variable', () => {
    const el = createStepper({ color: 'success' });
    container.appendChild(el);
    const stepper = el.shadowRoot?.querySelector('.stepper') as HTMLElement;
    expect(stepper?.getAttribute('style')).toContain('--stepper-color');
  });

  // --- CSS Parts ---
  test('has stepper part', () => {
    const el = createStepper();
    container.appendChild(el);
    expect(el.shadowRoot?.querySelector('[part="stepper"]')).toBeDefined();
  });

  test('has step parts', () => {
    const el = createStepper({ steps: sampleSteps });
    container.appendChild(el);
    expect(el.shadowRoot?.querySelectorAll('[part="step"]')?.length).toBe(3);
  });

  test('has indicator parts', () => {
    const el = createStepper({ steps: sampleSteps });
    container.appendChild(el);
    expect(el.shadowRoot?.querySelectorAll('[part="indicator"]')?.length).toBe(3);
  });

  test('has content parts', () => {
    const el = createStepper({ steps: sampleSteps });
    container.appendChild(el);
    expect(el.shadowRoot?.querySelectorAll('[part="content"]')?.length).toBe(3);
  });

  test('has label parts', () => {
    const el = createStepper({ steps: sampleSteps });
    container.appendChild(el);
    expect(el.shadowRoot?.querySelectorAll('[part="label"]')?.length).toBe(3);
  });

  test('has connector parts', () => {
    const el = createStepper({ steps: sampleSteps });
    container.appendChild(el);
    expect(el.shadowRoot?.querySelectorAll('[part="connector"]')?.length).toBe(3);
  });

  test('has description parts', () => {
    const el = createStepper({ steps: sampleSteps });
    container.appendChild(el);
    expect(el.shadowRoot?.querySelectorAll('[part="description"]')?.length).toBe(2);
  });
});

describe('ElDmStep', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  // --- Rendering ---
  test('creates shadow root with indicator', () => {
    const step = createStep({ label: 'Test' });
    container.appendChild(step);
    expect(step.shadowRoot?.querySelector('.step-indicator')).toBeDefined();
  });

  test('renders label', () => {
    const step = createStep({ label: 'My Step' });
    container.appendChild(step);
    const label = step.shadowRoot?.querySelector('.step-label');
    expect(label?.textContent).toBe('My Step');
  });

  test('renders description', () => {
    const step = createStep({ label: 'Test', description: 'A description' });
    container.appendChild(step);
    const desc = step.shadowRoot?.querySelector('.step-description');
    expect(desc?.textContent).toBe('A description');
  });

  test('no description when not set', () => {
    const step = createStep({ label: 'Test' });
    container.appendChild(step);
    const desc = step.shadowRoot?.querySelector('.step-description');
    expect(desc).toBeNull();
  });

  test('no label when not set', () => {
    const step = createStep();
    container.appendChild(step);
    const label = step.shadowRoot?.querySelector('.step-label');
    expect(label).toBeNull();
  });

  // --- Properties ---
  test('defaults status to upcoming', () => {
    const step = createStep();
    container.appendChild(step);
    expect(step.status).toBe('upcoming');
  });

  test('defaults orientation to horizontal', () => {
    const step = createStep();
    container.appendChild(step);
    expect(step.orientation).toBe('horizontal');
  });

  test('defaults stepNumber to 1', () => {
    const step = createStep();
    container.appendChild(step);
    expect(step.stepNumber).toBe(1);
  });

  // --- Indicator content ---
  test('shows step number for upcoming step', () => {
    const step = createStep({ stepNumber: 3 });
    container.appendChild(step);
    const indicator = step.shadowRoot?.querySelector('.step-indicator');
    expect(indicator?.textContent).toContain('3');
  });

  test('shows checkmark for completed step without icon', () => {
    const step = createStep({ status: 'completed' });
    container.appendChild(step);
    const indicator = step.shadowRoot?.querySelector('.step-indicator');
    expect(indicator?.innerHTML).toContain('svg');
  });

  test('shows icon when set', () => {
    const step = createStep({ icon: '📋' });
    container.appendChild(step);
    const indicator = step.shadowRoot?.querySelector('.step-indicator');
    expect(indicator?.textContent).toContain('📋');
  });

  test('shows icon instead of checkmark for completed with icon', () => {
    const step = createStep({ status: 'completed', icon: '★' });
    container.appendChild(step);
    const indicator = step.shadowRoot?.querySelector('.step-indicator');
    expect(indicator?.textContent).toContain('★');
    expect(indicator?.innerHTML).not.toContain('<svg');
  });

  // --- Slots ---
  test('has default slot', () => {
    const step = createStep();
    container.appendChild(step);
    const slot = step.shadowRoot?.querySelector('slot:not([name])');
    expect(slot).toBeDefined();
  });

  test('has icon slot', () => {
    const step = createStep();
    container.appendChild(step);
    const slot = step.shadowRoot?.querySelector('slot[name="icon"]');
    expect(slot).toBeDefined();
  });

  // --- CSS Parts ---
  test('has indicator part', () => {
    const step = createStep();
    container.appendChild(step);
    expect(step.shadowRoot?.querySelector('[part="indicator"]')).toBeDefined();
  });

  test('has content part', () => {
    const step = createStep();
    container.appendChild(step);
    expect(step.shadowRoot?.querySelector('[part="content"]')).toBeDefined();
  });

  test('has label part when label is set', () => {
    const step = createStep({ label: 'Test' });
    container.appendChild(step);
    expect(step.shadowRoot?.querySelector('[part="label"]')).toBeDefined();
  });

  test('has description part when description is set', () => {
    const step = createStep({ label: 'Test', description: 'Desc' });
    container.appendChild(step);
    expect(step.shadowRoot?.querySelector('[part="description"]')).toBeDefined();
  });
});
