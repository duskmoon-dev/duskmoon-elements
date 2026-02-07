/**
 * Cell selection and range styles.
 */

import { css } from '@duskmoon-dev/el-core';

export const selectionStyles = css`
  /* ─── Cell Range Selection ───────────────────── */

  .grid-cell.cell-selected {
    background: var(
      --grid-range-selection-bg,
      oklch(from var(--dm-color-primary, #3b82f6) l c h / 0.1)
    );
  }

  .grid-cell.cell-range-start {
    outline: 2px solid var(--dm-color-primary, #3b82f6);
    outline-offset: -2px;
    z-index: 1;
  }

  .grid-cell.cell-range-top {
    border-top: 2px solid var(--dm-color-primary, #3b82f6);
  }

  .grid-cell.cell-range-bottom {
    border-bottom: 2px solid var(--dm-color-primary, #3b82f6);
  }

  .grid-cell.cell-range-left {
    border-left: 2px solid var(--dm-color-primary, #3b82f6);
  }

  .grid-cell.cell-range-right {
    border-right: 2px solid var(--dm-color-primary, #3b82f6);
  }

  /* ─── Fill Handle ────────────────────────────── */

  .grid-fill-handle {
    position: absolute;
    bottom: -3px;
    right: -3px;
    width: 6px;
    height: 6px;
    background: var(--dm-color-primary, #3b82f6);
    border: 1px solid var(--dm-color-surface, #fff);
    cursor: crosshair;
    z-index: 2;
  }

  .grid-fill-handle:hover {
    width: 8px;
    height: 8px;
    bottom: -4px;
    right: -4px;
  }

  /* ─── Fill Preview ───────────────────────────── */

  .grid-cell.fill-preview {
    background: var(
      --grid-range-selection-bg,
      oklch(from var(--dm-color-primary, #3b82f6) l c h / 0.15)
    );
    border: 1px dashed var(--dm-color-primary, #3b82f6);
  }

  /* ─── Range Border (applied on the outermost cells) ── */

  .grid-range-border {
    position: absolute;
    pointer-events: none;
    border: 2px solid var(--dm-color-primary, #3b82f6);
    z-index: 1;
  }

  /* ─── Clipboard Flash ────────────────────────── */

  @keyframes clipboard-flash {
    0% {
      outline: 2px dashed var(--dm-color-primary, #3b82f6);
    }
    50% {
      outline: 2px dashed transparent;
    }
    100% {
      outline: 2px dashed var(--dm-color-primary, #3b82f6);
    }
  }

  .grid-cell.clipboard-source {
    animation: clipboard-flash 1s ease-in-out 3;
  }
`;
