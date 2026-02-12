/**
 * Styles for row pinning, row drag, row numbers, full-width rows, animations.
 */

import { css } from '@duskmoon-dev/el-base';

export const rowFeatureStyles = css`
  /* ─── Pinned Rows ────────────────────────────── */

  .grid-pinned-top,
  .grid-pinned-bottom {
    position: sticky;
    z-index: 2;
    background: var(--dm-color-surface, #fff);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .grid-pinned-top {
    top: 0;
    border-bottom: 2px solid var(--dm-color-border, #e0e0e0);
  }

  .grid-pinned-bottom {
    bottom: 0;
    border-top: 2px solid var(--dm-color-border, #e0e0e0);
  }

  .grid-row.pinned-row {
    background: var(--dm-color-surface-alt, #fafafa);
    font-weight: 500;
  }

  /* ─── Row Drag ───────────────────────────────── */

  .grid-row.row-dragging {
    opacity: 0.5;
    outline: 2px dashed var(--dm-color-primary, #3b82f6);
  }

  .grid-row.row-drag-over {
    border-top: 2px solid var(--dm-color-primary, #3b82f6);
  }

  .grid-drag-handle {
    cursor: grab;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    color: var(--dm-color-text-muted, #999);
    user-select: none;
  }

  .grid-drag-handle:hover {
    color: var(--dm-color-text, #333);
  }

  .grid-drag-handle:active {
    cursor: grabbing;
  }

  .grid-drag-ghost {
    position: fixed;
    z-index: 1001;
    padding: 4px 12px;
    background: var(--dm-color-surface, #fff);
    border: 1px solid var(--dm-color-primary, #3b82f6);
    border-radius: var(--dm-radius-sm, 4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-size: 13px;
    pointer-events: none;
  }

  /* ─── Row Numbers ────────────────────────────── */

  .grid-cell.row-number-cell {
    color: var(--dm-color-text-muted, #999);
    font-size: 12px;
    text-align: center;
    user-select: none;
    background: var(--dm-color-surface-alt, #fafafa);
  }

  /* ─── Full Width Rows ────────────────────────── */

  .grid-row.full-width-row {
    display: block;
  }

  .full-width-row-content {
    width: 100%;
    padding: 8px 12px;
  }

  /* ─── Row Animations ─────────────────────────── */

  @keyframes row-enter {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes row-exit {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(10px);
    }
  }

  .grid-row.row-animate-enter {
    animation: row-enter var(--grid-row-animation-duration, 200ms) ease-out;
  }

  .grid-row.row-animate-exit {
    animation: row-exit var(--grid-row-animation-duration, 200ms) ease-in;
  }

  .grid-row.row-animate-move {
    transition: transform var(--grid-row-animation-duration, 200ms) ease;
  }

  /* ─── Row Styling ────────────────────────────── */

  .grid-row.row-highlight {
    background: var(--dm-color-primary-light, #eff6ff);
  }
`;
