import {
  CameraControls,
  Grid,
  OrthographicCamera,
  PerspectiveCamera,
} from '@react-three/drei';
import type { CameraControls as CameraControlsRef } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import {
  SCENE_COLORS,
  type ScenePalette,
} from '../design/tokens';
import type {
  CameraView,
  SceneFraming,
  SpaceDefinition,
} from '../domain/spaces';
import { HumanReference } from './HumanReference';
import { ObjectBox, type SceneObject } from './ObjectBox';
import { dimensionsToWorld } from './measurements';
import { SpaceVolume } from './SpaceVolume';
import { TravelEnvironment } from './TravelEnvironment';
import {
  isObjectUsablyVisible,
  type ScreenPoint,
  type ScreenRect,
} from './visibility';

export type { CameraView } from '../domain/spaces';
export type CameraProjection = 'perspective' | 'orthographic';

export async function snapCamera(
  controls: CameraControlsRef | null,
  view: CameraView,
  framing: SceneFraming,
  animated = true,
) {
  if (!controls) return;

  const [cameraX, cameraY, cameraZ] = framing.views[view];
  const [targetX, targetY, targetZ] = framing.target;
  await controls.setLookAt(
    cameraX,
    cameraY,
    cameraZ,
    targetX,
    targetY,
    targetZ,
    animated,
  );
}

interface CameraRigProps {
  controlsRef: RefObject<CameraControlsRef | null>;
  framing: SceneFraming;
  projection: CameraProjection;
  reducedMotion: boolean;
  view: CameraView;
}

function CameraRig({
  controlsRef,
  framing,
  projection,
  reducedMotion,
  view,
}: CameraRigProps) {
  const initialized = useRef(false);
  const previousCommand = useRef({ projection, view });
  const cameraStart = useRef({
    projection,
    position: [...framing.views[view]] as [number, number, number],
  });
  const viewportWidth = useThree((state) => state.size.width);
  const orthographicWidth = view === 'front' ? 4.2 : 5.8;
  const orthographicZoom = viewportWidth / orthographicWidth;

  if (cameraStart.current.projection !== projection) {
    cameraStart.current = {
      projection,
      position: [...framing.views[view]] as [number, number, number],
    };
  }

  useEffect(() => {
    const commandChanged =
      previousCommand.current.projection !== projection ||
      previousCommand.current.view !== view;
    previousCommand.current = { projection, view };

    // Environment framing may change without replacing the viewer's live camera.
    if (initialized.current && !commandChanged) return;

    void snapCamera(
      controlsRef.current,
      view,
      framing,
      initialized.current && !reducedMotion,
    );
    initialized.current = true;
  }, [controlsRef, framing, projection, reducedMotion, view]);

  return (
    <>
      {projection === 'orthographic' ? (
        <OrthographicCamera
          makeDefault
          position={cameraStart.current.position}
          zoom={orthographicZoom}
          near={0.05}
          far={100}
        />
      ) : (
        <PerspectiveCamera
          makeDefault
          position={cameraStart.current.position}
          fov={38}
          near={0.05}
          far={100}
        />
      )}
      <CameraControls
        key={projection}
        ref={controlsRef}
        makeDefault
        minDistance={1.25}
        maxDistance={12}
        smoothTime={reducedMotion ? 0.01 : 0.32}
        truckSpeed={1.4}
      />
    </>
  );
}

const OBSTRUCTION_SELECTOR = [
  '.object-panel',
  '.space-control-panel',
  '.verdict-panel',
  '.theme-switcher',
].join(',');

function toScreenRect(rect: DOMRect): ScreenRect {
  return {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
  };
}

function projectPoint(
  point: THREE.Vector3,
  camera: THREE.Camera,
  canvas: DOMRect,
): ScreenPoint | null {
  const viewPoint = point.clone().applyMatrix4(camera.matrixWorldInverse);
  if (viewPoint.z >= 0) return null;

  const projected = point.clone().project(camera);
  return {
    x: canvas.left + ((projected.x + 1) / 2) * canvas.width,
    y: canvas.top + ((1 - projected.y) / 2) * canvas.height,
  };
}

function objectScreenBounds(
  object: SceneObject,
  space: SpaceDefinition,
  camera: THREE.Camera,
  canvas: DOMRect,
) {
  const dimensions = dimensionsToWorld(object.dimensions);
  const transform = new THREE.Matrix4().compose(
    new THREE.Vector3(...space.placement),
    new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      space.rotationY ?? 0,
    ),
    new THREE.Vector3(1, 1, 1),
  );
  const centerWorld = new THREE.Vector3(0, dimensions.height / 2, 0).applyMatrix4(
    transform,
  );
  const center = projectPoint(centerWorld, camera, canvas);
  if (!center) return null;

  const x = dimensions.width / 2;
  const z = dimensions.depth / 2;
  const corners = [0, dimensions.height].flatMap((y) =>
    [-x, x].flatMap((cornerX) =>
      [-z, z].map((cornerZ) =>
        new THREE.Vector3(cornerX, y, cornerZ).applyMatrix4(transform),
      ),
    ),
  );
  const projectedCorners = corners
    .map((corner) => projectPoint(corner, camera, canvas))
    .filter((point): point is ScreenPoint => point !== null);
  if (projectedCorners.length === 0) return null;

  const horizontal = projectedCorners.map((point) => point.x);
  const vertical = projectedCorners.map((point) => point.y);
  const minWidth = 4;
  const minHeight = 4;
  const left = Math.min(...horizontal);
  const right = Math.max(...horizontal);
  const top = Math.min(...vertical);
  const bottom = Math.max(...vertical);

  return {
    center,
    rect: {
      left: right - left < minWidth ? center.x - minWidth / 2 : left,
      right: right - left < minWidth ? center.x + minWidth / 2 : right,
      top: bottom - top < minHeight ? center.y - minHeight / 2 : top,
      bottom: bottom - top < minHeight ? center.y + minHeight / 2 : bottom,
    },
  };
}

function ObjectVisibilityGuard({
  controlsRef,
  framing,
  object,
  reducedMotion,
  space,
  view,
  onFallbackView,
}: {
  controlsRef: RefObject<CameraControlsRef | null>;
  framing: SceneFraming;
  object: SceneObject | null;
  reducedMotion: boolean;
  space: SpaceDefinition;
  view: CameraView;
  onFallbackView?: (view: CameraView) => void;
}) {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const previousSpaceId = useRef(space.id);
  const latest = useRef({
    controlsRef,
    framing,
    object,
    onFallbackView,
    reducedMotion,
    space,
    view,
  });
  latest.current = {
    controlsRef,
    framing,
    object,
    onFallbackView,
    reducedMotion,
    space,
    view,
  };

  useEffect(() => {
    const environmentChanged = previousSpaceId.current !== space.id;
    previousSpaceId.current = space.id;
    if (!environmentChanged) return;

    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        const current = latest.current;
        if (!current.object) return;

        camera.updateMatrixWorld();
        camera.updateProjectionMatrix();

        const canvas = gl.domElement.getBoundingClientRect();
        const bounds = objectScreenBounds(
          current.object,
          current.space,
          camera,
          canvas,
        );
        const obstructions = Array.from(
          document.querySelectorAll<HTMLElement>(OBSTRUCTION_SELECTOR),
        )
          .filter((element) => {
            const style = window.getComputedStyle(element);
            return style.display !== 'none' && style.visibility !== 'hidden';
          })
          .map((element) => toScreenRect(element.getBoundingClientRect()));
        const visible =
          bounds !== null &&
          isObjectUsablyVisible({
            canvas: toScreenRect(canvas),
            center: bounds.center,
            object: bounds.rect,
            obstructions,
          });

        if (visible) return;

        const fallbackView = current.view === 'free' ? 'front' : current.view;
        if (fallbackView !== current.view && current.onFallbackView) {
          current.onFallbackView(fallbackView);
          return;
        }

        void snapCamera(
          current.controlsRef.current,
          fallbackView,
          current.framing,
          !current.reducedMotion,
        );
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [camera, gl, space.id]);

  return null;
}

interface PackspaceSceneProps {
  controlsRef: RefObject<CameraControlsRef | null>;
  object: SceneObject | null;
  palette?: ScenePalette;
  space: SpaceDefinition;
  framing?: SceneFraming;
  projection?: CameraProjection;
  reducedMotion?: boolean;
  view?: CameraView;
  onFallbackView?: (view: CameraView) => void;
}

export function PackspaceScene({
  controlsRef,
  object,
  palette = SCENE_COLORS,
  space,
  framing = space.framing,
  projection = 'perspective',
  reducedMotion = false,
  view = 'free',
  onFallbackView,
}: PackspaceSceneProps) {
  return (
    <Canvas dpr={[1, 2]}>
      <color attach="background" args={[palette.canvas]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[2.5, 4, 2.5]} intensity={1.25} />

      <mesh rotation-x={-Math.PI / 2} position-y={-0.01}>
        <planeGeometry args={[16, 16]} />
        <meshBasicMaterial color={palette.canvasDeep} />
      </mesh>
      <Grid
        args={[14, 14]}
        position-y={0.02}
        cellSize={0.1}
        cellThickness={0.45}
        cellColor={palette.gridMinor}
        sectionSize={0.5}
        sectionThickness={0.8}
        sectionColor={palette.gridMajor}
        fadeDistance={10}
        fadeStrength={1.4}
        infiniteGrid
      />

      <TravelEnvironment palette={palette} space={space} />
      <HumanReference
        color={palette.human}
        positionX={space.category === 'Reference' ? -1.05 : 0}
        positionZ={space.category === 'Reference' ? 0 : 0.85}
      />
      <SpaceVolume color={palette.space} space={space} />
      {object && (
        <ObjectBox
          object={object}
          basePosition={space.placement}
          labelColor={palette.textStrong}
          rotationY={space.rotationY}
        />
      )}
      <CameraRig
        controlsRef={controlsRef}
        framing={framing}
        projection={projection}
        reducedMotion={reducedMotion}
        view={view}
      />
      <ObjectVisibilityGuard
        controlsRef={controlsRef}
        framing={framing}
        object={object}
        reducedMotion={reducedMotion}
        space={space}
        view={view}
        onFallbackView={onFallbackView}
      />
    </Canvas>
  );
}
