/**
 * Header row and header cell styles.
 */
import { css } from '@duskmoon-dev/el-core';

export const headerStyles = css`
  .grid-header {
    display: flex;
    position: sticky;
    top: 0;
    z-index: 5;
    background: var(--grid-header-bg, var(--dm-color-surface-container, #f2f2f2));
    border-bottom: 1px solid var(--grid-border-color, var(--dm-color-outline-variant, #ccc));
    min-width: fit-content;
  }

  .grid-header-cell {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: var(--grid-cell-padding, 8px 12px);
    font-weight: var(--grid-header-font-weight, 600);
    color: var(--grid-header-color, var(--dm-color-on-surface, #1a1a1a));
    user-select: none;
    cursor: default;
    position: relative;
    box-sizing: border-box;
    flex-shrink: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .grid-header-cell[data-sortable] {
    cursor: pointer;
  }

  .grid-header-cell[data-sortable]:hover {
    background: var(--grid-row-bg-hover, rgba(0, 0, 0, 0.04));
  }

  .grid-header-cell:focus-visible {
    outline: var(--grid-focus-ring, 2px solid var(--dm-color-primary, #6750a4));
    outline-offset: -2px;
  }

  .grid-header-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Sort indicator */
  .grid-sort-indicator {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 12px;
    color: var(--dm-color-primary, #6750a4);
  }

  .grid-sort-arrow {
    font-size: 14px;
    line-height: 1;
  }

  .grid-sort-index {
    font-size: 10px;
    font-weight: 500;
    opacity: 0.7;
  }

  /* Resize handle */
  .grid-resize-handle {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    cursor: col-resize;
    z-index: 1;
  }

  .grid-resize-handle:hover,
  .grid-resize-handle.active {
    background: var(--dm-color-primary, #6750a4);
  }
`;
