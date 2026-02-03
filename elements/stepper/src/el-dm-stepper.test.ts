import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmStepper, register } from './index';
import type { StepData } from './index';

register();

describe('ElDmStepper', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('is defined', () => {
    expect(customElements.get('el-dm-stepper')).toBe(ElDmStepper);
  });

  test('creates a shadow root with navigation role', () => {
    const el = document.createElement('el-dm-stepper') as ElDmStepper;
    container.appendChild(el);

    const nav = el.shadowRoot?.querySelector('[role="navigation"]');
    expect(nav).toBeDefined();
  });

  test('renders steps from data', () => {
    const el = document.createElement('el-dm-stepper') as ElDmStepper;
    el.steps = [
      { label: 'Step 1' },
      { label: 'Step 2' },
      { label: 'Step 3' },
    ] as StepData[];
    container.appendChild(el);

    const steps = el.shadowRoot?.querySelectorAll('.step');
    expect(steps?.length).toBe(3);
  });

  test('marks current step', () => {
    const el = document.createElement('el-dm-stepper') as ElDmStepper;
    el.steps = [
      { label: 'Step 1' },
      { label: 'Step 2' },
    ] as StepData[];
    el.current = 1;
    container.appendChild(el);

    const current = el.shadowRoot?.querySelector('.step--current');
    expect(current).toBeDefined();
  });

  test('default orientation is horizontal', () => {
    const el = document.createElement('el-dm-stepper') as ElDmStepper;
    container.appendChild(el);

    const stepper = el.shadowRoot?.querySelector('.stepper');
    expect(stepper?.classList.contains('stepper--horizontal')).toBe(true);
  });

  test('applies vertical orientation', () => {
    const el = document.createElement('el-dm-stepper') as ElDmStepper;
    el.orientation = 'vertical';
    container.appendChild(el);

    const stepper = el.shadowRoot?.querySelector('.stepper');
    expect(stepper?.classList.contains('stepper--vertical')).toBe(true);
  });

  test('reflects current attribute', () => {
    const el = document.createElement('el-dm-stepper') as ElDmStepper;
    el.current = 2;
    container.appendChild(el);

    expect(el.getAttribute('current')).toBe('2');
  });
});
