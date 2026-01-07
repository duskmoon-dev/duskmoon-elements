/**
 * DuskMoon Stepper Element
 *
 * A multi-step progress indicator/wizard component.
 * Uses custom CSS with theme variables for consistent theming.
 *
 * @element el-dm-stepper
 *
 * @attr {string} steps - JSON array of step objects [{label, description?, icon?}]
 * @attr {number} current - Current step index (0-based)
 * @attr {string} orientation - Layout orientation: horizontal, vertical
 * @attr {string} color - Stepper color: primary, secondary, tertiary, success, warning, error, info
 * @attr {boolean} clickable - Whether steps are clickable for navigation
 *
 * @fires change - Fired when step changes via click
 *
 * @csspart stepper - The stepper container
 * @csspart step - Individual step wrapper
 * @csspart indicator - The step number/icon circle
 * @csspart content - The step label and description wrapper
 * @csspart label - The step label text
 * @csspart description - The step description text
 * @csspart connector - The connector line between steps
 */

import { BaseElement, css } from '@duskmoon-dev/el-core';

export interface StepData {
  label: string;
  description?: string;
  icon?: string;
}

export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

const COLOR_MAP: Record<string, string> = {
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)',
  tertiary: 'var(--color-tertiary)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
  info: 'var(--color-info)',
};

const styles = css`
  :host {
    display: block;
    font-family: var(--font-family-sans, system-ui, sans-serif);
  }

  :host([hidden]) {
    display: none !important;
  }

  .stepper {
    display: flex;
    gap: 0;
  }

  .stepper--horizontal {
    flex-direction: row;
    align-items: flex-start;
  }

  .stepper--vertical {
    flex-direction: column;
  }

  .step {
    display: flex;
    position: relative;
    flex: 1;
  }

  .stepper--horizontal .step {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .stepper--vertical .step {
    flex-direction: row;
    align-items: flex-start;
  }

  .step-header {
    display: flex;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  .stepper--horizontal .step-header {
    flex-direction: column;
    width: 100%;
  }

  .stepper--vertical .step-header {
    flex-direction: row;
    min-height: 4rem;
  }

  .step-indicator-wrapper {
    display: flex;
    align-items: center;
    position: relative;
  }

  .stepper--horizontal .step-indicator-wrapper {
    width: 100%;
    justify-content: center;
  }

  .step-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    font-size: 0.875rem;
    font-weight: 600;
    flex-shrink: 0;
    transition: all 0.2s ease;
    background-color: var(--color-surface-variant, #e0e0e0);
    color: var(--color-on-surface-variant, #666);
    border: 2px solid transparent;
  }

  .step--clickable .step-indicator {
    cursor: pointer;
  }

  .step--clickable .step-indicator:hover {
    transform: scale(1.1);
  }

  .step--completed .step-indicator {
    background-color: var(--stepper-color, var(--color-primary));
    color: var(--color-on-primary, #fff);
  }

  .step--current .step-indicator {
    background-color: var(--color-surface, #fff);
    color: var(--stepper-color, var(--color-primary));
    border-color: var(--stepper-color, var(--color-primary));
  }

  .step--upcoming .step-indicator {
    background-color: var(--color-surface-variant, #e0e0e0);
    color: var(--color-on-surface-variant, #666);
  }

  .step-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem 0;
  }

  .stepper--horizontal .step-content {
    align-items: center;
    padding: 0.5rem 0.5rem 0;
  }

  .stepper--vertical .step-content {
    padding-left: 0.75rem;
    padding-top: 0.25rem;
  }

  .step-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-on-surface, #1a1a1a);
    transition: color 0.2s ease;
  }

  .step--clickable .step-label {
    cursor: pointer;
  }

  .step--upcoming .step-label {
    color: var(--color-on-surface-variant, #666);
  }

  .step--current .step-label {
    color: var(--stepper-color, var(--color-primary));
    font-weight: 600;
  }

  .step-description {
    font-size: 0.75rem;
    color: var(--color-on-surface-variant, #666);
  }

  /* Connector lines */
  .connector {
    position: absolute;
    background-color: var(--color-surface-variant, #e0e0e0);
    transition: background-color 0.2s ease;
  }

  .step--completed .connector {
    background-color: var(--stepper-color, var(--color-primary));
  }

  .stepper--horizontal .connector {
    height: 2px;
    top: 1rem;
    left: calc(50% + 1rem + 0.25rem);
    right: calc(-50% + 1rem + 0.25rem);
  }

  .stepper--horizontal .step:last-child .connector {
    display: none;
  }

  .stepper--vertical .connector {
    width: 2px;
    left: calc(1rem - 1px);
    top: 2.5rem;
    bottom: 0.5rem;
  }

  .stepper--vertical .step:last-child .connector {
    display: none;
  }

  /* Icon support */
  .step-icon {
    font-size: 1rem;
    line-height: 1;
  }

  /* Completed checkmark */
  .step--completed .step-indicator::after {
    content: '';
  }
`;

export class ElDmStepper extends BaseElement {
  static properties = {
    steps: { type: Array, reflect: false, default: [] },
    current: { type: Number, reflect: true, default: 0 },
    orientation: { type: String, reflect: true, default: 'horizontal' },
    color: { type: String, reflect: true, default: 'primary' },
    clickable: { type: Boolean, reflect: true, default: false },
  };

  declare steps: StepData[];
  declare current: number;
  declare orientation: StepperOrientation;
  declare color: StepperColor;
  declare clickable: boolean;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this._handleClick.bind(this));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('click', this._handleClick.bind(this));
  }

  private _handleClick(e: Event): void {
    if (!this.clickable) return;

    const target = e.target as HTMLElement;
    const stepEl = target.closest('[data-step-index]') as HTMLElement;
    if (!stepEl) return;

    const index = parseInt(stepEl.dataset.stepIndex || '0', 10);
    if (index !== this.current) {
      const oldValue = this.current;
      this.current = index;
      this.emit('change', { current: index, previous: oldValue });
    }
  }

  private _getStepState(index: number): 'completed' | 'current' | 'upcoming' {
    if (index < this.current) return 'completed';
    if (index === this.current) return 'current';
    return 'upcoming';
  }

  private _renderStepIndicator(step: StepData, index: number, state: string): string {
    if (state === 'completed') {
      return step.icon
        ? `<span class="step-icon">${step.icon}</span>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    }
    if (step.icon) {
      return `<span class="step-icon">${step.icon}</span>`;
    }
    return `${index + 1}`;
  }

  render(): string {
    const stepsArray = Array.isArray(this.steps) ? this.steps : [];
    const colorValue = COLOR_MAP[this.color] || COLOR_MAP.primary;

    const stepsHtml = stepsArray
      .map((step, index) => {
        const state = this._getStepState(index);
        const stateClass = `step--${state}`;
        const clickableClass = this.clickable ? 'step--clickable' : '';

        return `
          <div
            class="step ${stateClass} ${clickableClass}"
            data-step-index="${index}"
            part="step"
          >
            <div class="step-header">
              <div class="step-indicator-wrapper">
                <div class="step-indicator" part="indicator">
                  ${this._renderStepIndicator(step, index, state)}
                </div>
                <div class="connector" part="connector"></div>
              </div>
              <div class="step-content" part="content">
                <span class="step-label" part="label">${step.label}</span>
                ${step.description ? `<span class="step-description" part="description">${step.description}</span>` : ''}
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    return `
      <div
        class="stepper stepper--${this.orientation}"
        style="--stepper-color: ${colorValue}"
        role="navigation"
        aria-label="Progress steps"
        part="stepper"
      >
        ${stepsHtml}
      </div>
    `;
  }
}

/**
 * DuskMoon Step Element
 *
 * Individual step element for use within el-dm-stepper.
 * Allows for custom content and styling of individual steps.
 *
 * @element el-dm-step
 *
 * @attr {string} label - Step label text
 * @attr {string} description - Optional description text
 * @attr {string} icon - Optional icon (text/emoji/html)
 * @attr {string} status - Step status: completed, current, upcoming
 *
 * @slot - Default slot for custom step content
 * @slot icon - Slot for custom icon content
 *
 * @csspart step - The step container
 * @csspart indicator - The step indicator circle
 * @csspart content - The content wrapper
 * @csspart label - The label text
 * @csspart description - The description text
 */

const stepStyles = css`
  :host {
    display: flex;
    position: relative;
    flex: 1;
    font-family: var(--font-family-sans, system-ui, sans-serif);
  }

  :host([hidden]) {
    display: none !important;
  }

  :host([orientation='horizontal']) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  :host([orientation='vertical']) {
    flex-direction: row;
    align-items: flex-start;
  }

  .step-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    font-size: 0.875rem;
    font-weight: 600;
    flex-shrink: 0;
    transition: all 0.2s ease;
    background-color: var(--color-surface-variant, #e0e0e0);
    color: var(--color-on-surface-variant, #666);
    border: 2px solid transparent;
  }

  :host([status='completed']) .step-indicator {
    background-color: var(--step-color, var(--color-primary));
    color: var(--color-on-primary, #fff);
  }

  :host([status='current']) .step-indicator {
    background-color: var(--color-surface, #fff);
    color: var(--step-color, var(--color-primary));
    border-color: var(--step-color, var(--color-primary));
  }

  .step-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem;
  }

  .step-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-on-surface, #1a1a1a);
  }

  :host([status='current']) .step-label {
    color: var(--step-color, var(--color-primary));
    font-weight: 600;
  }

  :host([status='upcoming']) .step-label {
    color: var(--color-on-surface-variant, #666);
  }

  .step-description {
    font-size: 0.75rem;
    color: var(--color-on-surface-variant, #666);
  }

  ::slotted(*) {
    margin-top: 0.5rem;
  }
`;

export class ElDmStep extends BaseElement {
  static properties = {
    label: { type: String, reflect: true },
    description: { type: String, reflect: true },
    icon: { type: String, reflect: true },
    status: { type: String, reflect: true, default: 'upcoming' },
    orientation: { type: String, reflect: true, default: 'horizontal' },
    color: { type: String, reflect: true, default: 'primary' },
    stepNumber: { type: Number, reflect: true, attribute: 'step-number', default: 1 },
  };

  declare label: string;
  declare description: string;
  declare icon: string;
  declare status: 'completed' | 'current' | 'upcoming';
  declare orientation: 'horizontal' | 'vertical';
  declare color: string;
  declare stepNumber: number;

  constructor() {
    super();
    this.attachStyles(stepStyles);
  }

  private _renderIndicator(): string {
    if (this.status === 'completed' && !this.icon) {
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    }
    if (this.icon) {
      return this.icon;
    }
    return `${this.stepNumber}`;
  }

  render(): string {
    const colorValue = COLOR_MAP[this.color] || COLOR_MAP.primary;

    return `
      <div class="step-indicator" style="--step-color: ${colorValue}" part="indicator">
        <slot name="icon">${this._renderIndicator()}</slot>
      </div>
      <div class="step-content" part="content">
        ${this.label ? `<span class="step-label" part="label">${this.label}</span>` : ''}
        ${this.description ? `<span class="step-description" part="description">${this.description}</span>` : ''}
        <slot></slot>
      </div>
    `;
  }
}
