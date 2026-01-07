/**
 * DuskMoon Tabs Element
 *
 * A tab navigation component with tab panels for organizing content.
 * Implements WAI-ARIA tabs pattern for accessibility.
 *
 * @element el-dm-tabs
 *
 * @attr {string} value - Currently selected tab id
 * @attr {string} variant - Tab style variant: underline, pills, enclosed
 * @attr {string} color - Color theme for tabs
 * @attr {string} orientation - Tab orientation: horizontal, vertical
 *
 * @slot - Default slot for el-dm-tab and el-dm-tab-panel elements
 *
 * @csspart tablist - The tab list container
 * @csspart indicator - The animated indicator (underline variant)
 *
 * @fires change - Fired when tab selection changes
 */

import { BaseElement, css } from '@duskmoon-dev/el-core';

export type TabsVariant = 'underline' | 'pills' | 'enclosed';
export type TabsOrientation = 'horizontal' | 'vertical';

const styles = css`
  :host {
    display: block;
    font-family: inherit;
  }

  :host([hidden]) {
    display: none !important;
  }

  :host([orientation='vertical']) {
    display: flex;
    gap: 1rem;
  }

  .tablist {
    display: flex;
    position: relative;
    gap: 0.25rem;
    border-bottom: 1px solid var(--color-outline);
  }

  :host([variant='pills']) .tablist {
    border-bottom: none;
    gap: 0.5rem;
  }

  :host([variant='enclosed']) .tablist {
    border-bottom: 1px solid var(--color-outline);
    gap: 0;
  }

  :host([orientation='vertical']) .tablist {
    flex-direction: column;
    border-bottom: none;
    border-right: 1px solid var(--color-outline);
    padding-right: 0.5rem;
  }

  :host([orientation='vertical'][variant='pills']) .tablist {
    border-right: none;
  }

  :host([orientation='vertical'][variant='enclosed']) .tablist {
    border-right: 1px solid var(--color-outline);
    padding-right: 0;
  }

  .indicator {
    position: absolute;
    bottom: -1px;
    height: 2px;
    background-color: var(--color-primary);
    transition:
      left 200ms ease,
      width 200ms ease;
    pointer-events: none;
  }

  :host([orientation='vertical']) .indicator {
    right: -1px;
    left: auto;
    bottom: auto;
    width: 2px;
    height: auto;
    transition:
      top 200ms ease,
      height 200ms ease;
  }

  :host([variant='pills']) .indicator,
  :host([variant='enclosed']) .indicator {
    display: none;
  }

  .panels {
    flex: 1;
    min-width: 0;
  }

  ::slotted(el-dm-tab-panel) {
    display: none;
  }

  ::slotted(el-dm-tab-panel[active]) {
    display: block;
  }
`;

export class ElDmTabs extends BaseElement {
  static properties = {
    value: { type: String, reflect: true },
    variant: { type: String, reflect: true, default: 'underline' },
    color: { type: String, reflect: true },
    orientation: { type: String, reflect: true, default: 'horizontal' },
  };

  declare value: string;
  declare variant: TabsVariant;
  declare color: string;
  declare orientation: TabsOrientation;

  private _indicatorStyle = '';

  constructor() {
    super();
    this.attachStyles(styles);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('tab-click', this._handleTabClick as EventListener);
    this.addEventListener('keydown', this._handleKeyDown);

    // Initialize selection after DOM is ready
    requestAnimationFrame(() => {
      this._initializeSelection();
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('tab-click', this._handleTabClick as EventListener);
    this.removeEventListener('keydown', this._handleKeyDown);
  }

  private _initializeSelection(): void {
    const tabs = this._getTabs();
    if (tabs.length === 0) return;

    // If no value set, select first tab
    if (!this.value && tabs.length > 0) {
      const firstTab = tabs[0];
      const tabId = firstTab.getAttribute('tab-id');
      if (tabId) {
        this.value = tabId;
      }
    }

    this._updateSelection();
  }

  private _getTabs(): HTMLElement[] {
    return Array.from(this.querySelectorAll('el-dm-tab'));
  }

  private _getPanels(): HTMLElement[] {
    return Array.from(this.querySelectorAll('el-dm-tab-panel'));
  }

  private _handleTabClick = (event: CustomEvent<{ tabId: string }>): void => {
    const { tabId } = event.detail;
    if (tabId && tabId !== this.value) {
      const oldValue = this.value;
      this.value = tabId;
      this._updateSelection();
      this.emit('change', { value: tabId, oldValue });
    }
  };

  private _handleKeyDown = (event: KeyboardEvent): void => {
    const target = event.target as HTMLElement;
    if (target.tagName !== 'EL-DM-TAB') return;

    const tabs = this._getTabs();
    const currentIndex = tabs.indexOf(target);
    if (currentIndex === -1) return;

    let nextIndex = -1;
    const isVertical = this.orientation === 'vertical';

    switch (event.key) {
      case 'ArrowLeft':
        if (!isVertical) {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        }
        break;
      case 'ArrowRight':
        if (!isVertical) {
          nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        }
        break;
      case 'ArrowUp':
        if (isVertical) {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        }
        break;
      case 'ArrowDown':
        if (isVertical) {
          nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        }
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    if (nextIndex !== -1) {
      event.preventDefault();
      const nextTab = tabs[nextIndex];
      nextTab.focus();
      const tabId = nextTab.getAttribute('tab-id');
      if (tabId) {
        const oldValue = this.value;
        this.value = tabId;
        this._updateSelection();
        this.emit('change', { value: tabId, oldValue });
      }
    }
  };

  private _updateSelection(): void {
    const tabs = this._getTabs();
    const panels = this._getPanels();

    // Update tab states
    tabs.forEach((tab) => {
      const tabId = tab.getAttribute('tab-id');
      const isSelected = tabId === this.value;
      tab.setAttribute('aria-selected', String(isSelected));
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');
      if (isSelected) {
        tab.setAttribute('active', '');
      } else {
        tab.removeAttribute('active');
      }
    });

    // Update panel states
    panels.forEach((panel) => {
      const panelFor = panel.getAttribute('panel-for');
      const isActive = panelFor === this.value;
      if (isActive) {
        panel.setAttribute('active', '');
        panel.removeAttribute('hidden');
      } else {
        panel.removeAttribute('active');
        panel.setAttribute('hidden', '');
      }
    });

    // Update indicator position
    this._updateIndicator();
  }

  private _updateIndicator(): void {
    if (this.variant !== 'underline') return;

    const activeTab = this.querySelector('el-dm-tab[active]') as HTMLElement | null;
    if (!activeTab) {
      this._indicatorStyle = 'display: none;';
      this.update();
      return;
    }

    const tablist = this.shadowRoot?.querySelector('.tablist');
    if (!tablist) return;

    const tablistRect = tablist.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();

    if (this.orientation === 'vertical') {
      const top = tabRect.top - tablistRect.top;
      this._indicatorStyle = `top: ${top}px; height: ${tabRect.height}px;`;
    } else {
      const left = tabRect.left - tablistRect.left;
      this._indicatorStyle = `left: ${left}px; width: ${tabRect.width}px;`;
    }

    this.update();
  }

  render(): string {
    const colorStyle = this.color ? `--color-primary: var(--color-${this.color}, ${this.color});` : '';

    return `
      <div
        class="tablist"
        role="tablist"
        part="tablist"
        aria-orientation="${this.orientation || 'horizontal'}"
        style="${colorStyle}"
      >
        <slot name="tab"></slot>
        <div class="indicator" part="indicator" style="${this._indicatorStyle}"></div>
      </div>
      <div class="panels">
        <slot></slot>
      </div>
    `;
  }

  update(): void {
    super.update();

    // Re-attach mutation observer after update
    requestAnimationFrame(() => {
      this._updateIndicator();
    });
  }
}

/**
 * DuskMoon Tab Element
 *
 * Individual tab button within el-dm-tabs.
 *
 * @element el-dm-tab
 *
 * @attr {string} tab-id - Unique identifier for this tab
 * @attr {boolean} disabled - Whether the tab is disabled
 *
 * @slot - Default slot for tab label
 *
 * @csspart tab - The tab button
 */

const tabStyles = css`
  :host {
    display: inline-flex;
  }

  :host([hidden]) {
    display: none !important;
  }

  .tab {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: none;
    background: transparent;
    color: var(--color-on-surface);
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition:
      color 150ms ease,
      background-color 150ms ease,
      border-color 150ms ease;
    position: relative;
  }

  .tab:hover:not(:disabled) {
    color: var(--color-primary);
    background-color: var(--color-surface-variant);
  }

  .tab:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
    border-radius: 0.25rem;
  }

  .tab:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  :host([active]) .tab {
    color: var(--color-primary);
  }

  /* Pills variant styles */
  :host-context(el-dm-tabs[variant='pills']) .tab {
    border-radius: 9999px;
    padding: 0.5rem 1rem;
  }

  :host-context(el-dm-tabs[variant='pills'][active]) .tab,
  :host([active]):host-context(el-dm-tabs[variant='pills']) .tab {
    background-color: var(--color-primary);
    color: var(--color-on-primary);
  }

  /* Enclosed variant styles */
  :host-context(el-dm-tabs[variant='enclosed']) .tab {
    border: 1px solid transparent;
    border-bottom: none;
    border-radius: 0.5rem 0.5rem 0 0;
    margin-bottom: -1px;
    padding: 0.75rem 1.25rem;
  }

  :host([active]):host-context(el-dm-tabs[variant='enclosed']) .tab {
    border-color: var(--color-outline);
    background-color: var(--color-surface);
  }

  /* Vertical orientation */
  :host-context(el-dm-tabs[orientation='vertical']) .tab {
    width: 100%;
    justify-content: flex-start;
  }

  :host-context(el-dm-tabs[orientation='vertical'][variant='enclosed']) .tab {
    border-radius: 0.5rem 0 0 0.5rem;
    border: 1px solid transparent;
    border-right: none;
    margin-right: -1px;
    margin-bottom: 0;
  }

  :host([active]):host-context(el-dm-tabs[orientation='vertical'][variant='enclosed']) .tab {
    border-color: var(--color-outline);
  }
`;

export class ElDmTab extends BaseElement {
  static properties = {
    tabId: { type: String, reflect: true, attribute: 'tab-id' },
    disabled: { type: Boolean, reflect: true },
    active: { type: Boolean, reflect: true },
  };

  declare tabId: string;
  declare disabled: boolean;
  declare active: boolean;

  constructor() {
    super();
    this.attachStyles(tabStyles);
    this.slot = 'tab';
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'tab');
    this.setAttribute('tabindex', this.active ? '0' : '-1');
  }

  private _handleClick(): void {
    if (this.disabled) return;
    this.emit('tab-click', { tabId: this.tabId }, { bubbles: true, composed: true });
  }

  render(): string {
    return `
      <button
        class="tab"
        part="tab"
        ?disabled="${this.disabled}"
        aria-selected="${this.active}"
        aria-disabled="${this.disabled}"
      >
        <slot></slot>
      </button>
    `;
  }

  update(): void {
    super.update();
    const button = this.shadowRoot?.querySelector('button');
    button?.addEventListener('click', this._handleClick.bind(this));
  }
}

/**
 * DuskMoon Tab Panel Element
 *
 * Content panel for el-dm-tabs.
 *
 * @element el-dm-tab-panel
 *
 * @attr {string} panel-for - ID of the tab this panel belongs to
 *
 * @slot - Default slot for panel content
 *
 * @csspart panel - The panel container
 */

const panelStyles = css`
  :host {
    display: block;
  }

  :host([hidden]) {
    display: none !important;
  }

  .panel {
    padding: 1rem 0;
  }
`;

export class ElDmTabPanel extends BaseElement {
  static properties = {
    panelFor: { type: String, reflect: true, attribute: 'panel-for' },
    active: { type: Boolean, reflect: true },
  };

  declare panelFor: string;
  declare active: boolean;

  constructor() {
    super();
    this.attachStyles(panelStyles);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'tabpanel');
    if (!this.active) {
      this.setAttribute('hidden', '');
    }
  }

  render(): string {
    return `
      <div class="panel" part="panel">
        <slot></slot>
      </div>
    `;
  }
}
