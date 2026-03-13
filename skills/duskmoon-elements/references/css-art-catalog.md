# CSS Art Catalog

11 pure CSS art element packages.

## All Packages

| Package | Tag | Class | Extra Properties |
|---------|-----|-------|-----------------|
| `@duskmoon-dev/el-art-atom` | `<el-dm-art-atom>` | `ElDmArtAtom` | `size` |
| `@duskmoon-dev/el-art-cat-stargazer` | `<el-dm-art-cat-stargazer>` | `ElDmArtCatStargazer` | `size` |
| `@duskmoon-dev/el-art-circular-gallery` | `<el-dm-art-circular-gallery>` | `ElDmArtCircularGallery` | `size`, `title`, `count` |
| `@duskmoon-dev/el-art-color-spin` | `<el-dm-art-color-spin>` | `ElDmArtColorSpin` | `size` |
| `@duskmoon-dev/el-art-eclipse` | `<el-dm-art-eclipse>` | `ElDmArtEclipse` | `size` |
| `@duskmoon-dev/el-art-moon` | `<el-dm-art-moon>` | `ElDmArtMoon` | `size`, `variant`, `glow` |
| `@duskmoon-dev/el-art-mountain` | `<el-dm-art-mountain>` | `ElDmArtMountain` | `size`, `variant` |
| `@duskmoon-dev/el-art-plasma-ball` | `<el-dm-art-plasma-ball>` | `ElDmArtPlasmaBall` | `size` |
| `@duskmoon-dev/el-art-snow` | `<el-dm-art-snow>` | `ElDmArtSnow` | `count`, `unicode`, `fall` |
| `@duskmoon-dev/el-art-sun` | `<el-dm-art-sun>` | `ElDmArtSun` | `size`, `variant`, `rays` |
| `@duskmoon-dev/el-art-synthwave-starfield` | `<el-dm-art-synthwave-starfield>` | `ElDmArtSynthwaveStarfield` | `size`, `paused` |

## Property Reference

### Shared

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `size` | String | `'md'` | Size modifier — maps to CSS class `art-{name}-{size}` |

### Per-Element

| Element | Property | Type | Description |
|---------|----------|------|-------------|
| `el-dm-art-moon` | `variant` | String | Moon phase/style variant |
| `el-dm-art-moon` | `glow` | Boolean | Enable glow effect |
| `el-dm-art-mountain` | `variant` | String | Mountain style variant |
| `el-dm-art-sun` | `variant` | String | Sun style variant |
| `el-dm-art-sun` | `rays` | Boolean | Show sun rays |
| `el-dm-art-snow` | `count` | Number | Number of snowflakes |
| `el-dm-art-snow` | `unicode` | Boolean | Use unicode snowflake characters |
| `el-dm-art-snow` | `fall` | Boolean | Enable falling animation |
| `el-dm-art-circular-gallery` | `title` | String | Gallery title text |
| `el-dm-art-circular-gallery` | `count` | Number | Number of items |
| `el-dm-art-synthwave-starfield` | `paused` | Boolean | Pause the animation |
