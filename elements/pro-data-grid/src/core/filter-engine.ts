/**
 * Client-side filter engine.
 *
 * Applies text, number, date, and set filters to row data.
 * Supports single-condition and dual-condition (AND/OR) filtering.
 * All filter operations are debounce-friendly — designed to be called
 * after user input settles.
 */

import type {
  Row,
  FilterModel,
  TextFilterModel,
  NumberFilterModel,
  DateFilterModel,
  SetFilterModel,
  MultiFilterModel,
  ColumnDef,
} from '../types.js';

export class FilterEngine {
  /**
   * Filter rows by applying all active filters.
   * Returns a new filtered array (does not mutate input).
   */
  filter(rows: Row[], filterModel: Record<string, FilterModel>, _columns: ColumnDef[]): Row[] {
    const activeFilters = Object.entries(filterModel);
    if (activeFilters.length === 0) return rows;

    return rows.filter((row) =>
      activeFilters.every(([field, model]) => this.#matchesFilter(row, field, model)),
    );
  }

  /**
   * Check if a single row matches a single filter.
   */
  #matchesFilter(row: Row, field: string, model: FilterModel): boolean {
    switch (model.type) {
      case 'text':
        return this.#matchesTextFilter(row[field], model);
      case 'number':
        return this.#matchesNumberFilter(row[field], model);
      case 'date':
        return this.#matchesDateFilter(row[field], model);
      case 'set':
        return this.#matchesSetFilter(row[field], model);
      case 'multi':
        return this.#matchesMultiFilter(row, field, model);
      default:
        return true;
    }
  }

  #matchesTextFilter(value: unknown, model: TextFilterModel): boolean {
    const result1 = this.#evaluateTextCondition(value, model.operator, model.value);
    if (!model.condition2) return result1;

    const result2 = this.#evaluateTextCondition(
      value,
      model.condition2.operator as TextFilterModel['operator'],
      model.condition2.value,
    );
    return model.join === 'OR' ? result1 || result2 : result1 && result2;
  }

  #evaluateTextCondition(
    value: unknown,
    operator: TextFilterModel['operator'],
    filterValue: string,
  ): boolean {
    if (operator === 'blank') return value == null || String(value).trim() === '';
    if (operator === 'notBlank') return value != null && String(value).trim() !== '';

    const str = String(value ?? '').toLowerCase();
    const filter = filterValue.toLowerCase();

    switch (operator) {
      case 'contains':
        return str.includes(filter);
      case 'notContains':
        return !str.includes(filter);
      case 'equals':
        return str === filter;
      case 'notEqual':
        return str !== filter;
      case 'startsWith':
        return str.startsWith(filter);
      case 'endsWith':
        return str.endsWith(filter);
      default:
        return true;
    }
  }

  #matchesNumberFilter(value: unknown, model: NumberFilterModel): boolean {
    const result1 = this.#evaluateNumberCondition(
      value,
      model.operator,
      model.value,
      model.valueTo,
    );
    if (!model.condition2) return result1;

    const result2 = this.#evaluateNumberCondition(
      value,
      model.condition2.operator as NumberFilterModel['operator'],
      model.condition2.value,
      model.condition2.valueTo,
    );
    return model.join === 'OR' ? result1 || result2 : result1 && result2;
  }

  #evaluateNumberCondition(
    value: unknown,
    operator: NumberFilterModel['operator'],
    filterValue: number,
    filterValueTo?: number,
  ): boolean {
    if (operator === 'blank') return value == null || value === '';
    if (operator === 'notBlank') return value != null && value !== '';

    if (value == null || value === '') return false;
    const num = Number(value);
    if (Number.isNaN(num)) return false;

    switch (operator) {
      case 'equals':
        return num === filterValue;
      case 'notEqual':
        return num !== filterValue;
      case 'lessThan':
        return num < filterValue;
      case 'lessThanOrEqual':
        return num <= filterValue;
      case 'greaterThan':
        return num > filterValue;
      case 'greaterThanOrEqual':
        return num >= filterValue;
      case 'inRange':
        return filterValueTo != null
          ? num >= filterValue && num <= filterValueTo
          : num >= filterValue;
      default:
        return true;
    }
  }

  #matchesDateFilter(value: unknown, model: DateFilterModel): boolean {
    const result1 = this.#evaluateDateCondition(value, model.operator, model.value, model.valueTo);
    if (!model.condition2) return result1;

    const result2 = this.#evaluateDateCondition(
      value,
      model.condition2.operator as DateFilterModel['operator'],
      model.condition2.value,
      model.condition2.valueTo,
    );
    return model.join === 'OR' ? result1 || result2 : result1 && result2;
  }

  #evaluateDateCondition(
    value: unknown,
    operator: DateFilterModel['operator'],
    filterValue: string,
    filterValueTo?: string,
  ): boolean {
    if (operator === 'blank') return value == null || value === '';
    if (operator === 'notBlank') return value != null && value !== '';

    const date = new Date(String(value)).getTime();
    const filterDate = new Date(filterValue).getTime();
    if (Number.isNaN(date) || Number.isNaN(filterDate)) return false;

    switch (operator) {
      case 'equals':
        return date === filterDate;
      case 'notEqual':
        return date !== filterDate;
      case 'lessThan':
        return date < filterDate;
      case 'greaterThan':
        return date > filterDate;
      case 'inRange': {
        const filterTo = filterValueTo ? new Date(filterValueTo).getTime() : Infinity;
        return date >= filterDate && date <= filterTo;
      }
      default:
        return true;
    }
  }

  #matchesSetFilter(value: unknown, model: SetFilterModel): boolean {
    if (model.values.length === 0) return true;
    return model.values.includes(value);
  }

  #matchesMultiFilter(row: Row, field: string, model: MultiFilterModel): boolean {
    // Multi-filter: all sub-filters must pass (AND logic)
    return model.filterModels.every((subModel) => this.#matchesFilter(row, field, subModel));
  }
}
