/**
 * Auto-register all DuskMoon custom elements
 *
 * @example
 * ```ts
 * // Just import to register all elements
 * import '@duskmoon-dev/elements/register';
 *
 * // Now you can use all elements in HTML:
 * // <el-dm-button>Click me</el-dm-button>
 * // <el-dm-card>Content</el-dm-card>
 * // <el-dm-input></el-dm-input>
 * // <el-dm-markdown>## Markdown</el-dm-markdown>
 * ```
 */
import { register as registerButton } from '@duskmoon-dev/el-button';
import { register as registerCard } from '@duskmoon-dev/el-card';
import { register as registerInput } from '@duskmoon-dev/el-input';
import { register as registerMarkdown } from '@duskmoon-dev/el-markdown';
import { register as registerSwitch } from '@duskmoon-dev/el-switch';
import { register as registerAlert } from '@duskmoon-dev/el-alert';
import { register as registerDialog } from '@duskmoon-dev/el-dialog';
import { register as registerBadge } from '@duskmoon-dev/el-badge';
import { register as registerChip } from '@duskmoon-dev/el-chip';
import { register as registerTooltip } from '@duskmoon-dev/el-tooltip';
import { register as registerProgress } from '@duskmoon-dev/el-progress';
import { register as registerForm } from '@duskmoon-dev/el-form';
import { register as registerSlider } from '@duskmoon-dev/el-slider';
import { register as registerFileUpload } from '@duskmoon-dev/el-file-upload';
import { register as registerAutocomplete } from '@duskmoon-dev/el-autocomplete';
import { register as registerDatepicker } from '@duskmoon-dev/el-datepicker';
import { register as registerSelect } from '@duskmoon-dev/el-select';
import { register as registerCascader } from '@duskmoon-dev/el-cascader';
import { register as registerBottomNavigation } from '@duskmoon-dev/el-bottom-navigation';
import { register as registerCircleMenu } from '@duskmoon-dev/el-circle-menu';
import { register as registerBreadcrumbs } from '@duskmoon-dev/el-breadcrumbs';
import { register as registerDrawer } from '@duskmoon-dev/el-drawer';
import { register as registerMenu } from '@duskmoon-dev/el-menu';
import { register as registerNavbar } from '@duskmoon-dev/el-navbar';
import { register as registerPagination } from '@duskmoon-dev/el-pagination';
import { register as registerStepper } from '@duskmoon-dev/el-stepper';
import { register as registerTabs } from '@duskmoon-dev/el-tabs';
import { register as registerAccordion } from '@duskmoon-dev/el-accordion';
import { register as registerBottomSheet } from '@duskmoon-dev/el-bottom-sheet';
import { register as registerPopover } from '@duskmoon-dev/el-popover';
import { register as registerTable } from '@duskmoon-dev/el-table';
import {
  registerGridColumn,
  registerGridColumnGroup,
  registerProDataGrid,
} from '@duskmoon-dev/el-pro-data-grid';
import { register as registerCodeBlock } from '@duskmoon-dev/el-code-block';
import { register as registerFormGroup } from '@duskmoon-dev/el-form-group';
import { register as registerNavigation } from '@duskmoon-dev/el-navigation';
import { register as registerNestedMenu } from '@duskmoon-dev/el-nested-menu';
import { register as registerOtpInput } from '@duskmoon-dev/el-otp-input';
import { register as registerPinInput } from '@duskmoon-dev/el-pin-input';
import { register as registerSegmentControl } from '@duskmoon-dev/el-segment-control';
import { register as registerThemeController } from '@duskmoon-dev/el-theme-controller';
import { register as registerTimeInput } from '@duskmoon-dev/el-time-input';

const markdownInputRegisterSpecifier = '@duskmoon-dev/el-markdown-input/register';
const codeEngineRegisterSpecifier = '@duskmoon-dev/el-code-engine';

function registerMarkdownInput(): void {
  void import(/* @vite-ignore */ markdownInputRegisterSpecifier).catch(() => undefined);
}

function registerCodeEngine(): void {
  void import(/* @vite-ignore */ codeEngineRegisterSpecifier)
    .then(({ register }) => register())
    .catch(() => undefined);
}

registerButton();
registerCard();
registerInput();
registerMarkdown();
registerSwitch();
registerAlert();
registerDialog();
registerBadge();
registerChip();
registerTooltip();
registerProgress();
registerForm();
registerSlider();
registerFileUpload();
registerAutocomplete();
registerDatepicker();
registerBottomNavigation();
registerCircleMenu();
registerBreadcrumbs();
registerDrawer();
registerMenu();
registerNavbar();
registerPagination();
registerStepper();
registerTabs();
registerAccordion();
registerBottomSheet();
registerPopover();
registerTable();
registerProDataGrid();
registerGridColumn();
registerGridColumnGroup();
registerMarkdownInput();
registerSelect();
registerCascader();
registerCodeBlock();
registerCodeEngine();
registerFormGroup();
registerNavigation();
registerNestedMenu();
registerOtpInput();
registerPinInput();
registerSegmentControl();
registerThemeController();
registerTimeInput();
