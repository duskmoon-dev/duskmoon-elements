/**
 * Styles for context menu, status bar, find bar, sparklines, tooltips.
 */

import { css } from '@duskmoon-dev/el-base';

export const accessoryStyles = css`
  /* ─── Context Menu ───────────────────────────── */

  .grid-context-menu {
    position: fixed;
    z-index: 1000;
    min-width: 180px;
    background: var(--dm-color-surface, #fff);
    border: 1px solid var(--dm-color-border, #e0e0e0);
    border-radius: var(--dm-radius-md, 6px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    padding: 4px 0;
    font-size: 13px;
  }

  .context-menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    cursor: pointer;
    position: relative;
  }

  .context-menu-item:hover {
    background: var(--dm-color-primary-light, #eff6ff);
  }

  .context-menu-item-disabled {
    opacity: 0.4;
    cursor: default;
    pointer-events: none;
  }

  .context-menu-separator {
    height: 1px;
    background: var(--dm-color-border, #e0e0e0);
    margin: 4px 0;
  }

  .context-menu-icon {
    width: 16px;
    text-align: center;
    flex-shrink: 0;
  }

  .context-menu-label {
    flex: 1;
  }

  .context-menu-shortcut {
    color: var(--dm-color-text-muted, #999);
    font-size: 11px;
    margin-left: 16px;
  }

  .context-menu-arrow {
    font-size: 8px;
    margin-left: 8px;
  }

  .context-menu-submenu {
    display: none;
    position: absolute;
    left: 100%;
    top: 0;
    min-width: 160px;
    background: var(--dm-color-surface, #fff);
    border: 1px solid var(--dm-color-border, #e0e0e0);
    border-radius: var(--dm-radius-md, 6px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    padding: 4px 0;
  }

  .context-menu-item:hover > .context-menu-submenu {
    display: block;
  }

  /* ─── Status Bar ─────────────────────────────── */

  .grid-status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 12px;
    border-top: 1px solid var(--dm-color-border, #e0e0e0);
    background: var(--dm-color-surface-alt, #fafafa);
    font-size: 12px;
    color: var(--dm-color-text-muted, #666);
    min-height: 28px;
  }

  .status-bar-left,
  .status-bar-center,
  .status-bar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .status-bar-panel {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .status-bar-label {
    font-weight: 500;
  }

  .status-bar-value {
    color: var(--dm-color-text, #333);
  }

  /* ─── Find Bar ───────────────────────────────── */

  .grid-find-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: var(--dm-color-surface, #fff);
    border-bottom: 1px solid var(--dm-color-border, #e0e0e0);
    font-size: 13px;
  }

  .find-bar-input {
    flex: 1;
    max-width: 300px;
    padding: 4px 8px;
    border: 1px solid var(--dm-color-border, #e0e0e0);
    border-radius: var(--dm-radius-sm, 4px);
    font-size: 13px;
    outline: none;
  }

  .find-bar-input:focus {
    border-color: var(--dm-color-primary, #3b82f6);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
  }

  .find-bar-count {
    font-size: 12px;
    color: var(--dm-color-text-muted, #999);
    min-width: 60px;
  }

  .find-bar-btn {
    background: none;
    border: 1px solid var(--dm-color-border, #e0e0e0);
    border-radius: var(--dm-radius-sm, 4px);
    padding: 2px 6px;
    cursor: pointer;
    font-size: 12px;
    line-height: 1;
  }

  .find-bar-btn:hover {
    background: var(--dm-color-primary-light, #eff6ff);
  }

  .find-bar-case {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    cursor: pointer;
  }

  /* ─── Find Match Highlighting ────────────────── */

  .grid-cell.find-match {
    background: rgba(255, 213, 79, 0.3);
  }

  .grid-cell.find-current-match {
    background: rgba(255, 152, 0, 0.4);
    outline: 2px solid var(--dm-color-warning, #f59e0b);
    outline-offset: -2px;
  }

  /* ─── Cell Flash ─────────────────────────────── */

  @keyframes cell-flash-up {
    0% {
      background: var(--grid-flash-up-color, rgba(76, 175, 80, 0.3));
    }
    100% {
      background: transparent;
    }
  }

  @keyframes cell-flash-down {
    0% {
      background: var(--grid-flash-down-color, rgba(244, 67, 54, 0.3));
    }
    100% {
      background: transparent;
    }
  }

  .grid-cell.cell-flash-up {
    animation: cell-flash-up 0.5s ease-out;
  }

  .grid-cell.cell-flash-down {
    animation: cell-flash-down 0.5s ease-out;
  }

  /* ─── Tooltips ───────────────────────────────── */

  .grid-tooltip {
    position: fixed;
    z-index: 1001;
    max-width: 300px;
    padding: 6px 10px;
    background: var(--dm-color-surface-inverse, #333);
    color: var(--dm-color-text-inverse, #fff);
    border-radius: var(--dm-radius-sm, 4px);
    font-size: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    pointer-events: none;
  }

  /* ─── Sparklines ─────────────────────────────── */

  .grid-sparkline {
    display: inline-block;
    vertical-align: middle;
  }
`;
