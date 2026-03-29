/**
 * Register all custom elements for documentation demos
 */
import mermaid from 'mermaid';
// Expose mermaid globally so el-dm-markdown can find it.
// The element uses a dynamic import('mermaid') which Vite cannot rewrite in
// pre-built dist files; globalThis acts as the bridge.
(globalThis as unknown as Record<string, unknown>).mermaid = mermaid;

import { register as registerButton } from '@duskmoon-dev/el-button';
import { register as registerCard } from '@duskmoon-dev/el-card';
import { register as registerInput } from '@duskmoon-dev/el-input';
import { register as registerMarkdown } from '@duskmoon-dev/el-markdown';
import { register as registerMarkdownInput } from '@duskmoon-dev/el-markdown-input';
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
import { register as registerCascader } from '@duskmoon-dev/el-cascader';
import { register as registerDatepicker } from '@duskmoon-dev/el-datepicker';
import { register as registerSelect } from '@duskmoon-dev/el-select';
// Navigation elements
import { register as registerBottomNavigation } from '@duskmoon-dev/el-bottom-navigation';
import { register as registerBreadcrumbs } from '@duskmoon-dev/el-breadcrumbs';
import { register as registerDrawer } from '@duskmoon-dev/el-drawer';
import { register as registerMenu } from '@duskmoon-dev/el-menu';
import { register as registerNavbar } from '@duskmoon-dev/el-navbar';
import { register as registerPagination } from '@duskmoon-dev/el-pagination';
import { register as registerStepper } from '@duskmoon-dev/el-stepper';
import { register as registerTabs } from '@duskmoon-dev/el-tabs';
// Surface elements
import { register as registerAccordion } from '@duskmoon-dev/el-accordion';
import { register as registerBottomSheet } from '@duskmoon-dev/el-bottom-sheet';
import { register as registerPopover } from '@duskmoon-dev/el-popover';
// Data display elements
import { register as registerTable } from '@duskmoon-dev/el-table';
import { register as registerProDataGrid } from '@duskmoon-dev/el-pro-data-grid';
// New elements
import { register as registerFormGroup } from '@duskmoon-dev/el-form-group';
import { register as registerNavigation } from '@duskmoon-dev/el-navigation';
import { register as registerNestedMenu } from '@duskmoon-dev/el-nested-menu';
import { register as registerOtpInput } from '@duskmoon-dev/el-otp-input';
import { register as registerPinInput } from '@duskmoon-dev/el-pin-input';
import { register as registerSegmentControl } from '@duskmoon-dev/el-segment-control';
import { register as registerThemeController } from '@duskmoon-dev/el-theme-controller';
import { register as registerTimeInput } from '@duskmoon-dev/el-time-input';
import { register as registerCodeEngine } from '@duskmoon-dev/el-code-engine';
// CSS Art elements
import { register as registerArtMoon } from '@duskmoon-dev/el-art-moon';
import { register as registerArtSun } from '@duskmoon-dev/el-art-sun';
import { register as registerArtAtom } from '@duskmoon-dev/el-art-atom';
import { register as registerArtEclipse } from '@duskmoon-dev/el-art-eclipse';
import { register as registerArtMountain } from '@duskmoon-dev/el-art-mountain';
import { register as registerArtPlasmaBall } from '@duskmoon-dev/el-art-plasma-ball';
import { register as registerArtCatStargazer } from '@duskmoon-dev/el-art-cat-stargazer';
import { register as registerArtColorSpin } from '@duskmoon-dev/el-art-color-spin';
import { register as registerArtSynthwaveStarfield } from '@duskmoon-dev/el-art-synthwave-starfield';
import { register as registerArtCircularGallery } from '@duskmoon-dev/el-art-circular-gallery';
import { register as registerArtSnow } from '@duskmoon-dev/el-art-snow';
import { register as registerArtGeminiInput } from '@duskmoon-dev/el-art-gemini-input';
import { register as registerArtSnowballPreloader } from '@duskmoon-dev/el-art-snowball-preloader';
import { register as registerArtCsswitch } from '@duskmoon-dev/el-art-csswitch';

registerButton();
registerCard();
registerInput();
registerMarkdown();
registerMarkdownInput();
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
registerCascader();
registerDatepicker();
registerSelect();
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
registerProDataGrid();
// New elements
registerFormGroup();
registerNavigation();
registerNestedMenu();
registerOtpInput();
registerPinInput();
registerSegmentControl();
registerThemeController();
registerTimeInput();
registerCodeEngine();
// CSS Art elements
registerArtMoon();
registerArtSun();
registerArtAtom();
registerArtEclipse();
registerArtMountain();
registerArtPlasmaBall();
registerArtCatStargazer();
registerArtColorSpin();
registerArtSynthwaveStarfield();
registerArtCircularGallery();
registerArtSnow();
registerArtGeminiInput();
registerArtSnowballPreloader();
registerArtCsswitch();
