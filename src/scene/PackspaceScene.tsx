import {
  CameraControls,
  Grid,
  OrthographicCamera,
  PerspectiveCamera,
} from '@react-three/drei';
import type { CameraControls as CameraControlsRef } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useRef, type RefObject } from 'react';
import { SCENE_COLORS } from '../design/tokens';
import type {
  CameraView,
  SceneFraming,
  SpaceDefinition,
} from '../domain/spaces';
import { HumanReference } from './HumanReference';
import { ObjectBox, type SceneObject } from './ObjectBox';
import { SpaceVolume } from './SpaceVolume';
import { TravelEnvironment } from './TravelEnvironment';

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
  const viewportWidth = useThree((state) => state.size.width);
  const orthographicWidth = view === 'front' ? 4.2 : 5.8;
  const orthographicZoom = viewportWidth / orthographicWidth;
  const cameraPosition = [...framing.views[view]] as [number, number, number];

  useEffect(() => {
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
          position={cameraPosition}
          zoom={orthographicZoom}
          near={0.05}
          far={100}
        />
      ) : (
        <PerspectiveCamera
          makeDefault
          position={cameraPosition}
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

interface PackspaceSceneProps {
  controlsRef: RefObject<CameraControlsRef | null>;
  object: SceneObject | null;
  space: SpaceDefinition;
  framing?: SceneFraming;
  projection?: CameraProjection;
  reducedMotion?: boolean;
  view?: CameraView;
}

export function PackspaceScene({
  controlsRef,
  object,
  space,
  framing = space.framing,
  projection = 'perspective',
  reducedMotion = false,
  view = 'free',
}: PackspaceSceneProps) {
  return (
    <Canvas dpr={[1, 2]}>
      <color attach="background" args={[SCENE_COLORS.canvas]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[2.5, 4, 2.5]} intensity={1.25} />

      <mesh rotation-x={-Math.PI / 2} position-y={-0.01}>
        <planeGeometry args={[16, 16]} />
        <meshBasicMaterial color={SCENE_COLORS.canvasDeep} />
      </mesh>
      <Grid
        args={[14, 14]}
        position-y={0.02}
        cellSize={0.1}
        cellThickness={0.45}
        cellColor={SCENE_COLORS.gridMinor}
        sectionSize={0.5}
        sectionThickness={0.8}
        sectionColor={SCENE_COLORS.gridMajor}
        fadeDistance={10}
        fadeStrength={1.4}
        infiniteGrid
      />

      <TravelEnvironment space={space} />
      <HumanReference
        positionX={space.category === 'Reference' ? -1.05 : 0}
        positionZ={space.category === 'Reference' ? 0 : 0.85}
      />
      <SpaceVolume space={space} />
      {object && (
        <ObjectBox
          object={object}
          basePosition={space.placement}
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
    </Canvas>
  );
}
