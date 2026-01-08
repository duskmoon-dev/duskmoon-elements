export { ElDmTable, registerTable } from './el-dm-table.js';
export { ElDmTableColumn, registerTableColumn } from './el-dm-table-column.js';
export * from './types.js';

import { registerTable } from './el-dm-table.js';
import { registerTableColumn } from './el-dm-table-column.js';

export function register(): void {
  registerTable();
  registerTableColumn();
}
