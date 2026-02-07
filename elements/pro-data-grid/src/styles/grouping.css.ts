import { css } from '@duskmoon-dev/el-core';

export const groupingStyles = css`
  /* ─── Group Panel (drop zone above grid) ──── */

  .grid-group-panel {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 40px;
    padding: 8px 12px;
    background: var(--dm-surface-variant, #f5f5f5);
    border-bottom: 1px dashed var(--dm-border, #e0e0e0);
    font-size: 13px;
    color: var(--dm-text-secondary, #757575);
  }

  .grid-group-panel-placeholder {
    font-style: italic;
    opacity: 0.7;
  }

  .grid-group-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    background: var(--dm-primary, #1976d2);
    color: #fff;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  .grid-group-chip-remove {
    cursor: pointer;
    opacity: 0.8;
    font-size: 14px;
    line-height: 1;
    margin-left: 2px;
    background: none;
    border: none;
    color: inherit;
    padding: 0;
  }

  .grid-group-chip-remove:hover {
    opacity: 1;
  }

  /* ─── Group Row ──────────────────────────── */

  .grid-row[data-group] {
    background: var(--dm-surface-variant, #f5f5f5);
    font-weight: 600;
    cursor: pointer;
    user-select: none;
  }

  .grid-row[data-group]:hover {
    background: var(--dm-surface-hover, #eeeeee);
  }

  .grid-group-cell {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    height: 100%;
    padding: 0 8px;
    overflow: hidden;
  }

  .grid-group-indent {
    flex-shrink: 0;
  }

  .grid-group-chevron {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s ease;
    color: var(--dm-text-secondary, #757575);
    font-size: 14px;
  }

  .grid-group-chevron[data-expanded] {
    transform: rotate(90deg);
  }

  .grid-group-key {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .grid-group-count {
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 400;
    color: var(--dm-text-secondary, #757575);
    opacity: 0.8;
  }

  .grid-group-agg {
    display: flex;
    gap: 12px;
    font-size: 12px;
    font-weight: 400;
    color: var(--dm-text-secondary, #757575);
  }

  .grid-group-agg-value {
    white-space: nowrap;
  }
`;
