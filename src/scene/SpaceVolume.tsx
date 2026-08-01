import { Line } from '@react-three/drei';
import type { AxisEvidence, SpaceDefinition } from '../domain/spaces';
import { DimensionGuide } from './DimensionGuide';
import { confidenceLineProps, confidencePrefix } from './confidenceStyle';
import { CM_TO_WORLD } from './measurements';

type EnvelopeSize = {
  width: number;
  height: number;
  depth: number;
};

function minimum(axis: AxisEvidence) {
  return axis.min_cm ?? axis.value_cm;
}

function maximum(axis: AxisEvidence) {
  return axis.max_cm ?? axis.value_cm;
}

function envelopeSize(space: SpaceDefinition, edge: 'minimum' | 'maximum'): EnvelopeSize {
  if (!space.dimensions) return { width: 0, height: 0, depth: 0 };
  const value = edge === 'minimum' ? minimum : maximum;
  return {
    width: value(space.dimensions.width) * CM_TO_WORLD,
    height: value(space.dimensions.height) * CM_TO_WORLD,
    depth: value(space.dimensions.depth) * CM_TO_WORLD,
  };
}

function axisSegments(
  size: EnvelopeSize,
  axis: 'width' | 'height' | 'depth',
): ReadonlyArray<readonly [number, number, number]> {
  const x = size.width / 2;
  const y = size.height;
  const z = size.depth / 2;

  if (axis === 'width') {
    return [
      [-x, 0, -z],
      [x, 0, -z],
      [-x, 0, z],
      [x, 0, z],
      [-x, y, -z],
      [x, y, -z],
      [-x, y, z],
      [x, y, z],
    ];
  }
  if (axis === 'height') {
    return [
      [-x, 0, -z],
      [-x, y, -z],
      [x, 0, -z],
      [x, y, -z],
      [-x, 0, z],
      [-x, y, z],
      [x, 0, z],
      [x, y, z],
    ];
  }
  return [
    [-x, 0, -z],
    [-x, 0, z],
    [x, 0, -z],
    [x, 0, z],
    [-x, y, -z],
    [-x, y, z],
    [x, y, -z],
    [x, y, z],
  ];
}

function evidenceLabel(axis: AxisEvidence): string {
  const prefix = confidencePrefix(axis.confidence);
  if (axis.min_cm !== undefined || axis.max_cm !== undefined) {
    const min = axis.min_cm ?? axis.value_cm;
    const max = axis.max_cm ?? axis.value_cm;
    return `${prefix}${min}–${max} cm`;
  }
  return `${prefix}${axis.value_cm} cm`;
}

function Envelope({
  space,
  size,
  opacity,
  fill,
}: {
  space: SpaceDefinition;
  size: EnvelopeSize;
  opacity: number;
  fill: boolean;
}) {
  if (!space.dimensions) return null;

  return (
    <group>
      {(['width', 'height', 'depth'] as const).map((axis) => (
        <Line
          key={axis}
          points={axisSegments(size, axis)}
          segments
          color="#5d90aa"
          transparent
          opacity={opacity}
          lineWidth={1}
          {...confidenceLineProps(space.dimensions![axis].confidence)}
        />
      ))}
      {fill && (
        <mesh position-y={size.height / 2}>
          <boxGeometry args={[size.width, size.height, size.depth]} />
          <meshBasicMaterial color="#5d90aa" transparent opacity={0.035} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

export function SpaceVolume({ space }: { space: SpaceDefinition }) {
  if (!space.dimensions) return null;

  const minSize = envelopeSize(space, 'minimum');
  const maxSize = envelopeSize(space, 'maximum');
  const hasRange =
    minSize.width !== maxSize.width ||
    minSize.height !== maxSize.height ||
    minSize.depth !== maxSize.depth;
  const gap = 0.14;

  return (
    <group position={space.placement}>
      <Envelope space={space} size={minSize} opacity={0.95} fill />
      {hasRange && <Envelope space={space} size={maxSize} opacity={0.42} fill={false} />}

      <DimensionGuide
        start={[-maxSize.width / 2, 0, maxSize.depth / 2 + gap]}
        end={[maxSize.width / 2, 0, maxSize.depth / 2 + gap]}
        label={evidenceLabel(space.dimensions.width)}
        color="#5d90aa"
        confidence={space.dimensions.width.confidence}
        labelOffset={[0, -0.095, 0]}
      />
      <DimensionGuide
        start={[maxSize.width / 2 + gap, 0, maxSize.depth / 2]}
        end={[maxSize.width / 2 + gap, maxSize.height, maxSize.depth / 2]}
        label={evidenceLabel(space.dimensions.height)}
        color="#5d90aa"
        confidence={space.dimensions.height.confidence}
        labelOffset={[0.12, 0, 0]}
      />
      <DimensionGuide
        start={[-maxSize.width / 2 - gap, 0, -maxSize.depth / 2]}
        end={[-maxSize.width / 2 - gap, 0, maxSize.depth / 2]}
        label={evidenceLabel(space.dimensions.depth)}
        color="#5d90aa"
        confidence={space.dimensions.depth.confidence}
        labelOffset={[-0.12, 0, 0]}
      />
    </group>
  );
}
