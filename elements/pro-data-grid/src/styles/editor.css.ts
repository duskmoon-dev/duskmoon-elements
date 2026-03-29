import { css } from '@duskmoon-dev/el-base';

export const editorStyles = css`
  /* ─── Inline Cell Editor ────────────────── */

  .grid-cell[data-editing] {
    padding: 0;
    overflow: visible;
  }

  .grid-cell-editor {
    width: 100%;
    height: 100%;
    padding: 4px 8px;
    border: 2px solid var(--color-primary, #1976d2);
    border-radius: 0;
    font-size: inherit;
    font-family: inherit;
    background: var(--color-surface, #fff);
    color: var(--color-on-surface, #212121);
    outline: none;
    box-sizing: border-box;
  }

  .grid-cell-editor:focus {
    box-shadow: 0 0 0 1px var(--color-primary, #1976d2);
  }

  .grid-cell-editor-select {
    cursor: pointer;
  }

  .grid-cell-editor-checkbox {
    width: auto;
    height: auto;
    cursor: pointer;
    accent-color: var(--color-primary, #1976d2);
  }

  /* ─── Validation Error ──────────────────── */

  .grid-cell[data-invalid] .grid-cell-editor {
    border-color: var(--color-error, #d32f2f);
  }

  .grid-cell[data-invalid] .grid-cell-editor:focus {
    box-shadow: 0 0 0 1px var(--color-error, #d32f2f);
  }

  .grid-cell-error-tooltip {
    position: absolute;
    bottom: 100%;
    left: 0;
    padding: 4px 8px;
    background: var(--color-error, #d32f2f);
    color: #fff;
    font-size: 11px;
    border-radius: var(--radius-sm, 4px);
    white-space: nowrap;
    z-index: 10;
    pointer-events: none;
  }

  /* ─── Row Editing Mode ──────────────────── */

  .grid-row[data-editing] {
    background: var(--color-surface-container, rgba(25, 118, 210, 0.04));
    box-shadow: inset 0 0 0 1px var(--color-primary-container, rgba(25, 118, 210, 0.3));
  }

  .grid-row-edit-actions {
    display: flex;
    gap: 4px;
    padding: 0 8px;
    align-items: center;
  }

  .grid-row-edit-btn {
    padding: 2px 8px;
    border: 1px solid var(--color-outline, #e0e0e0);
    border-radius: var(--radius-sm, 4px);
    font-size: 12px;
    cursor: pointer;
    background: var(--color-surface, #fff);
    color: var(--color-on-surface, #212121);
  }

  .grid-row-edit-btn:hover {
    background: var(--color-surface-container-high, #f5f5f5);
  }

  .grid-row-edit-btn[data-save] {
    background: var(--color-primary, #1976d2);
    color: #fff;
    border-color: var(--color-primary, #1976d2);
  }

  .grid-row-edit-btn[data-save]:hover {
    background: var(--color-primary, #1565c0);
  }
`;
