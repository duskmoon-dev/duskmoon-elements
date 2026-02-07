/**
 * Advanced filter engine for the data grid.
 *
 * Supports expression-based filtering with AND/OR/NOT logic,
 * nested groups, and multiple operators per field.
 */

import type { Row, ColumnDef } from '../types.js';

// ─── Types ──────────────────────────────────

export type FilterOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'inRange'
  | 'blank'
  | 'notBlank'
  | 'inSet';

export interface FilterCondition {
  type: 'condition';
  field: string;
  operator: FilterOperator;
  value?: unknown;
  valueTo?: unknown; // For inRange
  values?: unknown[]; // For inSet
}

export interface FilterGroup {
  type: 'group';
  operator: 'AND' | 'OR';
  conditions: FilterExpression[];
}

export interface FilterNot {
  type: 'not';
  condition: FilterExpression;
}

export type FilterExpression = FilterCondition | FilterGroup | FilterNot;

// ─── Advanced Filter Engine ─────────────────

export class AdvancedFilter {
  #expression: FilterExpression | null = null;
  #externalPredicate: ((row: Row) => boolean) | null = null;

  // ─── Expression ────────────────────────────

  get expression(): FilterExpression | null {
    return this.#expression;
  }

  set expression(expr: FilterExpression | null) {
    this.#expression = expr;
  }

  get hasExpression(): boolean {
    return this.#expression !== null;
  }

  // ─── External Filter ───────────────────────

  get externalPredicate(): ((row: Row) => boolean) | null {
    return this.#externalPredicate;
  }

  set externalPredicate(fn: ((row: Row) => boolean) | null) {
    this.#externalPredicate = fn;
  }

  get hasExternalFilter(): boolean {
    return this.#externalPredicate !== null;
  }

  // ─── Apply Filter ──────────────────────────

  filter(rows: Row[], _columns?: ColumnDef[]): Row[] {
    let result = rows;

    // Apply expression filter
    if (this.#expression) {
      result = result.filter((row) => this.#evaluate(row, this.#expression!));
    }

    // Apply external predicate
    if (this.#externalPredicate) {
      result = result.filter(this.#externalPredicate);
    }

    return result;
  }

  // ─── Single-Row Test ───────────────────────

  testRow(row: Row): boolean {
    if (this.#expression && !this.#evaluate(row, this.#expression)) {
      return false;
    }
    if (this.#externalPredicate && !this.#externalPredicate(row)) {
      return false;
    }
    return true;
  }

  // ─── Clear ─────────────────────────────────

  clear(): void {
    this.#expression = null;
    this.#externalPredicate = null;
  }

  // ─── Builder Helpers ───────────────────────

  static and(...conditions: FilterExpression[]): FilterGroup {
    return { type: 'group', operator: 'AND', conditions };
  }

  static or(...conditions: FilterExpression[]): FilterGroup {
    return { type: 'group', operator: 'OR', conditions };
  }

  static not(condition: FilterExpression): FilterNot {
    return { type: 'not', condition };
  }

  static condition(
    field: string,
    operator: FilterOperator,
    value?: unknown,
    extra?: { valueTo?: unknown; values?: unknown[] },
  ): FilterCondition {
    return {
      type: 'condition',
      field,
      operator,
      value,
      valueTo: extra?.valueTo,
      values: extra?.values,
    };
  }

  // ─── Validation ────────────────────────────

  static validate(expr: FilterExpression): string[] {
    const errors: string[] = [];
    AdvancedFilter.#validateExpr(expr, errors, '');
    return errors;
  }

  static #validateExpr(expr: FilterExpression, errors: string[], path: string): void {
    if (expr.type === 'condition') {
      if (!expr.field) errors.push(`${path}: missing field`);
      if (!expr.operator) errors.push(`${path}: missing operator`);
      if (expr.operator === 'inRange' && expr.valueTo === undefined) {
        errors.push(`${path}: inRange requires valueTo`);
      }
      if (expr.operator === 'inSet' && (!expr.values || expr.values.length === 0)) {
        errors.push(`${path}: inSet requires values array`);
      }
    } else if (expr.type === 'group') {
      if (expr.conditions.length === 0) {
        errors.push(`${path}: empty group`);
      }
      for (let i = 0; i < expr.conditions.length; i++) {
        AdvancedFilter.#validateExpr(expr.conditions[i], errors, `${path}[${i}]`);
      }
    } else if (expr.type === 'not') {
      AdvancedFilter.#validateExpr(expr.condition, errors, `${path}.not`);
    }
  }

  // ─── Private: Evaluation ───────────────────

  #evaluate(row: Row, expr: FilterExpression): boolean {
    switch (expr.type) {
      case 'condition':
        return this.#evaluateCondition(row, expr);
      case 'group':
        return this.#evaluateGroup(row, expr);
      case 'not':
        return !this.#evaluate(row, expr.condition);
    }
  }

  #evaluateGroup(row: Row, group: FilterGroup): boolean {
    if (group.operator === 'AND') {
      return group.conditions.every((c) => this.#evaluate(row, c));
    }
    return group.conditions.some((c) => this.#evaluate(row, c));
  }

  #evaluateCondition(row: Row, cond: FilterCondition): boolean {
    const value = row[cond.field];
    const filterValue = cond.value;

    switch (cond.operator) {
      case 'equals':
        return value == filterValue; // intentional loose equality
      case 'notEquals':
        return value != filterValue;
      case 'contains':
        return String(value ?? '')
          .toLowerCase()
          .includes(String(filterValue ?? '').toLowerCase());
      case 'notContains':
        return !String(value ?? '')
          .toLowerCase()
          .includes(String(filterValue ?? '').toLowerCase());
      case 'startsWith':
        return String(value ?? '')
          .toLowerCase()
          .startsWith(String(filterValue ?? '').toLowerCase());
      case 'endsWith':
        return String(value ?? '')
          .toLowerCase()
          .endsWith(String(filterValue ?? '').toLowerCase());
      case 'greaterThan':
        return Number(value) > Number(filterValue);
      case 'lessThan':
        return Number(value) < Number(filterValue);
      case 'greaterThanOrEqual':
        return Number(value) >= Number(filterValue);
      case 'lessThanOrEqual':
        return Number(value) <= Number(filterValue);
      case 'inRange':
        return Number(value) >= Number(filterValue) && Number(value) <= Number(cond.valueTo);
      case 'blank':
        return value == null || value === '';
      case 'notBlank':
        return value != null && value !== '';
      case 'inSet':
        return (cond.values ?? []).includes(value);
      default:
        return true;
    }
  }
}
