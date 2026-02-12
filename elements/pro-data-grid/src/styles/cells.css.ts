/**
 * Row and cell styles.
 */
import { css } from '@duskmoon-dev/el-base';

export const cellStyles = css`
  .grid-row {
    display: flex;
    min-width: fit-content;
  }

  .grid-row:hover {
    background: var(--grid-row-bg-hover, rgba(0, 0, 0, 0.04));
  }

  /* Striped rows */
  :host([striped]) .grid-row:nth-child(even) {
    background: var(--grid-row-bg-alt, rgba(0, 0, 0, 0.02));
  }

  :host([striped]) .grid-row:nth-child(even):hover {
    background: var(--grid-row-bg-hover, rgba(0, 0, 0, 0.04));
  }

  /* Selected rows */
  .grid-row[data-selected] {
    background: var(--grid-row-bg-selected, rgba(103, 80, 164, 0.08));
  }

  .grid-cell {
    display: flex;
    align-items: center;
    padding: var(--grid-cell-padding, 8px 12px);
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* Bordered mode */
  :host([bordered]) .grid-cell {
    border-right: 1px solid var(--grid-cell-border-color, var(--dm-color-outline-variant, #e0e0e0));
    border-bottom: 1px solid var(--grid-cell-border-color, var(--dm-color-outline-variant, #e0e0e0));
  }

  :host([bordered]) .grid-cell:last-child {
    border-right: none;
  }

  :host([bordered]) .grid-header-cell {
    border-right: 1px solid var(--grid-cell-border-color, var(--dm-color-outline-variant, #e0e0e0));
  }

  :host([bordered]) .grid-header-cell:last-child {
    border-right: none;
  }

  /* Cell alignment */
  .grid-cell[data-align='center'] {
    justify-content: center;
    text-align: center;
  }

  .grid-cell[data-align='right'] {
    justify-content: flex-end;
    text-align: right;
  }

  /* Focused cell */
  .grid-cell:focus-visible {
    outline: var(--grid-focus-ring, 2px solid var(--dm-color-primary, #6750a4));
    outline-offset: -2px;
  }

  /* Cell content */
  .grid-cell-content {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  /* Boolean cell display */
  .grid-cell-boolean {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .grid-cell-boolean::before {
    content: '';
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid var(--dm-color-outline, #999);
    border-radius: 3px;
  }

  .grid-cell-boolean[data-checked]::before {
    background: var(--dm-color-primary, #6750a4);
    border-color: var(--dm-color-primary, #6750a4);
  }
`;
