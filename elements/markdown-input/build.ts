const format = Bun.argv[2];
if (format !== 'esm' && format !== 'cjs') throw new Error('Expected esm or cjs build format');

const { version } = await Bun.file(new URL('./package.json', import.meta.url)).json();
const result = await Bun.build({
  entrypoints: ['./src/index.ts', './src/register.ts', './src/render.ts'],
  outdir: `./dist/${format}`,
  format,
  sourcemap: 'linked',
  define: {
    __MERMAID_CDN_URL__: JSON.stringify(
      `https://cdn.jsdelivr.net/npm/@duskmoon-dev/el-markdown-input@${version}/dist/esm/mermaid.js`,
    ),
  },
  external: [
    '@duskmoon-dev/el-base',
    '@duskmoon-dev/core',
    'unified',
    'remark-parse',
    'remark-frontmatter',
    'remark-gfm',
    'remark-breaks',
    'remark-rehype',
    'rehype-prism-plus',
    'rehype-sanitize',
    'rehype-stringify',
    'hast-util-sanitize',
    './render*',
    './mermaid.*',
    'katex',
  ],
  plugins: [
    {
      name: 'bundled-mermaid-loader',
      setup(build) {
        // Published modules resolve the private bundle locally or from the package CDN.
        build.onResolve({ filter: /^\.\/mermaid-loader\.js$/ }, () => ({
          path: new URL('./src/mermaid-loader-bundled.ts', import.meta.url).pathname,
        }));
      },
    },
  ],
});

if (!result.success) throw new AggregateError(result.logs, 'Markdown input build failed');
for (const output of result.outputs) console.log(`${output.path}: ${output.size} bytes`);

// The browser asset must be self-contained: CDNs serve it without resolving bare
// imports. In particular, bundle the patched KaTeX selected by the root override.
const mermaid = await Bun.build({
  entrypoints: ['./src/mermaid.ts'],
  outdir: `./dist/${format}`,
  format,
  sourcemap: 'linked',
});
if (!mermaid.success) throw new AggregateError(mermaid.logs, 'Mermaid bundle build failed');
for (const output of mermaid.outputs) console.log(`${output.path}: ${output.size} bytes`);
