import * as THREE from 'three';
import { SCENE_COLORS } from '../design/tokens';
import type { Position3, SpaceDefinition } from '../domain/spaces';

type Size3 = readonly [number, number, number];

function Block({
  position,
  size,
  color,
  opacity = 1,
  rotation = [0, 0, 0],
  emissive,
}: {
  position: Position3;
  size: Size3;
  color: string;
  opacity?: number;
  rotation?: Position3;
  emissive?: string;
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[...size]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissive ? 0.45 : 0}
        roughness={0.78}
        transparent={opacity < 1}
        opacity={opacity}
        depthWrite={opacity >= 0.75}
      />
    </mesh>
  );
}

function Seat({
  position,
  color,
  kind,
  opacity = 1,
}: {
  position: Position3;
  color: string;
  kind: 'train' | 'plane';
  opacity?: number;
}) {
  const width = kind === 'train' ? 0.44 : 0.42;
  const backHeight = kind === 'train' ? 0.78 : 0.68;
  const cushionDepth = kind === 'train' ? 0.48 : 0.43;
  const baseHeight = kind === 'train' ? 0.48 : 0.46;

  return (
    <group position={position}>
      <Block
        position={[0, baseHeight, 0]}
        size={[width, 0.11, cushionDepth]}
        color={color}
        opacity={opacity}
      />
      <Block
        position={[0, baseHeight + backHeight / 2 - 0.01, -cushionDepth / 2 + 0.04]}
        size={[width, backHeight, 0.11]}
        color={color}
        opacity={opacity}
        rotation={[-0.08, 0, 0]}
      />
      <Block
        position={[0, baseHeight + backHeight - 0.01, -cushionDepth / 2 - 0.015]}
        size={[width * 0.72, 0.18, 0.13]}
        color={SCENE_COLORS.seatTrim}
        opacity={opacity}
        rotation={[-0.08, 0, 0]}
      />
      {[-1, 1].map((side) => (
        <Block
          key={side}
          position={[side * (width / 2 + 0.025), baseHeight + 0.12, 0]}
          size={[0.045, 0.065, cushionDepth * 0.72]}
          color={SCENE_COLORS.structure}
          opacity={opacity}
        />
      ))}
      {[-1, 1].map((side) => (
        <Block
          key={side}
          position={[side * width * 0.33, baseHeight / 2, 0.02]}
          size={[0.045, baseHeight - 0.06, 0.055]}
          color={SCENE_COLORS.structureMuted}
          opacity={opacity}
        />
      ))}
      {kind === 'plane' && (
        <Block
          position={[0, 0.22, 0.13]}
          size={[width * 0.88, 0.045, 0.055]}
          color={SCENE_COLORS.structure}
          opacity={opacity}
        />
      )}
    </group>
  );
}

function WindowRow({
  x,
  positions,
  width,
  height,
}: {
  x: number;
  positions: readonly number[];
  width: number;
  height: number;
}) {
  return (
    <>
      {positions.map((z) => (
        <Block
          key={z}
          position={[x, 1.16, z]}
          size={[0.028, height, width]}
          color={SCENE_COLORS.window}
          opacity={0.48}
          emissive={SCENE_COLORS.window}
        />
      ))}
    </>
  );
}

function CabinArch({
  radius,
  length,
  centerY,
}: {
  radius: number;
  length: number;
  centerY: number;
}) {
  return (
    <mesh position-y={centerY} rotation-x={Math.PI / 2}>
      <cylinderGeometry
        args={[
          radius,
          radius,
          length,
          32,
          1,
          true,
          Math.PI / 2,
          Math.PI / 2,
        ]}
      />
      <meshStandardMaterial
        color={SCENE_COLORS.structure}
        side={THREE.DoubleSide}
        transparent
        opacity={0.14}
        depthWrite={false}
        roughness={0.9}
      />
    </mesh>
  );
}

function ShinkansenCabin() {
  const rows = [
    { z: -1.15, opacity: 0.48 },
    { z: 0, opacity: 1 },
    { z: 1.15, opacity: 0.34 },
  ] as const;
  const seatXs = [0.55, 1.03, 1.51] as const;
  const windows = [-1.7, -0.55, 0.6, 1.75] as const;

  return (
    <group>
      <Block
        position={[0.82, -0.035, 0]}
        size={[2.12, 0.07, 4.7]}
        color={SCENE_COLORS.floor}
        opacity={0.92}
      />
      <Block
        position={[-0.08, 0.012, 0]}
        size={[0.4, 0.018, 4.55]}
        color={SCENE_COLORS.aisle}
        opacity={0.9}
      />
      <CabinArch radius={1.88} length={4.7} centerY={0.32} />
      <Block
        position={[1.86, 0.52, 0]}
        size={[0.06, 1.04, 4.7]}
        color={SCENE_COLORS.structure}
        opacity={0.16}
      />
      <WindowRow x={1.84} positions={windows} width={0.82} height={0.58} />

      {rows.flatMap((row) =>
        seatXs.map((x) => (
          <Seat
            key={`${x}-${row.z}`}
            position={[x, 0, row.z]}
            color={SCENE_COLORS.trainSeat}
            kind="train"
            opacity={row.opacity}
          />
        )),
      )}

      <Block
        position={[1.5, 1.4, 0]}
        size={[0.68, 0.065, 4.5]}
        color={SCENE_COLORS.structure}
        opacity={0.76}
      />
      <Block
        position={[1.15, 1.53, 0]}
        size={[0.04, 0.22, 4.5]}
        color={SCENE_COLORS.seatTrim}
        opacity={0.72}
      />
      {windows.map((z) => (
        <Block
          key={z}
          position={[1.5, 1.62, z]}
          size={[0.035, 0.38, 0.045]}
          color={SCENE_COLORS.structure}
        />
      ))}

      <Block
        position={[0.34, 2.12, 0]}
        size={[0.16, 0.035, 4.45]}
        color={SCENE_COLORS.window}
        opacity={0.74}
        emissive={SCENE_COLORS.window}
      />
      <Block
        position={[0.94, 1.08, 2.36]}
        size={[1.88, 2.16, 0.05]}
        color={SCENE_COLORS.structure}
        opacity={0.13}
      />
    </group>
  );
}

function PlaneCabin() {
  const rows = [
    { z: -1.15, opacity: 0.48 },
    { z: 0, opacity: 1 },
    { z: 1.15, opacity: 0.34 },
  ] as const;
  const seatXs = [0.48, 0.94, 1.4] as const;
  const windows = [-1.85, -0.92, 0.02, 0.96, 1.9] as const;

  return (
    <group>
      <Block
        position={[0.78, -0.035, 0]}
        size={[2.02, 0.07, 4.7]}
        color={SCENE_COLORS.floor}
        opacity={0.94}
      />
      <Block
        position={[-0.06, 0.012, 0]}
        size={[0.38, 0.018, 4.55]}
        color={SCENE_COLORS.aisle}
        opacity={0.9}
      />
      <CabinArch radius={1.78} length={4.7} centerY={0.54} />
      <WindowRow x={1.72} positions={windows} width={0.5} height={0.38} />

      {rows.flatMap((row) =>
        seatXs.map((x) => (
          <Seat
            key={`${x}-${row.z}`}
            position={[x, 0, row.z]}
            color={SCENE_COLORS.planeSeat}
            kind="plane"
            opacity={row.opacity}
          />
        )),
      )}

      <Block
        position={[1.42, 1.65, 0]}
        size={[0.7, 0.44, 4.5]}
        color={SCENE_COLORS.structure}
        opacity={0.28}
      />
      <Block
        position={[1.06, 1.53, 0]}
        size={[0.045, 0.2, 4.5]}
        color={SCENE_COLORS.seatTrim}
        opacity={0.64}
      />
      {windows.map((z) => (
        <Block
          key={z}
          position={[1.42, 1.65, z]}
          size={[0.72, 0.045, 0.035]}
          color={SCENE_COLORS.structureMuted}
          opacity={0.82}
        />
      ))}

      <Block
        position={[0.3, 2.2, 0]}
        size={[0.15, 0.035, 4.45]}
        color={SCENE_COLORS.window}
        opacity={0.78}
        emissive={SCENE_COLORS.window}
      />
      <Block
        position={[0.89, 1.08, 2.36]}
        size={[1.78, 2.16, 0.05]}
        color={SCENE_COLORS.structure}
        opacity={0.12}
      />
    </group>
  );
}

export function TravelEnvironment({ space }: { space: SpaceDefinition }) {
  if (space.category === 'Shinkansen') return <ShinkansenCabin />;
  if (space.category === 'Plane') return <PlaneCabin />;
  return null;
}
