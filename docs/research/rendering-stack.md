# Rendering Stack Research: React + Vite + R3F vs Vanilla Three.js + Vite

_Research date: 2026-08-01 · Repo: berndpl/Packspace · Issue: #3_

## Background

Packspace renders a single bounding-box object inside one of a handful of static 3D environments, with a 168 cm human figure for scale, a grid/ruler overlay, and dimension labels. The UI chrome (environment dropdown, payload input, verdict readout) lives alongside the canvas. The app must ship as a fully static bundle to GitHub Pages at `https://berndpl.github.io/Packspace/`.

Two candidate stacks:

| | **Option A** | **Option B** |
|---|---|---|
| Stack | React 19 + Vite 5 + `@react-three/fiber` + `@react-three/drei` | Vanilla three.js + Vite 5 (no React for the canvas) |
| Scene authored via | JSX declarative scene graph | Imperative JS |

---

## 1. Camera Controls: Orbit/Pan + Snap-to-View

### Option A — R3F + drei `<CameraControls>`

drei ships `<CameraControls>` which wraps the [`camera-controls`](https://github.com/yomotsu/camera-controls) library (pinned to `^3.1.0` in drei's `package.json`). Source confirmed active:
[`pmndrs/drei/src/core/CameraControls.tsx`](https://github.com/pmndrs/drei/blob/master/src/core/CameraControls.tsx)

Usage:
```tsx
import { CameraControls } from '@react-three/drei'
const ref = useRef<CameraControls>(null)

// Snap to front view (animated)
ref.current?.setLookAt(0, 1.5, 5, 0, 1.5, 0, true) // true = animate
ref.current?.rotateTo(0, Math.PI / 2, true)         // top view

<Canvas>
  <CameraControls ref={ref} makeDefault />
  …
</Canvas>
```

`makeDefault` registers the controls with R3F's internal state so every frame update is handled automatically. Snap-to-view buttons in the React UI simply call `ref.current.setLookAt(…, true)` — the `camera-controls` library eases the camera position smoothly.

OrbitControls is also available from drei (`import { OrbitControls } from '@react-three/drei'`) wrapping `three-stdlib`'s OrbitControls, but it lacks built-in animated transitions. **CameraControls is the right pick.**

### Option B — Vanilla three.js

`OrbitControls` is available via `three/addons/controls/OrbitControls.js` ([three.js docs](https://threejs.org/docs/#examples/en/controls/OrbitControls)). Orbit and pan work out of the box. Snap-to-view with animation requires a manual lerp loop:

```js
// Must implement by hand:
function animateCameraTo(targetPos, targetLookAt) {
  const startPos = camera.position.clone()
  const startLookAt = controls.target.clone()
  let t = 0
  function tick(delta) {
    t = Math.min(t + delta * 2, 1)
    camera.position.lerpVectors(startPos, targetPos, easeInOut(t))
    controls.target.lerpVectors(startLookAt, targetLookAt, easeInOut(t))
    controls.update()
    if (t < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
```

No off-the-shelf animated camera transition in vanilla three.js without pulling in `camera-controls` yourself — which you'd need to install, initialise, and sync with your render loop manually.

**Verdict: R3F + drei is ~30 lines vs ~0 lines for snap-to-view.**

---

## 2. Grid / Ruler Overlay and Text Labels

### Option A — drei `<Grid>` + `<Text>`

`<Grid>` is a custom GLSL shader mesh with props for `cellSize`, `sectionSize`, `cellColor`, `sectionColor`, `infiniteGrid`, `followCamera`, `fadeDistance`. Source:
[`pmndrs/drei/src/core/Grid.tsx`](https://github.com/pmndrs/drei/blob/master/src/core/Grid.tsx)

```tsx
<Grid args={[20, 20]} cellSize={0.1} sectionSize={1} sectionColor="#888" cellColor="#ccc" />
```

`<Text>` (also exported from drei, backed by `troika-three-text ^0.52.4`) renders SDF anti-aliased text directly in the 3D scene — ideal for dimension labels that face the camera:

```tsx
import { Text } from '@react-three/drei'
<Text position={[0, 2, 0]} fontSize={0.12} color="white">168 cm</Text>
```

### Option B — Vanilla three.js

- `THREE.GridHelper` works but offers limited styling (no fade, no custom shaders).
- Text labels require either `CSS2DObject` / `CSS3DObject` (HTML overlays positioned via three.js projection) or a third-party library like `troika-three-text` wired up imperatively.

**Verdict: drei provides production-quality Grid and Text with zero setup; vanilla requires more wiring.**

---

## 3. UI State ↔ 3D Scene Synchronisation

The UI chrome (environment selector, payload input, verdict) will be in React. The critical question is how React state flows into the 3D scene.

### Option A (R3F)

Everything is in the same React tree. A `zustand` store (or React context) holds `{ environment, boxDimensions, verdict }`. 3D scene components subscribe to the same store and re-render reactively:

```tsx
const environment = useStore(s => s.environment)
return environment === 'shinkansen' ? <ShinkansenScene /> : <PlaneScene />
```

No bridge code needed. React reconciler handles scene-graph diffing.

### Option B (Vanilla)

React manages the HTML UI. The three.js scene lives in an imperative module. You need a manual bridge:

```js
// In React component:
useEffect(() => {
  sceneManager.setEnvironment(selectedEnvironment)
}, [selectedEnvironment])

// In scene manager:
export function setEnvironment(env) {
  scene.remove(currentEnv)
  currentEnv = buildEnvironment(env)
  scene.add(currentEnv)
}
```

This is manageable at small scale but grows fragile as state interactions increase (e.g., environment changes that also reset camera, box that needs re-fitting logic, etc.).

**Verdict: R3F eliminates the manual bridge entirely. The gain is modest now but compounds over the project lifetime.**

---

## 4. Bundle Size and Complexity

| Package | Approx. minzipped | Notes |
|---|---|---|
| `three` | ~170 KB | Baseline for both options |
| `@react-three/fiber` | ~15 KB | React renderer, tree-shaken |
| `@react-three/drei` (relevant exports only) | ~30–60 KB | `<Grid>`, `<Text>`, `<CameraControls>`, `<Box>` — each tree-shaken |
| React 19 + ReactDOM | ~45 KB | Required for UI in both options |
| `camera-controls` | ~20 KB | Bundled in drei; peer in vanilla |

Total overhead of R3F + drei over vanilla: **~45–75 KB minzipped** on a base of ~170 KB three.js. For a 3D app whose three.js payload alone dominates, this is negligible. Three.js itself is irreducible.

Source: bundlephobia estimates for `@react-three/fiber@9` and drei individual exports.

---

## 5. GitHub Pages Static Deployment

Both options build to a fully static bundle with Vite. The only configuration needed is `base`:

```js
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Packspace/',       // matches https://berndpl.github.io/Packspace/
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
})
```

- `base` is documented at [vite.dev/config/shared-options.html#base](https://vite.dev/config/shared-options.html#base).
- All asset URLs (`/assets/index.js`, etc.) are prefixed with `/Packspace/` automatically.
- A `gh-pages` action deploys the `dist/` folder. No server required — R3F and drei run entirely client-side in WebGL.

---

## 6. Current Versions and Compatibility

| Package | Current version | Source |
|---|---|---|
| `three` | **0.185.1** | [`mrdoob/three.js:package.json`](https://raw.githubusercontent.com/mrdoob/three.js/master/package.json) |
| `@react-three/fiber` | **9.7.0** | [`pmndrs/react-three-fiber:packages/fiber/package.json`](https://raw.githubusercontent.com/pmndrs/react-three-fiber/master/packages/fiber/package.json) |
| `@react-three/drei` | **9.x** (semantic-release) | [`pmndrs/drei:package.json`](https://raw.githubusercontent.com/pmndrs/drei/master/package.json) |
| `camera-controls` | **^3.1.0** (drei runtime dep) | drei package.json |
| `vite` | **^5.4.11** (drei devDeps) | drei package.json |
| `@vitejs/plugin-react` | **^4.3.3** | drei package.json |
| `react` / `react-dom` | **^19.0.0** | r3f peer, drei peer |

### Compatibility pitfalls

- **React version**: r3f 9.x requires `react >= 19 <19.3` (strict upper bound). Use React 19.x; React 18 requires r3f 8.x.
- **three.js version**: r3f 9 requires `three >= 0.156`; drei requires `three >= 0.159`. Pin to `^0.185.1`.
- **drei is not on a published semver version** in its package.json (uses semantic-release); install by `npm install @react-three/drei` which resolves the latest published version from npm.
- **HMR + drei**: drei components use `extend()` to register three.js constructors; works fine with Vite's HMR in development.

---

## Recommendation

**Use React 19 + Vite 5 + `@react-three/fiber` 9 + `@react-three/drei`.**

Reasons:
1. **`<CameraControls ref={...}>` from drei** delivers orbit, pan, and animated snap-to-view with a single component and two lines of code per snap button — built on `camera-controls` v3, actively maintained.
2. **`<Grid>` and `<Text>` from drei** provide the grid overlay and 3D dimension labels with no extra implementation work.
3. **Unified React tree** keeps UI state and 3D scene in sync without a manual bridge layer.
4. **Fully static build** — Vite with `base: '/Packspace/'` is the only config change needed.
5. Bundle overhead is negligible relative to three.js itself.

### Exact package set to install

```bash
npm create vite@latest . -- --template react-ts
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
```

Resolved pinned versions:
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "three": "^0.185.0",
    "@react-three/fiber": "^9.7.0",
    "@react-three/drei": "^9.0.0"
  },
  "devDependencies": {
    "@types/three": "^0.159.0",
    "@vitejs/plugin-react": "^4.3.3",
    "vite": "^5.4.0"
  }
}
```

### Vite config for GitHub Pages

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Packspace/',
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
})
```

Deploy via GitHub Actions: checkout → `npm ci` → `npm run build` → deploy `dist/` to `gh-pages` branch.

---

## Version correction (verified against the npm registry, 2026-08-01)

The version numbers above were partly wrong. Verified against `npm view`:

| Package | Claimed | **Actual** | Note |
|---|---|---|---|
| `three` | 0.185.1 | **0.185.1** ✓ | `latest` is stable |
| `@react-three/fiber` | 9.7.0 | **9.6.1** | 9.7.0 does not exist. `latest` on npm is `10.0.0-canary.f046a54` — a canary, **do not install `@latest`**. Highest stable is 9.6.1. |
| `@react-three/drei` | — | **10.7.7** | peers: `@react-three/fiber ^9.0.0`, `react ^19`, `react-dom ^19`, `three >=0.159` — compatible with fiber 9.6.1 |
| `react` / `react-dom` | ^19 | **19.2.8** | fiber 9.6.1 peer range is `>=19.0 <19.3`, so 19.2.8 fits and **19.3 will break it** |
| `vite` | 5.x | **8.1.5** | `latest` on npm is `8.2.0-beta.0` — a beta, **do not install `@latest`**. Highest stable is 8.1.5. |

**Install with pinned ranges, not `@latest`:**

```bash
npm install three@^0.185.1 @react-three/fiber@^9.6.1 @react-three/drei@^10.7.7 react@^19.2.8 react-dom@^19.2.8
npm install -D vite@^8.1.5 @vitejs/plugin-react @types/three
```

**Pitfall to carry into the scaffold ticket:** `@react-three/fiber`'s React peer is `>=19.0 <19.3`. React 19.3 is already in `next`, so pin React rather than floating it.
