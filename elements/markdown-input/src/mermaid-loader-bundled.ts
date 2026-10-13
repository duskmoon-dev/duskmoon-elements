// Replaced from package.json by the package build, including release version bumps.
declare const __MERMAID_CDN_URL__: string;

const localMermaidSpecifier = './mermaid.js';

export function loadMermaid() {
  // Native Node/Bun resolves the sibling module. Browser bundles use a versioned
  // asset so a single-file IIFE need not inline Mermaid or infer its own base URL.
  const nativeRuntime = (globalThis as { process?: { versions?: { node?: string } } }).process
    ?.versions?.node;
  const specifier = nativeRuntime ? localMermaidSpecifier : __MERMAID_CDN_URL__;
  return import(/* @vite-ignore */ specifier);
}
