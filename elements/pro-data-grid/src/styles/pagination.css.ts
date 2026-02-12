/**
 * Pagination bar styles.
 */
import { css } from '@duskmoon-dev/el-base';

export const paginationStyles = css`
  .grid-pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    background: var(--grid-pagination-bg, var(--dm-color-surface-container, #f2f2f2));
    border-top: 1px solid var(--grid-border-color, var(--dm-color-outline-variant, #ccc));
    height: var(--grid-pagination-height, 48px);
    box-sizing: border-box;
    font-size: var(--dm-font-size-sm, 14px);
    min-width: 0;
  }

  .grid-pagination-info {
    color: var(--dm-color-on-surface-variant, #666);
    white-space: nowrap;
  }

  .grid-pagination-controls {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .grid-pagination-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    padding: 0 8px;
    border: 1px solid var(--dm-color-outline-variant, #ccc);
    border-radius: 6px;
    background: transparent;
    color: var(--dm-color-on-surface, #1a1a1a);
    cursor: pointer;
    font-size: 13px;
    transition: background-color 0.15s;
  }

  .grid-pagination-btn:hover:not(:disabled) {
    background: var(--dm-color-surface-container-low, rgba(0, 0, 0, 0.04));
  }

  .grid-pagination-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .grid-pagination-btn[data-active] {
    background: var(--dm-color-primary, #6750a4);
    color: var(--dm-color-on-primary, #fff);
    border-color: var(--dm-color-primary, #6750a4);
  }

  .grid-pagination-ellipsis {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: var(--dm-color-on-surface-variant, #666);
  }

  .grid-pagination-size {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 16px;
    color: var(--dm-color-on-surface-variant, #666);
  }

  .grid-pagination-size select {
    padding: 4px 8px;
    border: 1px solid var(--dm-color-outline-variant, #ccc);
    border-radius: 4px;
    background: var(--dm-color-surface, #fff);
    color: var(--dm-color-on-surface, #1a1a1a);
    font-size: 13px;
  }
`;
