# @duskmoon-dev/el-table

A full-featured data table web component with sorting, pagination, and row selection.

## Installation

```bash
npm install @duskmoon-dev/el-table
```

## Usage

### Data API

```html
<el-dm-table id="my-table" paginated selection-mode="multiple" striped></el-dm-table>

<script type="module">
  import '@duskmoon-dev/el-table/register';

  const table = document.getElementById('my-table');

  table.columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', width: '120px' },
  ];

  table.data = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  ];
</script>
```

### Declarative API

```html
<el-dm-table paginated page-size="5">
  <el-dm-table-column key="name" label="Name" sortable></el-dm-table-column>
  <el-dm-table-column key="email" label="Email" sortable></el-dm-table-column>
  <el-dm-table-column key="role" label="Role" width="120px"></el-dm-table-column>
</el-dm-table>
```

## Properties

| Property         | Type                               | Default               | Description             |
| ---------------- | ---------------------------------- | --------------------- | ----------------------- |
| `columns`        | `TableColumn[]`                    | `[]`                  | Column definitions      |
| `data`           | `TableRow[]`                       | `[]`                  | Row data                |
| `sort-column`    | `string`                           | -                     | Current sort column key |
| `sort-direction` | `'asc' \| 'desc'`                  | `'asc'`               | Sort direction          |
| `paginated`      | `boolean`                          | `false`               | Enable pagination       |
| `page`           | `number`                           | `1`                   | Current page            |
| `page-size`      | `number`                           | `10`                  | Rows per page           |
| `selection-mode` | `'none' \| 'single' \| 'multiple'` | `'none'`              | Selection mode          |
| `striped`        | `boolean`                          | `false`               | Alternating row colors  |
| `bordered`       | `boolean`                          | `false`               | Cell borders            |
| `hoverable`      | `boolean`                          | `true`                | Row hover effect        |
| `compact`        | `boolean`                          | `false`               | Reduced padding         |
| `sticky-header`  | `boolean`                          | `false`               | Fixed header on scroll  |
| `loading`        | `boolean`                          | `false`               | Loading state           |
| `empty-message`  | `string`                           | `'No data available'` | Empty state text        |

## Events

| Event         | Detail                          | Description                  |
| ------------- | ------------------------------- | ---------------------------- |
| `sort`        | `{ column, direction }`         | Fired when sort changes      |
| `select`      | `{ selectedIds, selectedRows }` | Fired when selection changes |
| `page-change` | `{ page, pageSize }`            | Fired when page changes      |
| `row-click`   | `{ row, rowIndex }`             | Fired when row is clicked    |

## CSS Custom Properties

The table uses CSS custom properties from `@duskmoon-dev/el-core` theme:

- `--color-surface` - Table background
- `--color-surface-variant` - Header/stripe background
- `--color-on-surface` - Text color
- `--color-outline` - Border color
- `--color-primary` - Sort indicator, selection highlight
- `--radius-md` - Border radius
