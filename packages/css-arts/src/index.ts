export { ElDmArtMoon, register as registerArtMoon } from '@duskmoon-dev/el-art-moon';
export { ElDmArtSun, register as registerArtSun } from '@duskmoon-dev/el-art-sun';
export { ElDmArtAtom, register as registerArtAtom } from '@duskmoon-dev/el-art-atom';
export { ElDmArtEclipse, register as registerArtEclipse } from '@duskmoon-dev/el-art-eclipse';
export { ElDmArtMountain, register as registerArtMountain } from '@duskmoon-dev/el-art-mountain';
export { ElDmArtPlasmaBall, register as registerArtPlasmaBall } from '@duskmoon-dev/el-art-plasma-ball';
export { ElDmArtCatStargazer, register as registerArtCatStargazer } from '@duskmoon-dev/el-art-cat-stargazer';
export { ElDmArtColorSpin, register as registerArtColorSpin } from '@duskmoon-dev/el-art-color-spin';
export { ElDmArtSynthwaveStarfield, register as registerArtSynthwaveStarfield } from '@duskmoon-dev/el-art-synthwave-starfield';
export { ElDmArtCircularGallery, register as registerArtCircularGallery } from '@duskmoon-dev/el-art-circular-gallery';
export { ElDmArtSnow, register as registerArtSnow } from '@duskmoon-dev/el-art-snow';

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
