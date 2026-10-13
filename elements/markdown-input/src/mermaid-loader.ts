const mermaidSpecifier = 'mermaid';

export function loadMermaid() {
  return import(/* @vite-ignore */ mermaidSpecifier);
}
