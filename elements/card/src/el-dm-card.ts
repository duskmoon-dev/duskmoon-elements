/**
 * DuskMoon Card Element
 *
 * A container component with header, body, and footer sections.
 * Uses styles from @duskmoon-dev/core for consistent theming.
 *
 * @element el-dm-card
 *
 * @attr {string} variant - Card variant: elevated, outlined, filled
 * @attr {boolean} interactive - Whether the card is clickable/hoverable
 * @attr {string} padding - Padding size: none, sm, md, lg
 *
 * @slot - Default slot for card body content
 * @slot header - Card header content
 * @slot footer - Card footer content
 * @slot media - Media content (image/video) at the top of card
 *
 * @csspart card - The main card container
 * @csspart header - The header section
 * @csspart body - The body section
 * @csspart footer - The footer section
 * @csspart media - The media section
 *
 * @fires click - Fired when interactive card is clicked
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as cardCSS } from '@duskmoon-dev/core/components/card';

/**
 * Card variant options
 */
export type CardVariant = 'elevated' | 'outlined' | 'filled';

/**
 * Card padding options
 */
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

// Map of variant attribute values to CSS classes
const VARIANT_CLASSES: Record<string, string> = {
  elevated: 'card-elevated',
  outlined: 'card-bordered',
  filled: '', // default card style
};

// Strip @layer wrapper for Shadow DOM compatibility
const coreStyles = cardCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: block;
  }

  :host([hidden]) {
    display: none !important;
  }

  /* Import core card styles */
  ${coreStyles}

  /* Web component specific adjustments */

  /* Media slot handling */
  .card-image {
    display: none;
  }

  .card-image.has-content {
    display: block;
  }

  .card-image ::slotted(*) {
    display: block;
    width: 100%;
    object-fit: cover;
  }

  /* Header slot handling */
  .card-header {
    display: none;
  }

  .card-header.has-content {
    display: flex;
  }

  /* Footer slot handling */
  .card-footer {
    display: none;
  }

  .card-footer.has-content {
    display: flex;
  }

  /* Padding variants */
  :host([padding='none']) .card-body {
    padding: 0;
  }

  :host([padding='lg']) .card-body {
    --card-p: 2rem;
  }

  :host([padding='lg']) .card-header,
  :host([padding='lg']) .card-footer {
    --card-p: 2rem;
  }
`;

export class ElDmCard extends BaseElement {
  static properties = {
    variant: { type: String, reflect: true },
    interactive: { type: Boolean, reflect: true },
    padding: { type: String, reflect: true },
  };

  /** Card variant */
  declare variant: CardVariant;

  /** Whether the card is interactive */
  declare interactive: boolean;

  /** Card padding size */
  declare padding: CardPadding;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  connectedCallback(): void {
    super.connectedCallback();

    // Set up slot change listeners for conditional display
    this.shadowRoot.addEventListener('slotchange', this._handleSlotChange.bind(this));

    // Set up click handler for interactive cards
    if (this.interactive) {
      this._setupInteractive();
    }
  }

  /**
   * Handle slot content changes
   */
  private _handleSlotChange(event: Event): void {
    const slot = event.target as HTMLSlotElement;
    const slotName = slot.name;

    // Map slot names to wrapper class names
    const wrapperMap: Record<string, string> = {
      media: 'card-image',
      header: 'card-header',
      footer: 'card-footer',
      '': 'card-body',
    };

    const wrapperClass = wrapperMap[slotName] || 'card-body';
    const wrapper = this.shadowRoot.querySelector(`.${wrapperClass}`);

    if (wrapper) {
      const hasContent = slot.assignedNodes().length > 0;
      wrapper.classList.toggle('has-content', hasContent);
    }
  }

  /**
   * Set up interactive card behavior
   */
  private _setupInteractive(): void {
    const card = this.shadowRoot.querySelector('.card') as HTMLElement;
    if (card) {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');

      card.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.emit('click');
        }
      });
    }
  }

  /**
   * Build CSS class string for the card
   */
  private _getCardClasses(): string {
    const classes = ['card'];

    // Add variant class
    if (this.variant && VARIANT_CLASSES[this.variant]) {
      classes.push(VARIANT_CLASSES[this.variant]);
    }

    // Add interactive class
    if (this.interactive) {
      classes.push('card-interactive');
    }

    // Add compact class for small padding
    if (this.padding === 'sm') {
      classes.push('card-compact');
    }

    return classes.filter(Boolean).join(' ');
  }

  render(): string {
    const cardClasses = this._getCardClasses();

    return `
      <div class="${cardClasses}" part="card">
        <div class="card-image" part="media">
          <slot name="media"></slot>
        </div>
        <div class="card-header" part="header">
          <slot name="header"></slot>
        </div>
        <div class="card-body" part="body">
          <slot></slot>
        </div>
        <div class="card-footer" part="footer">
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }
}
