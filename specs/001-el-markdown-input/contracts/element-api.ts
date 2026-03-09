/**
 * @duskmoon-dev/el-markdown-input
 * Element API Contract — TypeScript type definitions
 *
 * This file defines the complete public API surface.
 * Implementation must satisfy all types defined here.
 */

// ─── Shared Types ─────────────────────────────────────────────────────────────

/**
 * An autocomplete suggestion provided by the host application.
 */
export interface Suggestion {
  /** Value inserted into the editor on confirmation (e.g. user handle, issue key) */
  id: string;
  /** Display name shown in the dropdown */
  label: string;
  /** Optional secondary line (e.g. email, description) */
  subtitle?: string;
}

// ─── Element Attributes ───────────────────────────────────────────────────────

/**
 * Attributes supported by <el-dm-markdown-input>.
 * All attributes are observed; changes trigger reactive updates.
 */
export interface MarkdownInputAttributes {
  /** Form field name — passed to ElementInternals.setFormValue() */
  name?: string;
  /** Current markdown content (initial value; use getValue/setValue for live access) */
  value?: string;
  /** Textarea placeholder text */
  placeholder?: string;
  /** Disables all editing when present */
  disabled?: boolean;
  /** POST endpoint for file uploads. Must return { url: string } on success */
  'upload-url'?: string;
  /** Soft word cap shown in the status bar */
  'max-words'?: number;
  /** Activates dark-mode Prism theme and dark CSS variable defaults */
  dark?: boolean;
}

// ─── Element Public API ───────────────────────────────────────────────────────

/**
 * Public JavaScript API exposed by ElDmMarkdownInput.
 * Consumers interact with the element through these methods.
 */
export interface MarkdownInputPublicAPI {
  /** Returns the current markdown content */
  getValue(): string;

  /**
   * Replaces the current content with str.
   * Updates form value. Does NOT fire a change event.
   */
  setValue(str: string): void;

  /**
   * Inserts str at the current cursor position (or replaces the current selection).
   * Fires a change event after insertion.
   */
  insertText(str: string): void;

  /**
   * Feeds suggestions into the autocomplete dropdown.
   * Call with an empty array to close the dropdown.
   * Typically called inside a resolve() callback from mention-query / reference-query.
   */
  setSuggestions(list: Suggestion[]): void;
}

// ─── Events ───────────────────────────────────────────────────────────────────

/** Fired on every user input. */
export interface ChangeEventDetail {
  value: string;
}

/** Fired when a file has been accepted for upload. */
export interface UploadStartEventDetail {
  file: File;
}

/** Fired when an upload completes successfully. */
export interface UploadDoneEventDetail {
  file: File;
  /** URL returned by the upload endpoint */
  url: string;
  /** Markdown snippet that was inserted into the editor */
  markdown: string;
}

/** Fired when an upload fails. */
export interface UploadErrorEventDetail {
  file: File;
  /** Human-readable error message */
  error: string;
}

/**
 * Fired when the user types @<query>.
 * The host calls resolve() with matching suggestions.
 */
export interface MentionQueryEventDetail {
  trigger: '@';
  query: string;
  resolve: (suggestions: Suggestion[]) => void;
}

/**
 * Fired when the user types #<query>.
 * The host calls resolve() with matching suggestions.
 */
export interface ReferenceQueryEventDetail {
  trigger: '#';
  query: string;
  resolve: (suggestions: Suggestion[]) => void;
}

/** Union of all event detail types keyed by event name */
export interface MarkdownInputEventMap {
  change: CustomEvent<ChangeEventDetail>;
  'upload-start': CustomEvent<UploadStartEventDetail>;
  'upload-done': CustomEvent<UploadDoneEventDetail>;
  'upload-error': CustomEvent<UploadErrorEventDetail>;
  'mention-query': CustomEvent<MentionQueryEventDetail>;
  'reference-query': CustomEvent<ReferenceQueryEventDetail>;
}

// ─── LiveView Hook ─────────────────────────────────────────────────────────────

/**
 * Phoenix LiveView hook object.
 * Register as:
 *   let liveSocket = new LiveSocket("/live", Socket, {
 *     hooks: { MarkdownInput: MarkdownInputHook }
 *   })
 */
export interface LiveViewHook {
  el: HTMLElement & MarkdownInputPublicAPI;
  pushEvent(event: string, payload: Record<string, unknown>): void;
  mounted(): void;
  updated(): void;
}

// ─── CSS Custom Properties ────────────────────────────────────────────────────

/**
 * CSS custom properties accepted on the :host element.
 * Each property has a fallback to the corresponding @duskmoon-dev/core token.
 *
 * @example
 * el-dm-markdown-input {
 *   --md-border: #d0d7de;
 *   --md-accent: #0969da;
 * }
 */
export interface MarkdownInputCSSProperties {
  /** Border color of the editor chrome */
  '--md-border': string;        // fallback: var(--color-outline)
  /** Border color when editor has focus */
  '--md-border-focus': string;  // fallback: var(--color-primary)
  /** Background of the editor area */
  '--md-bg': string;            // fallback: var(--color-surface)
  /** Background of the toolbar / tab bar */
  '--md-bg-toolbar': string;    // fallback: var(--color-surface-variant)
  /** Background on hover interactions */
  '--md-bg-hover': string;      // fallback: var(--color-surface-container)
  /** Primary text color */
  '--md-text': string;          // fallback: var(--color-on-surface)
  /** Muted / secondary text color */
  '--md-text-muted': string;    // fallback: var(--color-on-surface-variant)
  /** Accent / primary action color */
  '--md-accent': string;        // fallback: var(--color-primary)
  /** Border radius for editor chrome */
  '--md-radius': string;        // fallback: 6px
  /** Upload progress bar color */
  '--md-upload-bar': string;    // fallback: var(--color-primary)
}

// ─── Module Exports ────────────────────────────────────────────────────────────

/**
 * Expected named exports from @duskmoon-dev/el-markdown-input
 */
export interface PackageExports {
  /** The custom element class */
  ElDmMarkdownInput: new () => HTMLElement & MarkdownInputPublicAPI;

  /** Register the custom element (idempotent) */
  register: () => void;

  /** Phoenix LiveView hook object */
  MarkdownInputHook: LiveViewHook;

  /** Re-exported for host TypeScript usage */
  Suggestion: never; // type only — see interface above
}
