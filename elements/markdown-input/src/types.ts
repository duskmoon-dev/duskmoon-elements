/**
 * An autocomplete suggestion provided by the host application.
 */
export interface Suggestion {
  /** Value inserted into the editor on confirmation */
  id: string;
  /** Display name shown in the dropdown */
  label: string;
  /** Optional secondary line (e.g. email, description) */
  subtitle?: string;
}
