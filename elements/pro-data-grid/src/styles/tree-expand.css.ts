import { css } from '@duskmoon-dev/el-core';

export const treeExpandStyles = css`
  /* ─── Tree Data Indentation ─────────────── */

  .grid-tree-cell {
    display: flex;
    align-items: center;
    gap: 4px;
    width: 100%;
    height: 100%;
    padding: 0 8px;
    overflow: hidden;
  }

  .grid-tree-indent {
    flex-shrink: 0;
  }

  .grid-tree-toggle {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
    background: none;
    color: var(--dm-text-secondary, #757575);
    border-radius: var(--dm-radius-sm, 4px);
    font-size: 12px;
    padding: 0;
    transition: transform 0.15s ease;
  }

  .grid-tree-toggle:hover {
    background: var(--dm-surface-hover, #f5f5f5);
  }

  .grid-tree-toggle[data-expanded] {
    transform: rotate(90deg);
  }

  .grid-tree-toggle[data-leaf] {
    visibility: hidden;
  }

  .grid-tree-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .grid-tree-count {
    flex-shrink: 0;
    font-size: 11px;
    color: var(--dm-text-secondary, #757575);
    opacity: 0.7;
  }

  /* ─── Row Expand Indicator Column ────────── */

  .grid-expand-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .grid-expand-toggle {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    color: var(--dm-text-secondary, #757575);
    border-radius: var(--dm-radius-sm, 4px);
    font-size: 14px;
    padding: 0;
    cursor: pointer;
    transition: transform 0.15s ease;
  }

  .grid-expand-toggle:hover {
    background: var(--dm-surface-hover, #f5f5f5);
    color: var(--dm-primary, #1976d2);
  }

  .grid-expand-toggle[data-expanded] {
    transform: rotate(90deg);
  }

  .grid-expand-toggle[data-hidden] {
    visibility: hidden;
  }

  /* ─── Detail Panel ──────────────────────── */

  .grid-row-detail {
    overflow: hidden;
    border-bottom: 1px solid var(--dm-border, #e0e0e0);
    background: var(--dm-surface, #fff);
  }

  .grid-row-detail[data-animating] {
    transition:
      max-height 0.2s ease,
      opacity 0.2s ease;
  }

  .grid-row-detail[data-collapsed] {
    max-height: 0;
    opacity: 0;
  }

  .grid-row-detail[data-expanded] {
    opacity: 1;
  }
`;
