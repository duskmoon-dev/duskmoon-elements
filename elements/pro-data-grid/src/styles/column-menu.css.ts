import { css } from '@duskmoon-dev/el-base';

export const columnMenuStyles = css`
  .grid-column-menu {
    position: absolute;
    background: var(--dm-surface, #fff);
    border: 1px solid var(--dm-border, #e0e0e0);
    border-radius: var(--dm-radius-md, 6px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    min-width: 200px;
    max-height: 400px;
    overflow-y: auto;
    z-index: 1000;
    font-size: 13px;
  }

  .grid-column-menu-section {
    padding: 4px 0;
  }

  .grid-column-menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 6px 12px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 13px;
    color: var(--dm-text, #212121);
    text-align: left;
  }

  .grid-column-menu-item:hover {
    background: var(--dm-surface-hover, #f5f5f5);
  }

  .grid-menu-icon {
    width: 16px;
    text-align: center;
    font-size: 12px;
  }

  .grid-column-menu-divider {
    height: 1px;
    background: var(--dm-border, #e0e0e0);
    margin: 4px 0;
  }

  .grid-column-menu-label {
    display: block;
    padding: 4px 12px;
    font-size: 11px;
    font-weight: 600;
    color: var(--dm-text-secondary, #757575);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .grid-column-menu-filter {
    padding: 4px 12px 8px;
  }

  .grid-column-menu-filter-input {
    width: 100%;
    padding: 4px 8px;
    border: 1px solid var(--dm-border, #e0e0e0);
    border-radius: var(--dm-radius-sm, 4px);
    font-size: 13px;
    background: var(--dm-surface, #fff);
    color: var(--dm-text, #212121);
    outline: none;
    margin: 4px 0;
  }

  .grid-column-menu-filter-input:focus {
    border-color: var(--dm-primary, #1976d2);
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.15);
  }

  .grid-column-menu-filter-actions {
    display: flex;
    gap: 4px;
    margin-top: 4px;
  }

  .grid-column-menu-btn {
    flex: 1;
    padding: 4px 8px;
    border: 1px solid var(--dm-border, #e0e0e0);
    border-radius: var(--dm-radius-sm, 4px);
    background: var(--dm-surface, #fff);
    color: var(--dm-text, #212121);
    font-size: 12px;
    cursor: pointer;
  }

  .grid-column-menu-btn:hover {
    background: var(--dm-surface-hover, #f5f5f5);
  }

  .grid-column-menu-columns {
    padding: 0 12px 4px;
    max-height: 200px;
    overflow-y: auto;
  }

  .grid-column-menu-column-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 3px 0;
    font-size: 13px;
    color: var(--dm-text, #212121);
    cursor: pointer;
  }

  .grid-column-menu-column-item input[type='checkbox'] {
    accent-color: var(--dm-primary, #1976d2);
  }

  /* Floating Filter Row */
  .grid-floating-filter-row {
    display: flex;
    border-bottom: 1px solid var(--dm-border, #e0e0e0);
    background: var(--dm-surface, #fff);
  }

  .grid-floating-filter-cell {
    display: flex;
    align-items: center;
    padding: 2px 4px;
    box-sizing: border-box;
    border-right: 1px solid var(--dm-border-light, #eee);
  }

  .grid-floating-filter-cell:last-child {
    border-right: none;
  }

  .grid-floating-filter-input {
    width: 100%;
    padding: 3px 6px;
    border: 1px solid var(--dm-border, #e0e0e0);
    border-radius: var(--dm-radius-sm, 4px);
    font-size: 12px;
    background: var(--dm-surface, #fff);
    color: var(--dm-text, #212121);
    outline: none;
  }

  .grid-floating-filter-input:focus {
    border-color: var(--dm-primary, #1976d2);
  }

  .grid-floating-filter-input::placeholder {
    color: var(--dm-text-secondary, #9e9e9e);
  }

  /* Quick Filter Bar */
  .grid-quick-filter {
    display: flex;
    align-items: center;
    padding: 6px 8px;
    border-bottom: 1px solid var(--dm-border, #e0e0e0);
    background: var(--dm-surface, #fff);
  }

  .grid-quick-filter-input {
    flex: 1;
    padding: 5px 8px;
    border: 1px solid var(--dm-border, #e0e0e0);
    border-radius: var(--dm-radius-sm, 4px);
    font-size: 13px;
    background: var(--dm-surface, #fff);
    color: var(--dm-text, #212121);
    outline: none;
  }

  .grid-quick-filter-input:focus {
    border-color: var(--dm-primary, #1976d2);
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
  }

  .grid-quick-filter-input::placeholder {
    color: var(--dm-text-secondary, #9e9e9e);
  }

  /* Header menu button */
  .grid-header-menu-btn {
    display: none;
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 11px;
    color: var(--dm-text-secondary, #757575);
    padding: 0;
    line-height: 18px;
    text-align: center;
    border-radius: 2px;
  }

  .grid-header-cell:hover .grid-header-menu-btn {
    display: block;
  }

  .grid-header-menu-btn:hover {
    background: var(--dm-surface-hover, #e0e0e0);
    color: var(--dm-text, #212121);
  }
`;
