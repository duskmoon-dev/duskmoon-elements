import { ElDmArtMoon, register as registerArtMoon } from '@duskmoon-dev/el-art-moon';
import { ElDmArtSun, register as registerArtSun } from '@duskmoon-dev/el-art-sun';
import { ElDmArtAtom, register as registerArtAtom } from '@duskmoon-dev/el-art-atom';
import { ElDmArtEclipse, register as registerArtEclipse } from '@duskmoon-dev/el-art-eclipse';
import { ElDmArtMountain, register as registerArtMountain } from '@duskmoon-dev/el-art-mountain';
import {
  ElDmArtPlasmaBall,
  register as registerArtPlasmaBall,
} from '@duskmoon-dev/el-art-plasma-ball';
import {
  ElDmArtCatStargazer,
  register as registerArtCatStargazer,
} from '@duskmoon-dev/el-art-cat-stargazer';
import {
  ElDmArtColorSpin,
  register as registerArtColorSpin,
} from '@duskmoon-dev/el-art-color-spin';
import {
  ElDmArtSynthwaveStarfield,
  register as registerArtSynthwaveStarfield,
} from '@duskmoon-dev/el-art-synthwave-starfield';
import {
  ElDmArtCircularGallery,
  register as registerArtCircularGallery,
} from '@duskmoon-dev/el-art-circular-gallery';
import { ElDmArtSnow, register as registerArtSnow } from '@duskmoon-dev/el-art-snow';

export {
  ElDmArtMoon,
  registerArtMoon,
  ElDmArtSun,
  registerArtSun,
  ElDmArtAtom,
  registerArtAtom,
  ElDmArtEclipse,
  registerArtEclipse,
  ElDmArtMountain,
  registerArtMountain,
  ElDmArtPlasmaBall,
  registerArtPlasmaBall,
  ElDmArtCatStargazer,
  registerArtCatStargazer,
  ElDmArtColorSpin,
  registerArtColorSpin,
  ElDmArtSynthwaveStarfield,
  registerArtSynthwaveStarfield,
  ElDmArtCircularGallery,
  registerArtCircularGallery,
  ElDmArtSnow,
  registerArtSnow,
};

export function registerAllArts(): void {
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
}
