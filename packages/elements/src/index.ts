/**
 * @duskmoon-dev/elements
 *
 * All DuskMoon custom elements in one package.
 * Import this package to get access to all element classes and register functions.
 *
 * @example
 * ```ts
 * import { ElDmButton, ElDmCard, registerAll } from '@duskmoon-dev/elements';
 *
 * // Register all elements
 * registerAll();
 *
 * // Or register individually
 * import { registerButton, registerCard } from '@duskmoon-dev/elements';
 * registerButton();
 * registerCard();
 * ```
 */

// Re-export core utilities
export {
  BaseElement,
  css,
  combineStyles,
  cssVars,
  defaultTheme,
  resetStyles,
} from '@duskmoon-dev/el-core';

export type {
  PropertyDefinition,
  PropertyDefinitions,
  Size,
  Variant,
  ValidationState,
  BaseElementProps,
  SizableProps,
  VariantProps,
  FormElementProps,
  ValidatableProps,
  ValueChangeEventDetail,
  AttributeConverter,
} from '@duskmoon-dev/el-core';

// Import elements and register functions
import { ElDmButton, register as registerButton } from '@duskmoon-dev/el-button';
import { ElDmCard, register as registerCard } from '@duskmoon-dev/el-card';
import { ElDmInput, register as registerInput } from '@duskmoon-dev/el-input';
import {
  ElDmMarkdown,
  register as registerMarkdown,
  github,
  atomOneDark,
  atomOneLight,
} from '@duskmoon-dev/el-markdown';
import { ElDmSwitch, register as registerSwitch } from '@duskmoon-dev/el-switch';
import { ElDmAlert, register as registerAlert } from '@duskmoon-dev/el-alert';
import { ElDmDialog, register as registerDialog } from '@duskmoon-dev/el-dialog';
import { ElDmBadge, register as registerBadge } from '@duskmoon-dev/el-badge';
import { ElDmChip, register as registerChip } from '@duskmoon-dev/el-chip';
import { ElDmTooltip, register as registerTooltip } from '@duskmoon-dev/el-tooltip';
import { ElDmProgress, register as registerProgress } from '@duskmoon-dev/el-progress';
import { ElDmForm, register as registerForm } from '@duskmoon-dev/el-form';
import { ElDmSlider, register as registerSlider } from '@duskmoon-dev/el-slider';
import { ElDmFileUpload, register as registerFileUpload } from '@duskmoon-dev/el-file-upload';
import { ElDmAutocomplete, register as registerAutocomplete } from '@duskmoon-dev/el-autocomplete';
import { ElDmDatepicker, register as registerDatepicker } from '@duskmoon-dev/el-datepicker';

// Navigation elements
import {
  ElDmBottomNavigation,
  register as registerBottomNavigation,
} from '@duskmoon-dev/el-bottom-navigation';
import { ElDmBreadcrumbs, register as registerBreadcrumbs } from '@duskmoon-dev/el-breadcrumbs';
import { ElDmDrawer, register as registerDrawer } from '@duskmoon-dev/el-drawer';
import { ElDmMenu, ElDmMenuItem, register as registerMenu } from '@duskmoon-dev/el-menu';
import { ElDmNavbar, register as registerNavbar } from '@duskmoon-dev/el-navbar';
import { ElDmPagination, register as registerPagination } from '@duskmoon-dev/el-pagination';
import { ElDmStepper, ElDmStep, register as registerStepper } from '@duskmoon-dev/el-stepper';
import {
  ElDmTabs,
  ElDmTab,
  ElDmTabPanel,
  register as registerTabs,
} from '@duskmoon-dev/el-tabs';

// Surface elements
import {
  ElDmAccordion,
  ElDmAccordionItem,
  register as registerAccordion,
} from '@duskmoon-dev/el-accordion';
import { ElDmBottomSheet, register as registerBottomSheet } from '@duskmoon-dev/el-bottom-sheet';
import { ElDmPopover, register as registerPopover } from '@duskmoon-dev/el-popover';

// Data display elements
import {
  ElDmTable,
  ElDmTableColumn,
  register as registerTable,
} from '@duskmoon-dev/el-table';

// Re-export all elements
export { ElDmButton, registerButton };
export { ElDmCard, registerCard };
export type { CardVariant, CardPadding } from '@duskmoon-dev/el-card';
export { ElDmInput, registerInput };
export { ElDmMarkdown, registerMarkdown, github, atomOneDark, atomOneLight };
export type { MarkdownTheme } from '@duskmoon-dev/el-markdown';
export { ElDmSwitch, registerSwitch };
export type { SwitchSize, SwitchColor } from '@duskmoon-dev/el-switch';
export { ElDmAlert, registerAlert };
export type { AlertType, AlertVariant } from '@duskmoon-dev/el-alert';
export { ElDmDialog, registerDialog };
export type { DialogSize } from '@duskmoon-dev/el-dialog';
export { ElDmBadge, registerBadge };
export type { BadgeVariant, BadgeColor, BadgeSize } from '@duskmoon-dev/el-badge';
export { ElDmChip, registerChip };
export type { ChipVariant, ChipColor, ChipSize } from '@duskmoon-dev/el-chip';
export { ElDmTooltip, registerTooltip };
export type { TooltipPosition, TooltipTrigger } from '@duskmoon-dev/el-tooltip';
export { ElDmProgress, registerProgress };
export type { ProgressColor, ProgressSize } from '@duskmoon-dev/el-progress';
export { ElDmForm, registerForm };
export type { FormValidationState } from '@duskmoon-dev/el-form';
export { ElDmSlider, registerSlider };
export type { SliderSize, SliderColor } from '@duskmoon-dev/el-slider';
export { ElDmFileUpload, registerFileUpload };
export type { FileUploadSize, UploadedFile } from '@duskmoon-dev/el-file-upload';
export { ElDmAutocomplete, registerAutocomplete };
export type { AutocompleteSize, AutocompleteOption } from '@duskmoon-dev/el-autocomplete';
export { ElDmDatepicker, registerDatepicker };
export type { DatepickerSize } from '@duskmoon-dev/el-datepicker';

// Navigation elements
export { ElDmBottomNavigation, registerBottomNavigation };
export type { BottomNavigationItem } from '@duskmoon-dev/el-bottom-navigation';
export { ElDmBreadcrumbs, registerBreadcrumbs };
export type { BreadcrumbItem, NavigateEventDetail } from '@duskmoon-dev/el-breadcrumbs';
export { ElDmDrawer, registerDrawer };
export type { DrawerPosition } from '@duskmoon-dev/el-drawer';
export { ElDmMenu, ElDmMenuItem, registerMenu };
export { ElDmNavbar, registerNavbar };
export type { NavbarColor } from '@duskmoon-dev/el-navbar';
export { ElDmPagination, registerPagination };
export { ElDmStepper, ElDmStep, registerStepper };
export type { StepData, StepperOrientation, StepperColor } from '@duskmoon-dev/el-stepper';
export { ElDmTabs, ElDmTab, ElDmTabPanel, registerTabs };
export type { TabsVariant, TabsOrientation } from '@duskmoon-dev/el-tabs';

// Surface elements
export { ElDmAccordion, ElDmAccordionItem, registerAccordion };
export { ElDmBottomSheet, registerBottomSheet };
export { ElDmPopover, registerPopover };
export type { PopoverPlacement, PopoverTrigger } from '@duskmoon-dev/el-popover';

// Data display elements
export { ElDmTable, ElDmTableColumn, registerTable };
export type {
  TableColumn,
  TableRow,
  SortDirection,
  SelectionMode,
  TableSortEventDetail,
  TableSelectEventDetail,
  TablePageEventDetail,
  TableRowClickEventDetail,
} from '@duskmoon-dev/el-table';

/**
 * Register all DuskMoon custom elements
 *
 * @example
 * ```ts
 * import { registerAll } from '@duskmoon-dev/elements';
 * registerAll();
 * ```
 */
export function registerAll(): void {
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
  // Navigation elements
  registerBottomNavigation();
  registerBreadcrumbs();
  registerDrawer();
  registerMenu();
  registerNavbar();
  registerPagination();
  registerStepper();
  registerTabs();
  // Surface elements
  registerAccordion();
  registerBottomSheet();
  registerPopover();
  // Data display elements
  registerTable();
}
