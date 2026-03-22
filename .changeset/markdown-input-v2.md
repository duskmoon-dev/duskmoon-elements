---
"@duskmoon-dev/el-markdown-input": minor
---

feat(markdown-input): complete v2 implementation with enhanced accessibility and testing

- Full markdown preview with unified pipeline (remark/rehype), KaTeX, Mermaid, syntax highlighting
- Form-associated custom element with `value`, `name`, `disabled`, `required` support
- Accessibility: tablist pattern, `aria-busy` on preview panel, `role="alert"` for errors
- File upload with XHR progress, markdown snippet insertion, accepted type validation
- Autocomplete trigger system for extensible `@mention` / slash command integrations
- Live preview mode with debounced rendering
- Status bar with word/character/line counts
- AbortController-based render race condition prevention
