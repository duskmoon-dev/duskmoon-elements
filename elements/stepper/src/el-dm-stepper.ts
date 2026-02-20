/**
 * DuskMoon Stepper Element
 *
 * A multi-step progress indicator/wizard component.
 * Uses styles from @duskmoon-dev/core for consistent theming.
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
 * @csspart label - The step label text
 * @csspart description - The step description text
 * @csspart connector - The connector line between steps
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as stepperCSS } from '@duskmoon-dev/core/components/stepper';

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

// Strip @layer wrapper for Shadow DOM compatibility
const coreStyles = stepperCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: block;
    font-family: var(--font-family-sans, system-ui, sans-serif);
  }

  :host([hidden]) {
    display: none !important;
  }

  /* Import core stepper styles */
  ${coreStyles}

  /* Web component specific: custom color variants via --stepper-color */
  .stepper-custom-color .stepper-step-active .stepper-step-icon {
    background-color: var(--stepper-color);
    border-color: var(--stepper-color);
    color: #fff;
  }

  .stepper-custom-color .stepper-step-completed .stepper-step-icon {
    background-color: var(--stepper-color);
    border-color: var(--stepper-color);
    color: #fff;
  }

  .stepper-custom-color .stepper-step-completed .stepper-step-connector {
    background-color: var(--stepper-color);
  }

  .stepper-custom-color .stepper-step-active .stepper-step-label {
    color: var(--stepper-color);
  }

  .stepper-custom-color.stepper-clickable .stepper-step-button:hover .stepper-step-icon {
    border-color: var(--stepper-color);
  }

  /* Icon support */
  .step-icon {
    font-size: 1rem;
    line-height: 1;
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

  private _getStepStateClass(state: string): string {
    if (state === 'completed') return 'stepper-step-completed';
    if (state === 'current') return 'stepper-step-active';
    return '';
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

  private _getContainerClasses(): string {
    const classes = ['stepper'];

    if (this.orientation === 'vertical') {
      classes.push('stepper-vertical');
    }

    if (this.clickable) {
      classes.push('stepper-clickable');
    }

    // Core has built-in secondary/tertiary variants
    if (this.color === 'secondary') {
      classes.push('stepper-secondary');
    } else if (this.color === 'tertiary') {
      classes.push('stepper-tertiary');
    } else if (this.color !== 'primary') {
      // success, warning, error, info use custom color variable
      classes.push('stepper-custom-color');
    }

    return classes.join(' ');
  }

  render(): string {
    const stepsArray = Array.isArray(this.steps) ? this.steps : [];
    const colorValue = COLOR_MAP[this.color] || COLOR_MAP.primary;
    const containerClasses = this._getContainerClasses();
    const needsCustomColor = !['primary', 'secondary', 'tertiary'].includes(this.color);

    const stepsHtml = stepsArray
      .map((step, index) => {
        const state = this._getStepState(index);
        const stateClass = this._getStepStateClass(state);

        return `
          <div
            class="stepper-step ${stateClass}"
            data-step-index="${index}"
            part="step"
          >
            <div class="stepper-step-connector" part="connector"></div>
            <div class="stepper-step-button">
              <div class="stepper-step-icon" part="indicator">
                ${this._renderStepIndicator(step, index, state)}
              </div>
              <span class="stepper-step-label" part="label">${step.label}</span>
              ${step.description ? `<span class="stepper-step-description" part="description">${step.description}</span>` : ''}
            </div>
          </div>
        `;
      })
      .join('');

    return `
      <div
        class="${containerClasses}"
        ${needsCustomColor ? `style="--stepper-color: ${colorValue}"` : ''}
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

  /* Import core stepper styles */
  ${coreStyles}

  :host([orientation='horizontal']) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  :host([orientation='vertical']) {
    flex-direction: row;
    align-items: flex-start;
  }

  /* Override icon colors based on host status attribute */
  :host([status='completed']) .stepper-step-icon {
    background-color: var(--step-color, var(--color-primary));
    border-color: var(--step-color, var(--color-primary));
    color: var(--color-on-primary, #fff);
  }

  :host([status='current']) .stepper-step-icon {
    background-color: var(--color-surface, #fff);
    color: var(--step-color, var(--color-primary));
    border-color: var(--step-color, var(--color-primary));
  }

  :host([status='current']) .stepper-step-label {
    color: var(--step-color, var(--color-primary));
    font-weight: 600;
  }

  :host([status='upcoming']) .stepper-step-label {
    color: var(--color-on-surface-variant, #666);
  }

  .step-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem;
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
      <div class="stepper-step-icon" style="--step-color: ${colorValue}" part="indicator">
        <slot name="icon">${this._renderIndicator()}</slot>
      </div>
      <div class="step-content" part="content">
        ${this.label ? `<span class="stepper-step-label" part="label">${this.label}</span>` : ''}
        ${this.description ? `<span class="stepper-step-description" part="description">${this.description}</span>` : ''}
        <slot></slot>
      </div>
    `;
  }
}
