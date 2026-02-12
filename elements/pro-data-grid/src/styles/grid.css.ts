/**
 * Core grid layout styles.
 */
import { css } from '@duskmoon-dev/el-base';

export const gridStyles = css`
  :host {
    display: block;
    position: relative;
    contain: layout style;
    border: 1px solid var(--grid-border-color, var(--dm-color-outline-variant, #ccc));
    border-radius: var(--grid-border-radius, 8px);
    overflow: hidden;
    font-family: var(--dm-font-family, system-ui, sans-serif);
    font-size: var(--dm-font-size-sm, 14px);
    color: var(--grid-row-color, var(--dm-color-on-surface, #1a1a1a));
    background: var(--grid-row-bg, var(--dm-color-surface, #fff));
  }

  .grid-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  .grid-viewport {
    flex: 1;
    overflow: auto;
    position: relative;
    will-change: transform;
  }

  .grid-scroll-container {
    position: relative;
    width: 100%;
  }

  .grid-body {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }

  /* Loading overlay */
  .grid-loading-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--grid-loading-bg, rgba(0, 0, 0, 0.15));
    z-index: 10;
  }

  .grid-loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--dm-color-outline-variant, #ccc);
    border-top-color: var(--dm-color-primary, #6750a4);
    border-radius: 50%;
    animation: grid-spin 0.8s linear infinite;
  }

  @keyframes grid-spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Empty overlay */
  .grid-empty-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--dm-color-on-surface-variant, #666);
    font-size: var(--dm-font-size-md, 16px);
    padding: 48px;
    pointer-events: none;
  }
`;
