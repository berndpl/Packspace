import { CameraControls, Grid } from '@react-three/drei';
import type { CameraControls as CameraControlsRef } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useEffect, type RefObject } from 'react';
import type {
  CameraView,
  SceneFraming,
  SpaceDefinition,
} from '../domain/spaces';
import { HumanReference } from './HumanReference';
import { ObjectBox, type SceneObject } from './ObjectBox';
import { SpaceVolume } from './SpaceVolume';

export type { CameraView } from '../domain/spaces';

export async function snapCamera(
  controls: CameraControlsRef | null,
  view: CameraView,
  framing: SceneFraming,
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
    true,
  );
}

interface CameraRigProps {
  controlsRef: RefObject<CameraControlsRef | null>;
  framing: SceneFraming;
}

function CameraRig({ controlsRef, framing }: CameraRigProps) {
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const [cameraX, cameraY, cameraZ] = framing.views.free;
    const [targetX, targetY, targetZ] = framing.target;
    void controls.setLookAt(
      cameraX,
      cameraY,
      cameraZ,
      targetX,
      targetY,
      targetZ,
      false,
    );
  }, [controlsRef, framing]);

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      minDistance={1.25}
      maxDistance={8}
      smoothTime={0.32}
      truckSpeed={1.4}
    />
  );
}

interface PackspaceSceneProps {
  controlsRef: RefObject<CameraControlsRef | null>;
  object: SceneObject | null;
  space: SpaceDefinition;
  framing?: SceneFraming;
}

export function PackspaceScene({
  controlsRef,
  object,
  space,
  framing = space.framing,
}: PackspaceSceneProps) {
  return (
    <Canvas
      camera={{
        position: [...framing.views.free],
        fov: 38,
        near: 0.05,
        far: 100,
      }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#0a1622']} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[2.5, 4, 2.5]} intensity={1.25} />

      <mesh rotation-x={-Math.PI / 2} position-y={-0.002}>
        <planeGeometry args={[12, 12]} />
        <meshBasicMaterial color="#0a1622" />
      </mesh>
      <Grid
        args={[10, 10]}
        position-y={0}
        cellSize={0.1}
        cellThickness={0.45}
        cellColor="#183247"
        sectionSize={0.5}
        sectionThickness={0.8}
        sectionColor="#2f6d89"
        fadeDistance={8}
        fadeStrength={1.4}
        infiniteGrid
      />

      <HumanReference />
      <SpaceVolume space={space} />
      {object && <ObjectBox object={object} basePosition={space.placement} />}
      <CameraRig controlsRef={controlsRef} framing={framing} />
    </Canvas>
  );
}
