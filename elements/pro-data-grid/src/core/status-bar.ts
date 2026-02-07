/**
 * Status bar engine — bottom bar showing grid statistics.
 *
 * Provides built-in panels (total rows, filtered rows, selected rows)
 * and aggregation panel for selected cell ranges.
 */

// ─── Public Types ────────────────────────────

export interface StatusBarPanel {
  id: string;
  label: string;
  value: string | number;
  position: 'left' | 'center' | 'right';
}

export interface StatusBarConfig {
  enabled?: boolean;
  panels?: StatusBarPanel[];
  showTotalRows?: boolean;
  showFilteredRows?: boolean;
  showSelectedRows?: boolean;
  showAggregation?: boolean;
}

export interface StatusBarState {
  panels: StatusBarPanel[];
}

// ─── StatusBar Class ─────────────────────────

export class StatusBar {
  #enabled = false;
  #showTotalRows = true;
  #showFilteredRows = true;
  #showSelectedRows = true;
  #showAggregation = true;
  #customPanels: StatusBarPanel[] = [];

  get enabled(): boolean {
    return this.#enabled;
  }

  set enabled(value: boolean) {
    this.#enabled = value;
  }

  configure(config: StatusBarConfig): void {
    if (config.enabled !== undefined) this.#enabled = config.enabled;
    if (config.panels !== undefined) this.#customPanels = config.panels;
    if (config.showTotalRows !== undefined) this.#showTotalRows = config.showTotalRows;
    if (config.showFilteredRows !== undefined) this.#showFilteredRows = config.showFilteredRows;
    if (config.showSelectedRows !== undefined) this.#showSelectedRows = config.showSelectedRows;
    if (config.showAggregation !== undefined) this.#showAggregation = config.showAggregation;
  }

  /**
   * Build status bar panels from current grid state.
   */
  buildPanels(stats: {
    totalRows: number;
    filteredRows: number;
    selectedRows: number;
    aggregation?: { sum: number; count: number; avg: number; min: number; max: number };
  }): StatusBarPanel[] {
    const panels: StatusBarPanel[] = [];

    if (this.#showTotalRows) {
      panels.push({
        id: 'totalRows',
        label: 'Total Rows',
        value: stats.totalRows,
        position: 'left',
      });
    }

    if (this.#showFilteredRows && stats.filteredRows !== stats.totalRows) {
      panels.push({
        id: 'filteredRows',
        label: 'Filtered',
        value: stats.filteredRows,
        position: 'left',
      });
    }

    if (this.#showSelectedRows && stats.selectedRows > 0) {
      panels.push({
        id: 'selectedRows',
        label: 'Selected',
        value: stats.selectedRows,
        position: 'center',
      });
    }

    if (this.#showAggregation && stats.aggregation && stats.aggregation.count > 0) {
      const agg = stats.aggregation;
      panels.push(
        { id: 'aggSum', label: 'Sum', value: this.#formatNumber(agg.sum), position: 'right' },
        { id: 'aggAvg', label: 'Avg', value: this.#formatNumber(agg.avg), position: 'right' },
        { id: 'aggCount', label: 'Count', value: agg.count, position: 'right' },
        { id: 'aggMin', label: 'Min', value: this.#formatNumber(agg.min), position: 'right' },
        { id: 'aggMax', label: 'Max', value: this.#formatNumber(agg.max), position: 'right' },
      );
    }

    panels.push(...this.#customPanels);

    return panels;
  }

  /**
   * Render the status bar as HTML.
   */
  render(panels: StatusBarPanel[]): string {
    if (!this.#enabled || panels.length === 0) return '';

    const left = panels.filter((p) => p.position === 'left');
    const center = panels.filter((p) => p.position === 'center');
    const right = panels.filter((p) => p.position === 'right');

    return `<div class="grid-status-bar">
      <div class="status-bar-left">${left.map((p) => this.#renderPanel(p)).join('')}</div>
      <div class="status-bar-center">${center.map((p) => this.#renderPanel(p)).join('')}</div>
      <div class="status-bar-right">${right.map((p) => this.#renderPanel(p)).join('')}</div>
    </div>`;
  }

  #renderPanel(panel: StatusBarPanel): string {
    return `<span class="status-bar-panel" data-panel="${panel.id}">
      <span class="status-bar-label">${panel.label}:</span>
      <span class="status-bar-value">${panel.value}</span>
    </span>`;
  }

  #formatNumber(value: number): string {
    if (Number.isInteger(value)) return String(value);
    return value.toFixed(2);
  }
}
