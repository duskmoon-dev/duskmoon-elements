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
}
