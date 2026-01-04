# @duskmoon-dev/playground

Interactive playground for DuskMoon custom elements.

## Development

Start the development server:

```bash
# From repository root
bun run playground

# Or from this directory
bun run dev
```

The playground will be available at `http://localhost:4220`.

## Build

Build the playground for production:

```bash
# From repository root
bun run playground:build

# Or from this directory
bun run build
```

Output will be in `dist/`.

## Preview

Preview the production build:

```bash
# From repository root
bun run playground:preview

# Or from this directory
bun run preview
```

## Server Configuration

- **Host**: `0.0.0.0` (accessible from network)
- **Port**: `4220`
- **Auto-open**: Disabled

## Pages

The playground is a multi-page application (MPA) with dedicated pages for each element:

| Page | Element | Description |
|------|---------|-------------|
| [index.html](index.html) | - | Element listing with navigation |
| [button.html](button.html) | `<el-dm-button>` | Button variants, sizes, loading states |
| [card.html](card.html) | `<el-dm-card>` | Card variants, interactive states, media slots |
| [input.html](input.html) | `<el-dm-input>` | Input types, validation, prefix/suffix slots |
| [markdown.html](markdown.html) | `<el-dm-markdown>` | Markdown rendering, syntax highlighting, themes |
