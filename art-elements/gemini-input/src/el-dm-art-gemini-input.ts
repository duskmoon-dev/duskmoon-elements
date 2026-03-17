/**
 * DuskMoon Art - Gemini Input Element
 *
 * A Gemini-style animated gradient input built entirely with CSS.
 * Uses @duskmoon-dev/css-art for the animation styles.
 *
 * @element el-dm-art-gemini-input
 *
 * @attr {string} size - Size variant: sm, md (default), lg
 * @attr {string} placeholder - Placeholder text for the input field
 *
 * @slot prefix - Icon or content before the text area (left button area)
 * @slot suffix - Icon or content after the text area (right button area)
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';
import rawCss from '@duskmoon-dev/css-art/dist/art/gemini-input.css' with { type: 'text' };

// Keep @property rules (outside the layer) and strip only the @layer wrapper.
// @property registrations are needed for the rotation animation to work.
const coreCss = rawCss.replace(/@layer\s+css-art\s*\{([\s\S]*)\}\s*$/, (_, inner) => inner);

const styles = css`
  :host {
    display: inline-block;
  }
  :host([hidden]) {
    display: none !important;
  }
  ${coreCss}

  /* Shadow DOM fixes:
   * 1. mask: linear-gradient(white) hides ::after in Shadow DOM — remove it.
   *    Must use same specificity as the nested rule (.art-gemini-input .art-gemini-input-border).
   * 2. Make the static lightgray border transparent so the gradient always shows. */
  .art-gemini-input {
    border-color: transparent;

    & .art-gemini-input-border {
      mask: none;
    }
  }
`;

export class ElDmArtGeminiInput extends BaseElement {
  static properties = {
    size: { type: String, reflect: true },
    placeholder: { type: String, reflect: true, default: 'Ask me anything...' },
  };

  declare size: string;
  declare placeholder: string;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    const classes = ['art-gemini-input'];
    if (this.size && this.size !== 'md') classes.push(`art-gemini-input-${this.size}`);

    return `
      <div class="${classes.join(' ')}">
        <div class="art-gemini-input-border"></div>
        <div class="art-gemini-input-inner">
          <slot name="prefix">
            <button class="art-gemini-input-btn" type="button" aria-label="Attach">+</button>
          </slot>
          <textarea
            class="art-gemini-input-field"
            placeholder="${this.placeholder || 'Ask me anything...'}"
            rows="1"
          ></textarea>
          <slot name="suffix">
            <button class="art-gemini-input-btn" type="button" aria-label="Send">&#9658;</button>
          </slot>
        </div>
      </div>
    `;
  }
}
